import { readValue } from './project.js';

export const TECHNICAL_MODEL_PROFILE=Object.freeze({
  id:'townhouse-parametric-v1.0',
  level:'preliminary',
  defaults:{
    floorHeightM:3.4,
    slabThicknessMm:120,
    wallThicknessMm:100,
    maxLongitudinalBayM:3.8,
    maxTransverseBayM:4.5,
  },
});

export function buildTechnicalModel(project,areas) {
  const width=positive(readValue(project,'land.widthM',0),'land.widthM');
  const landLength=positive(readValue(project,'land.lengthM',0),'land.lengthM');
  const storeys=Math.max(1,Math.round(positive(readValue(project,'design.storeys',1),'design.storeys')));
  const footprintArea=positive(areas?.footprint?.value,'footprint area');
  const floorArea=positive(areas?.floorArea?.value,'floor area');
  const cfg=TECHNICAL_MODEL_PROFILE.defaults;
  const footprintWidth=width;
  const footprintLength=Math.min(landLength,footprintArea/footprintWidth);
  const floorHeight=numberOr(readValue(project,'design.floorHeightM',null),cfg.floorHeightM);
  const longBays=Math.max(2,Math.ceil(footprintLength/cfg.maxLongitudinalBayM));
  const transBays=Math.max(1,Math.ceil(footprintWidth/cfg.maxTransverseBayM));
  const longSpan=round(footprintLength/longBays,3);
  const transSpan=round(footprintWidth/transBays,3);
  const columnLines=(longBays+1)*(transBays+1);
  const elevatedLevels=storeys;
  const beamSegmentsPerLevel=(transBays+1)*longBays+(longBays+1)*transBays;
  const beamLengthPerLevel=(transBays+1)*footprintLength+(longBays+1)*footprintWidth;
  const lowerStoreys=Math.ceil(storeys/2);
  const upperStoreys=storeys-lowerStoreys;
  const bathrooms=Math.max(1,Math.ceil(Number(readValue(project,'household.bedrooms',3))/2));
  const bedrooms=Math.max(1,Number(readValue(project,'household.bedrooms',3)));
  const people=Math.max(1,Number(readValue(project,'household.people',4)));
  const roomSchedule=buildRoomSchedule(project,storeys,bedrooms);
  const wall=wallModel({footprintWidth,footprintLength,floorHeight,storeys,floorArea,roomSchedule});
  const electrical=electricalModel({storeys,bedrooms,roomSchedule,floorArea});
  const plumbing=plumbingModel({storeys,bathrooms,people});
  const hvac=hvacModel({bedrooms,roomSchedule});

  const slabs=Array.from({length:elevatedLevels},(_,index)=>({
    id:index===elevatedLevels-1?'S-ROOF':'S-'+(index+2),
    level:index===elevatedLevels-1?'Mái':'Sàn tầng '+(index+2),
    quantity:1,
    areaM2:round(footprintArea,2),
    thicknessMm:cfg.slabThicknessMm,
    concreteGrade:'B25',
    reinforcement:{
      bottom:{diameterMm:10,spacingMm:200,directions:2},
      supportTop:{diameterMm:10,spacingMm:200,equivalentAreaFactor:0.5},
    },
    basis:'parametric-preliminary',
  }));

  const beams=[
    {
      id:'B1',levels:elevatedLevels,quantity:beamSegmentsPerLevel*elevatedLevels,
      totalLengthM:round(beamLengthPerLevel*elevatedLevels,2),
      bMm:200,hMm:Math.max(400,roundTo50(Math.max(longSpan,transSpan)*1000/10)),
      concreteGrade:'B25',
      mainBars:{count:4,diameterMm:18},
      extraTop:{count:2,diameterMm:16,lengthFactor:0.35},
      stirrups:{diameterMm:8,spacingMm:150},
      basis:'parametric-preliminary',
    },
  ];

  const columns=[];
  if (lowerStoreys>0) columns.push({
    id:'C1',storeys:lowerStoreys,quantity:columnLines*lowerStoreys,
    segmentHeightM:floorHeight,bMm:250,hMm:300,concreteGrade:'B25',
    verticalBars:{count:8,diameterMm:18},ties:{diameterMm:8,spacingMm:150},
    basis:'parametric-preliminary',
  });
  if (upperStoreys>0) columns.push({
    id:'C2',storeys:upperStoreys,quantity:columnLines*upperStoreys,
    segmentHeightM:floorHeight,bMm:250,hMm:250,concreteGrade:'B25',
    verticalBars:{count:8,diameterMm:16},ties:{diameterMm:8,spacingMm:150},
    basis:'parametric-preliminary',
  });

  const foundations=[{
    id:'F1',type:'isolated-footing',quantity:columnLines,
    lengthM:1.4,widthM:1.4,thicknessM:0.35,concreteGrade:'B20',
    bottomMesh:{diameterMm:12,spacingMm:150,directions:2},
    pedestal:{bM:0.3,hM:0.3,heightM:0.5,verticalBars:{count:4,diameterMm:16},ties:{diameterMm:8,spacingMm:150}},
    warning:'Móng F1 chỉ là hình học sơ bộ để bóc khối lượng demo. Kích thước/type móng phải thay bằng kết quả địa kỹ thuật + thiết kế móng.',
    basis:'parametric-preliminary',
  }];

  const tieBeams=[{
    id:'GB1',quantity:beamSegmentsPerLevel,totalLengthM:round(beamLengthPerLevel,2),
    bMm:200,hMm:350,concreteGrade:'B20',
    mainBars:{count:4,diameterMm:16},stirrups:{diameterMm:8,spacingMm:150},
    basis:'parametric-preliminary',
  }];

  const stairs=storeys>1?[{
    id:'ST1',quantity:storeys-1,widthM:1,
    floorHeightM:floorHeight,flightCountPerStorey:2,
    horizontalRunPerFlightM:1.8,thicknessMm:120,concreteGrade:'B25',
    mainBars:{diameterMm:10,spacingMm:150},distributionBars:{diameterMm:8,spacingMm:200},
    basis:'parametric-preliminary',
  }]:[];

  return {
    profile:TECHNICAL_MODEL_PROFILE.id,
    level:'preliminary',
    geometry:{
      landWidthM:width,landLengthM:landLength,
      footprintWidthM:round(footprintWidth,2),footprintLengthM:round(footprintLength,2),
      footprintAreaM2:round(footprintArea,2),floorAreaM2:round(floorArea,2),
      storeys,floorHeightM:floorHeight,
    },
    grid:{
      longitudinalBays:longBays,transverseBays:transBays,
      longitudinalSpanM:longSpan,transverseSpanM:transSpan,
      columnGridPoints:columnLines,beamSegmentsPerLevel,
    },
    structural:{slabs,beams,columns,foundations,tieBeams,stairs},
    architecture:wall,
    mep:{electrical,plumbing,hvac},
    roomSchedule,
    assumptions:[
      'Lưới kết cấu và kích thước cấu kiện được sinh tham số để tạo technical package sơ bộ; chưa phải thiết kế thi công.',
      'Dầm/cột/sàn/móng phải được thay bằng kích thước đã kiểm tra từ mô hình tải, nội lực, địa kỹ thuật và detailing dự án.',
      'Chiều cao tầng mặc định '+floorHeight+' m nếu project chưa cung cấp.',
      'Tường/điện/nước được bóc từ hình học + room schedule ở mức preliminary.',
    ],
  };
}

function buildRoomSchedule(project,storeys,bedrooms) {
  const sourced=project?.referenceCase?.floorProgram;
  if (Array.isArray(sourced)&&sourced.length) {
    return sourced.map((row,index)=>({level:row.floor??'Tầng '+(index+1),rooms:(row.rooms??[]).map(String)}));
  }
  const rows=[];
  let remaining=bedrooms;
  for(let floor=1;floor<=storeys;floor+=1){
    const rooms=[];
    if(floor===1) rooms.push('Phòng khách','Bếp + ăn');
    const allocation=floor===1&&bedrooms>=4?1:Math.min(2,remaining);
    for(let i=0;i<allocation&&remaining>0;i+=1){
      rooms.push('Phòng ngủ '+(bedrooms-remaining+1)); remaining-=1;
    }
    rooms.push('WC');
    if(floor===storeys) rooms.push('Phòng thờ','Giặt/phơi');
    else if(floor>1) rooms.push('Sinh hoạt chung');
    rows.push({level:'Tầng '+floor,rooms});
  }
  return rows;
}

function wallModel({footprintWidth,footprintLength,floorHeight,storeys,floorArea,roomSchedule}) {
  const perimeter=2*(footprintWidth+footprintLength);
  const internalLengthPerFloor=Math.max(footprintWidth*1.5,Math.sqrt(floorArea/storeys)*2.2);
  const grossLength=(perimeter+internalLengthPerFloor)*storeys;
  const grossArea=grossLength*floorHeight;
  const openingFactor=0.18;
  const netArea=grossArea*(1-openingFactor);
  return {
    externalPerimeterM:round(perimeter,2),internalWallLengthPerFloorM:round(internalLengthPerFloor,2),
    grossWallAreaM2:round(grossArea,2),netWallAreaM2:round(netArea,2),
    wallThicknessMm:100,openingDeductionRatio:openingFactor,
    plasterAreaM2:round(netArea*2,2),
    paintAreaM2:round(netArea*2+floorArea,2),
    floorTileAreaM2:round(floorArea*0.82,2),
    waterproofingAreaM2:round(floorArea*0.18+roomSchedule.length*4,2),
    basis:'parametric-preliminary',
  };
}

function electricalModel({storeys,bedrooms,roomSchedule,floorArea}) {
  const lightingPoints=Math.max(8,Math.round(floorArea*0.09));
  const socketPoints=Math.max(12,Math.round(floorArea*0.13));
  const acPoints=bedrooms+1;
  const waterHeaterPoints=Math.max(1,Math.ceil(bedrooms/2));
  const dedicatedPoints=2+acPoints+waterHeaterPoints;
  const circuits=[
    {id:'EL-L',label:'Chiếu sáng',count:storeys,cableMm2:1.5,breakerA:10},
    {id:'EL-S',label:'Ổ cắm',count:storeys,cableMm2:2.5,breakerA:20},
    {id:'EL-AC',label:'Điều hòa',count:acPoints,cableMm2:4,breakerA:25},
    {id:'EL-WH',label:'Máy nước nóng',count:waterHeaterPoints,cableMm2:4,breakerA:25},
    {id:'EL-K',label:'Bếp/thiết bị riêng',count:2,cableMm2:4,breakerA:25},
  ];
  return {
    lightingPoints,socketPoints,acPoints,waterHeaterPoints,dedicatedPoints,
    totalPoints:lightingPoints+socketPoints+dedicatedPoints,
    circuits,
    cableLengthsM:{
      '1.5':round(lightingPoints*7.5,1),
      '2.5':round(socketPoints*9.5,1),
      '4':round(dedicatedPoints*13,1),
      pe:round((lightingPoints+socketPoints+dedicatedPoints)*7,1),
    },
    rooms:roomSchedule.length,basis:'parametric-preliminary',
  };
}

function plumbingModel({storeys,bathrooms,people}) {
  const fixtures={
    toilets:bathrooms,washBasins:bathrooms,showers:bathrooms,
    kitchenSinks:1,washingMachines:1,floorDrains:bathrooms+2,
  };
  const totalFixtures=Object.values(fixtures).reduce((a,b)=>a+b,0);
  return {
    bathrooms,people,fixtures,totalFixtures,
    pipeLengthsM:{
      ppr20:round(12+storeys*8+bathrooms*5,1),
      ppr25:round(6+storeys*4,1),
      upvc60:round(bathrooms*5+storeys*3,1),
      upvc90:round(bathrooms*4+storeys*3,1),
      upvc114:round(6+storeys*4,1),
    },
    waterTankLiters:Math.ceil(people*150*1.25/100)*100,
    basis:'parametric-preliminary',
  };
}

function hvacModel({bedrooms,roomSchedule}) {
  const zones=[
    ...Array.from({length:bedrooms},(_,i)=>({id:'AC-BR'+(i+1),spaceType:'bedroom',status:'needs-cooling-load'})),
    {id:'AC-LIVING',spaceType:'living',status:'needs-cooling-load'},
  ];
  return {zones,zoneCount:zones.length,roomScheduleLevels:roomSchedule.length,basis:'scope-only'};
}

function round(v,d=2){const f=10**d;return Math.round(Number(v)*f)/f;}
function roundTo50(v){return Math.ceil(Number(v)/50)*50;}
function numberOr(v,fallback){return Number(v)>0?Number(v):fallback;}
function positive(v,name){if(!(Number(v)>0)) throw new RangeError(name+' must be > 0');return Number(v);}
