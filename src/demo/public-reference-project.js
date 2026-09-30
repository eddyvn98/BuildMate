import { createProject,FIELD_STATES } from '../engine/project.js';
import { MARKET_PRICE_META } from '../engine/market-price-seed.js';

export const PUBLIC_REFERENCE_CASE=Object.freeze({
  id:'public-4x16-3t-4pn-2026',
  title:'Nhà phố tham chiếu 4×16 · 3 tầng · 4 phòng ngủ',
  type:'public-composite-demo',
  sources:[
    {
      label:'Thiết kế nhà ống 4×16 · 3 tầng · 4PN · 2026',
      url:'https://thietkenhadepmoi.com/mau-nha-ong-3-tang-4x16m.html',
      facts:['4×16 m','3 tầng','4 phòng ngủ','1 phòng thờ','sân thượng','giặt/phơi'],
    },
    {
      label:'Nhà thực tế 4×16 · 3 tầng · 4PN tại TP.HCM',
      url:'https://muaban.net/bat-dong-san/nha-hem-ngo-quan-go-vap-ho-chi-minh/nha-3-tang-duong-quang-ham-4x16m-4-phong-ngu-5wc-id71183757',
      facts:['TP.HCM','4×16 m','3 tầng','4 phòng ngủ','5 WC'],
    },
  ],
  floorProgram:[
    {floor:'Tầng 1',rooms:['Phòng khách','Bếp + ăn','1 phòng ngủ','1 WC']},
    {floor:'Tầng 2',rooms:['2 phòng ngủ','Sinh hoạt chung']},
    {floor:'Tầng 3',rooms:['1 phòng ngủ','Phòng thờ','Sân thượng','Giặt/phơi','WC']},
  ],
  note:'Fixture tổng hợp từ nguồn công khai để kiểm thử BuildMate; không phải hồ sơ thiết kế/thi công của một căn nhà cụ thể.',
});

export function createPublicReferenceProject() {
  let project=createProject();
  project={
    ...project,
    name:'Demo công khai · Nhà phố 4×16 · 3 tầng',
    referenceCase:structuredClone(PUBLIC_REFERENCE_CASE),
  };
  project=demoField(project,'context.projectDate',MARKET_PRICE_META.refreshedAt,FIELD_STATES.CONFIRMED,'BuildMate market snapshot','Ngày test để dùng snapshot giá hiện hành.');
  project=demoField(project,'location.province','TP.HCM',FIELD_STATES.CONFIRMED,'public-composite-demo','Locality dùng để kiểm thử pricing/QCVN.');
  project=demoField(project,'location.district','Gò Vấp',FIELD_STATES.CONFIRMED,'public-listing','Nguồn nhà thực tế công khai 4×16 · 3 tầng · 4PN.');
  project=demoField(project,'land.widthM',4,FIELD_STATES.CONFIRMED,'public-reference','Hai nguồn công khai đều dùng kích thước 4×16 m.');
  project=demoField(project,'land.lengthM',16,FIELD_STATES.CONFIRMED,'public-reference','Hai nguồn công khai đều dùng kích thước 4×16 m.');
  project=demoField(project,'design.storeys',3,FIELD_STATES.CONFIRMED,'public-reference','1 trệt + 2 lầu / 3 tầng.');
  project=demoField(project,'household.bedrooms',4,FIELD_STATES.CONFIRMED,'public-reference','Công năng công khai có 4 phòng ngủ.');
  project=demoField(project,'household.people',5,FIELD_STATES.ASSUMED,'buildmate-demo','Giả định để chạy nhu cầu nước/HVAC; không lấy từ nguồn.');
  project=demoField(project,'design.footprintRatio',0.85,FIELD_STATES.ASSUMED,'buildmate-demo','Giả định planning để chừa khoảng thoáng/sân; không phải kích thước hồ sơ nguồn.');
  project=demoField(project,'design.finishLevel','balanced',FIELD_STATES.ASSUMED,'buildmate-demo','Mốc hoàn thiện trung bình để so giá thị trường.');
  project=demoField(project,'budget.totalVnd',1_500_000_000,FIELD_STATES.ASSUMED,'buildmate-demo','Ngân sách demo để kiểm thử budget-fit; không phải báo giá nguồn.');
  project.updatedAt=new Date().toISOString();
  return project;
}

export function publicReferenceCalculationInputs() {
  return Object.freeze([
    ['loads.permanent',{layers:[
      {name:'Sàn BTCT',thicknessM:0.12,unitWeightKnM3:25,materialClass:'reinforcedConcrete',source:'Demo cấu tạo sàn BTCT 120 mm'},
      {name:'Lớp hoàn thiện',thicknessM:0.05,unitWeightKnM3:20,materialClass:'finishSite',source:'Demo lớp hoàn thiện 50 mm'},
    ]}],
    ['rc.beam',{
      loadTrace:{reference:{standard:'TCVN 2737:2023',clause:'demo load combination',sourceUrl:'project://public-demo/load-case'}},
      flexure:{designMomentKnM:80,capacity:{bMm:200,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'Demo material set for regression'}},
      shear:{designShearKn:50,bMm:200,h0Mm:450,RbMpa:14.5,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150},
    }],
    ['foundation.shallow-settlement',{layers:[
      {averageAdditionalPressureKpa:180,thicknessM:0.5,deformationModulusKpa:15000,pressureSource:'Synthetic demo only',modulusSource:'Synthetic demo only'},
      {averageAdditionalPressureKpa:120,thicknessM:0.5,deformationModulusKpa:12000,pressureSource:'Synthetic demo only',modulusSource:'Synthetic demo only'},
    ]}],
    ['electrical.xlpe-cable',{conductor:'copper',designCurrentA:30,method:'B1',loadedConductors:2,correctionFactors:[0.87,0.8]}],
    ['water.design-flow',{fixtureEquivalentUnits:20,litersPerPersonDay:150}],
    ['hvac.outdoor-air',{spaceType:'bedroom',people:2,areaM2:18}],
  ]);
}

function demoField(project,path,value,state,source,note) {
  const clone=structuredClone(project);
  const parts=path.split('.');
  let cursor=clone;
  for (let i=0;i<parts.length-1;i+=1) cursor=cursor[parts[i]];
  cursor[parts.at(-1)]={...(cursor[parts.at(-1)]??{}),value,state,source,note};
  return clone;
}
