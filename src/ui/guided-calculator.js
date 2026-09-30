const SPECS=Object.freeze({
  'loads.permanent':{
    label:'Tải trọng thường xuyên',
    group:'Tải trọng',
    description:'Nhập cấu tạo sàn cơ bản. BuildMate tính tải đặc trưng và tải thiết kế theo TCVN 2737:2023.',
    fields:[
      num('slabThicknessMm','Sàn BTCT dày','mm',120,80,250,5),
      num('slabUnitWeight','Trọng lượng riêng BTCT','kN/m³',25,20,30,0.5),
      num('finishThicknessMm','Lớp hoàn thiện dày','mm',50,10,150,5),
      num('finishUnitWeight','Trọng lượng riêng hoàn thiện','kN/m³',20,10,30,0.5),
    ],
  },
  'rc.beam':{
    label:'Kiểm tra dầm BTCT',
    group:'Kết cấu',
    description:'Kiểm tra nhanh moment và lực cắt cho một dầm chữ nhật. Giá trị nội lực phải đến từ mô hình/tổ hợp tải của dự án.',
    fields:[
      num('designMomentKnM','Moment thiết kế','kN·m',80,1,1000,1),
      num('designShearKn','Lực cắt thiết kế','kN',50,1,1000,1),
      num('bMm','Bề rộng dầm','mm',200,120,1000,10),
      num('h0Mm','Chiều cao làm việc h0','mm',450,100,1500,10),
      num('AsMm2','Diện tích thép kéo As','mm²',1000,100,10000,10),
      num('stirrupSpacingMm','Bước đai','mm',150,50,400,10),
    ],
  },
  'foundation.shallow-settlement':{
    label:'Lún móng nông',
    group:'Móng',
    description:'Tính lún theo phương pháp cộng lún từng lớp. Chỉ dùng khi p, h và E có cơ sở địa kỹ thuật.',
    warning:'Nếu chưa có khảo sát địa chất, chỉ nên chạy dữ liệu demo; không dùng kết quả để chốt móng.',
    fields:[
      num('pressure1','Áp lực tăng thêm lớp 1','kPa',180,0,1000,5),
      num('thickness1','Chiều dày lớp 1','m',0.5,0.1,10,0.1),
      num('modulus1','Mô đun biến dạng lớp 1','kPa',15000,1000,100000,500),
      num('pressure2','Áp lực tăng thêm lớp 2','kPa',120,0,1000,5),
      num('thickness2','Chiều dày lớp 2','m',0.5,0.1,10,0.1),
      num('modulus2','Mô đun biến dạng lớp 2','kPa',12000,1000,100000,500),
      text('geotechSource','Nguồn địa kỹ thuật','Tên hồ sơ / thí nghiệm',''),
    ],
  },
  'electrical.xlpe-cable':{
    label:'Chọn tiết diện cáp',
    group:'Điện',
    description:'Chọn tiết diện nhỏ nhất theo ampacity XLPE/EPR sau hệ số hiệu chỉnh.',
    fields:[
      select('conductor','Vật liệu',[['copper','Đồng'],['aluminium','Nhôm']],'copper'),
      num('designCurrentA','Dòng thiết kế','A',30,1,1000,1),
      select('method','Phương pháp lắp đặt',[['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2'],['C','C'],['D1','D1'],['D2','D2']],'B1'),
      select('loadedConductors','Số dây mang tải',[[2,'2'],[3,'3']],2),
      num('factor1','Hệ số hiệu chỉnh 1','',0.87,0.1,1,0.01),
      num('factor2','Hệ số hiệu chỉnh 2','',0.8,0.1,1,0.01),
    ],
  },
  'water.design-flow':{
    label:'Lưu lượng nước thiết kế',
    group:'Cấp nước',
    description:'Ước tính lưu lượng thiết kế từ tổng đương lượng thiết bị và mức dùng nước.',
    fields:[
      num('fixtureEquivalentUnits','Tổng đương lượng thiết bị','',20,0.1,500,0.1),
      num('litersPerPersonDay','Mức dùng nước','L/người·ngày',150,100,400,10),
    ],
  },
  'hvac.outdoor-air':{
    label:'Gió tươi phòng ở',
    group:'HVAC',
    description:'Tính lưu lượng gió tươi theo số người/diện tích cho không gian nhà ở.',
    fields:[
      select('spaceType','Loại phòng',[['bedroom','Phòng ngủ'],['living','Phòng khách']],'bedroom'),
      num('people','Số người','người',2,1,20,1),
      num('areaM2','Diện tích phòng','m²',18,4,200,1),
    ],
  },
});

export function guidedCalculatorSpecs() {
  return Object.entries(SPECS).map(([id,spec])=>({id,...structuredClone(spec)}));
}

export function guidedCalculatorSpec(action) {
  const spec=SPECS[action];
  if (!spec) throw new RangeError('unsupported guided calculator: '+action);
  return {id:action,...structuredClone(spec)};
}

export function guidedDefaultValues(action) {
  const spec=guidedCalculatorSpec(action);
  return Object.fromEntries(spec.fields.map(field=>[field.key,field.defaultValue]));
}

export function buildGuidedInput(action,values={}) {
  const v={...guidedDefaultValues(action),...values};
  switch(action){
    case 'loads.permanent':
      return {layers:[
        {name:'Sàn BTCT',thicknessM:n(v.slabThicknessMm)/1000,unitWeightKnM3:n(v.slabUnitWeight),materialClass:'reinforcedConcrete',source:'Guided form · cấu tạo dự án'},
        {name:'Hoàn thiện',thicknessM:n(v.finishThicknessMm)/1000,unitWeightKnM3:n(v.finishUnitWeight),materialClass:'finishSite',source:'Guided form · cấu tạo hoàn thiện dự án'},
      ]};
    case 'rc.beam':
      return {
        loadTrace:{reference:{standard:'TCVN 2737:2023',clause:'project load combination',sourceUrl:'project://guided/load-case'}},
        flexure:{designMomentKnM:n(v.designMomentKnM),capacity:{
          bMm:n(v.bMm),h0Mm:n(v.h0Mm),RbMpa:14.5,RsMpa:350,AsMm2:n(v.AsMm2),xiR:0.5,
          materialSource:'Guided form default material set; confirm project materials',
        }},
        shear:{designShearKn:n(v.designShearKn),bMm:n(v.bMm),h0Mm:n(v.h0Mm),RbMpa:14.5,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:n(v.stirrupSpacingMm)},
      };
    case 'foundation.shallow-settlement': {
      const source=String(v.geotechSource??'').trim();
      if (!source) throw new TypeError('Cần nhập nguồn địa kỹ thuật trước khi tính lún móng.');
      return {layers:[
        {averageAdditionalPressureKpa:n(v.pressure1),thicknessM:n(v.thickness1),deformationModulusKpa:n(v.modulus1),pressureSource:source,modulusSource:source},
        {averageAdditionalPressureKpa:n(v.pressure2),thicknessM:n(v.thickness2),deformationModulusKpa:n(v.modulus2),pressureSource:source,modulusSource:source},
      ]};
    }
    case 'electrical.xlpe-cable':
      return {conductor:String(v.conductor),designCurrentA:n(v.designCurrentA),method:String(v.method),loadedConductors:n(v.loadedConductors),correctionFactors:[n(v.factor1),n(v.factor2)]};
    case 'water.design-flow':
      return {fixtureEquivalentUnits:n(v.fixtureEquivalentUnits),litersPerPersonDay:n(v.litersPerPersonDay)};
    case 'hvac.outdoor-air':
      return {spaceType:String(v.spaceType),people:n(v.people),areaM2:n(v.areaM2)};
    default: throw new RangeError('unsupported guided calculator: '+action);
  }
}

function num(key,label,unit,defaultValue,min,max,step){
  return {type:'number',key,label,unit,defaultValue,min,max,step};
}
function text(key,label,placeholder,defaultValue=''){
  return {type:'text',key,label,placeholder,defaultValue};
}
function select(key,label,options,defaultValue){
  return {type:'select',key,label,options,defaultValue};
}
function n(value){
  const number=Number(value);
  if (!Number.isFinite(number)) throw new TypeError('Giá trị số không hợp lệ.');
  return number;
}
