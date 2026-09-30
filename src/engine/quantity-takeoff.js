const STEEL_DENSITY_FACTOR=162;

export function takeoffTechnicalModel(model) {
  if (!model?.structural) throw new TypeError('technical model is required');
  const items=[];
  const rebar=new Map();
  const add=(row)=>items.push({...row,value:round(row.value,2),level:'preliminary'});
  const addSteel=(diameterMm,lengthM,source)=>{
    const d=Number(diameterMm),length=Number(lengthM);
    if(!(d>0&&length>0)) return;
    const kg=length*d*d/STEEL_DENSITY_FACTOR;
    const key=String(d);
    const current=rebar.get(key)??{diameterMm:d,lengthM:0,weightKg:0,sources:[]};
    current.lengthM+=length; current.weightKg+=kg; current.sources.push(source);
    rebar.set(key,current);
  };

  for(const slab of model.structural.slabs){
    const concrete=slab.areaM2*slab.thicknessMm/1000;
    add(line('concrete','structure','Bê tông '+slab.id,concrete,'m³',slab.id,'concrete'));
    add(line('formwork','structure','Cốp pha '+slab.id,slab.areaM2,'m²',slab.id,null));
    const spacing=slab.reinforcement.bottom.spacingMm/1000;
    const baseLength=slab.areaM2*(2/spacing);
    const topFactor=slab.reinforcement.supportTop.equivalentAreaFactor??0;
    addSteel(slab.reinforcement.bottom.diameterMm,baseLength*(1+topFactor)*1.08,slab.id);
  }

  for(const beam of [...model.structural.beams,...model.structural.tieBeams]){
    const b=beam.bMm/1000,h=beam.hMm/1000;
    add(line('concrete','structure','Bê tông '+beam.id,beam.totalLengthM*b*h,'m³',beam.id,'concrete'));
    add(line('formwork','structure','Cốp pha '+beam.id,beam.totalLengthM*(b+2*h),'m²',beam.id,null));
    addSteel(beam.mainBars.diameterMm,beam.totalLengthM*beam.mainBars.count*1.08,beam.id);
    if(beam.extraTop) addSteel(beam.extraTop.diameterMm,beam.totalLengthM*beam.extraTop.count*beam.extraTop.lengthFactor*1.08,beam.id);
    const stirrupCount=Math.ceil(beam.totalLengthM/(beam.stirrups.spacingMm/1000));
    const perimeter=2*(b+h)+0.2;
    addSteel(beam.stirrups.diameterMm,stirrupCount*perimeter,beam.id+' stirrups');
  }

  for(const column of model.structural.columns){
    const b=column.bMm/1000,h=column.hMm/1000,totalHeight=column.quantity*column.segmentHeightM;
    add(line('concrete','structure','Bê tông '+column.id,totalHeight*b*h,'m³',column.id,'concrete'));
    add(line('formwork','structure','Cốp pha '+column.id,totalHeight*2*(b+h),'m²',column.id,null));
    addSteel(column.verticalBars.diameterMm,totalHeight*column.verticalBars.count*1.12,column.id);
    const tieCount=Math.ceil(column.segmentHeightM/(column.ties.spacingMm/1000))*column.quantity;
    addSteel(column.ties.diameterMm,tieCount*(2*(b+h)+0.2),column.id+' ties');
  }

  for(const footing of model.structural.foundations){
    const each=footing.lengthM*footing.widthM*footing.thicknessM;
    add(line('concrete','foundation','Bê tông '+footing.id,each*footing.quantity,'m³',footing.id,'concrete'));
    add(line('formwork','foundation','Cốp pha '+footing.id,2*(footing.lengthM+footing.widthM)*footing.thicknessM*footing.quantity,'m²',footing.id,null));
    const spacing=footing.bottomMesh.spacingMm/1000;
    const barsX=(Math.ceil(footing.widthM/spacing)+1)*footing.lengthM;
    const barsY=(Math.ceil(footing.lengthM/spacing)+1)*footing.widthM;
    addSteel(footing.bottomMesh.diameterMm,(barsX+barsY)*footing.quantity*1.08,footing.id);
    const p=footing.pedestal;
    if(p){
      const pedVolume=p.bM*p.hM*p.heightM*footing.quantity;
      add(line('concrete','foundation','Bê tông cổ móng '+footing.id,pedVolume,'m³',footing.id,'concrete'));
      addSteel(p.verticalBars.diameterMm,p.heightM*p.verticalBars.count*footing.quantity*1.12,footing.id+' pedestal');
      const ties=Math.ceil(p.heightM/(p.ties.spacingMm/1000))*footing.quantity;
      addSteel(p.ties.diameterMm,ties*(2*(p.bM+p.hM)+0.15),footing.id+' pedestal ties');
    }
  }

  for(const stair of model.structural.stairs){
    const rise=stair.floorHeightM/2;
    const slope=Math.hypot(rise,stair.horizontalRunPerFlightM);
    const totalFlightArea=slope*stair.widthM*stair.flightCountPerStorey*stair.quantity;
    add(line('concrete','structure','Bê tông '+stair.id,totalFlightArea*stair.thicknessMm/1000,'m³',stair.id,'concrete'));
    add(line('formwork','structure','Cốp pha '+stair.id,totalFlightArea,'m²',stair.id,null));
    const mainBars=Math.ceil(stair.widthM/(stair.mainBars.spacingMm/1000))+1;
    addSteel(stair.mainBars.diameterMm,mainBars*slope*stair.flightCountPerStorey*stair.quantity*1.08,stair.id);
    const distBars=Math.ceil(slope/(stair.distributionBars.spacingMm/1000))+1;
    addSteel(stair.distributionBars.diameterMm,distBars*stair.widthM*stair.flightCountPerStorey*stair.quantity*1.08,stair.id);
  }

  const wall=model.architecture;
  add(line('masonry','architecture','Tường xây 100 mm',wall.netWallAreaM2,'m²','walls','masonry'));
  add(line('brick','architecture','Gạch xây quy đổi',wall.netWallAreaM2*55,'viên','walls',null));
  add(line('mortar','architecture','Vữa xây quy đổi',wall.netWallAreaM2*0.02,'m³','walls',null));
  add(line('plaster','finishes','Tô trát',wall.plasterAreaM2,'m²','walls','plaster'));
  add(line('paint','finishes','Sơn bả',wall.paintAreaM2,'m²','walls','paint'));
  add(line('tile','finishes','Lát sàn',wall.floorTileAreaM2,'m²','floors',null));
  add(line('waterproofing','finishes','Chống thấm',wall.waterproofingAreaM2,'m²','wet-areas',null));

  const el=model.mep.electrical;
  add(line('electrical-point','electrical','Điểm điện tổng',el.totalPoints,'điểm','electrical','electrical'));
  for(const [size,length] of Object.entries(el.cableLengthsM)){
    add(line('cable','electrical',size==='pe'?'Dây PE':'Cáp Cu '+size+' mm²',length,'m','electrical',null,{sizeMm2:size}));
  }

  const pl=model.mep.plumbing;
  add(line('plumbing-point','plumbing','Thiết bị/điểm nước',pl.totalFixtures,'điểm','plumbing','plumbing'));
  for(const [size,length] of Object.entries(pl.pipeLengthsM)){
    add(line('pipe','plumbing',pipeLabel(size),length,'m','plumbing',null,{size}));
  }
  add(line('water-tank','plumbing','Bồn nước đề xuất',pl.waterTankLiters,'L','plumbing',null));

  for(const row of rebar.values()){
    add(line('rebar','structure','Thép Ø'+row.diameterMm, row.weightKg*1.03,'kg','rebar','rebar',{
      diameterMm:row.diameterMm,lengthM:round(row.lengthM,1),wasteRatio:0.03,
    }));
  }

  const materials=aggregate(items);
  return {
    level:'preliminary',
    items,
    materials,
    summary:{
      concreteM3:round(sum(items,'concrete'),2),
      rebarKg:round(sum(items,'rebar'),1),
      formworkM2:round(sum(items,'formwork'),1),
      masonryM2:round(sum(items,'masonry'),1),
      plasterM2:round(sum(items,'plaster'),1),
      paintM2:round(sum(items,'paint'),1),
      electricalPoints:round(sum(items,'electrical-point'),0),
      plumbingPoints:round(sum(items,'plumbing-point'),0),
    },
    warnings:[
      'Bóc khối lượng dựa trên technical model preliminary; không thay thế shop drawing/BOQ thi công.',
      'Thép đã cộng 3% hao hụt sau khi tính chiều dài theo detailing sơ bộ.',
      'Cáp và ống là chiều dài routing sơ bộ từ room/program, cần cập nhật theo layout thực tế.',
    ],
  };
}

function line(kind,section,label,value,unit,sourceComponentId,priceCode=null,meta={}) {
  return {id:section+'.'+kind+'.'+slug(label),kind,section,label,value,unit,sourceComponentId,priceCode,...meta};
}
function sum(items,kind){return items.filter(x=>x.kind===kind).reduce((a,b)=>a+Number(b.value||0),0);}
function aggregate(items){
  const map=new Map();
  for(const item of items){
    const key=item.kind+'|'+item.unit+'|'+(item.diameterMm??item.sizeMm2??item.size??'');
    const row=map.get(key)??{kind:item.kind,label:item.kind,unit:item.unit,value:0,meta:{}};
    row.value+=Number(item.value||0);
    if(item.diameterMm) row.meta.diameterMm=item.diameterMm;
    if(item.sizeMm2) row.meta.sizeMm2=item.sizeMm2;
    if(item.size) row.meta.size=item.size;
    map.set(key,row);
  }
  return [...map.values()].map(x=>({...x,value:round(x.value,2)}));
}
function pipeLabel(size){
  return ({ppr20:'Ống PPR DN20',ppr25:'Ống PPR DN25',upvc60:'Ống uPVC DN60',upvc90:'Ống uPVC DN90',upvc114:'Ống uPVC DN114'})[size]??size;
}
function slug(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function round(v,d=2){const f=10**d;return Math.round(Number(v)*f)/f;}
