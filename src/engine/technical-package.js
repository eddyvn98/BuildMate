import { buildTechnicalModel } from './technical-model.js';
import { takeoffTechnicalModel } from './quantity-takeoff.js';
import { buildTechnicalBoq } from './technical-boq.js';

export function buildTechnicalPackage(project,planningResults,{fullPriceBook=null}={}) {
  if(!planningResults?.areas) throw new TypeError('planning results are required');
  const model=buildTechnicalModel(project,planningResults.areas);
  const takeoff=takeoffTechnicalModel(model);
  const priceBook=fullPriceBook??planningResults.priceBook??{};
  const boq=buildTechnicalBoq({
    takeoff,
    priceBook,
    marketSnapshot:planningResults.marketPricing?.snapshot??null,
  });
  const calculations=project.engineeringCalculations??[];
  const domains={
    loads:latest(calculations,4),
    rc:latest(calculations,5),
    foundation:latest(calculations,6),
    electrical:latest(calculations,7),
    water:latest(calculations,8),
    hvac:latest(calculations,12),
  };
  const readyDomains=Object.values(domains).filter(Boolean).length;
  return {
    version:'0.9',
    level:'preliminary-technical-package',
    model,
    takeoff,
    boq,
    calculationCoverage:{
      readyDomains,totalDomains:6,
      percent:Math.round(readyDomains/6*100),
      representativeCalculations:domains,
      note:'Coverage theo domain; chưa có calculation riêng cho từng member trong schedule.',
    },
    deliverables:{
      componentSchedules:true,
      materialTakeoff:true,
      boq:true,
      mepSchedules:true,
      calculationIndex:true,
      constructionDesign:false,
    },
    blockers:[
      'Cần load model + nội lực cho từng cấu kiện để nâng member schedule từ preliminary lên design.',
      'Cần địa chất dự án để chốt loại/kích thước móng.',
      'Cần layout kiến trúc/MEP thực tế để chốt chiều dài cáp/ống và vị trí thiết bị.',
      'Các dòng BOQ chưa có đơn giá phải được báo giá/định mức riêng trước khi dùng cho hợp đồng.',
    ],
  };
}

function latest(rows,issue){
  const row=[...rows].reverse().find(x=>Number(x.issue)===Number(issue)&&x.status==='ready');
  if(!row) return null;
  return {
    id:row.id,action:row.action,standard:row.standard,status:row.status,
    calculationDigest:row.calculationDigest,createdAt:row.createdAt,
  };
}
