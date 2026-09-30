import { projectEngineeringReadiness } from './project-readiness.js';
import { projectMarketPricingReady } from './market-pricing.js';

const PRICE_CODES=Object.freeze(['concrete','rebar','masonry','plaster','paint','electrical','plumbing']);

export function projectAtoZStatus(project) {
  const engineering=projectEngineeringReadiness(project);
  const byIssue=new Map(engineering.map(x=>[x.issue,x]));
  const briefReady=Boolean(
    textValue(project?.location?.province)&&positive(project?.land?.widthM)&&positive(project?.land?.lengthM)&&
    positive(project?.design?.storeys)&&positive(project?.household?.people)
  );
  const budgetReady=positive(project?.budget?.totalVnd);
  const pricingMetaReady=Boolean(textValue(project?.pricing?.sourceLabel)&&textValue(project?.pricing?.effectiveDate));
  const pricedCodes=PRICE_CODES.filter(code=>positive(project?.pricing?.items?.[code]));
  const manualPricingReady=pricingMetaReady&&pricedCodes.length===PRICE_CODES.length;
  const marketPricing=projectMarketPricingReady(project);
  const pricingReady=manualPricingReady||marketPricing.ready;
  const stages=[
    stage('brief','Thông tin đất & nhu cầu',briefReady,briefReady?'Đủ dữ liệu cơ bản':'Thiếu vị trí, kích thước đất, số tầng hoặc số người'),
    stage(
      'budget','Ngân sách & đơn giá',budgetReady&&pricingReady,
      budgetReady&&manualPricingReady
        ?'Có ngân sách và đủ bộ đơn giá dự án có nguồn'
        :budgetReady&&marketPricing.ready
          ?'Có ngân sách + snapshot thị trường '+marketPricing.snapshot.turnkeyM2.confidence+' ('+marketPricing.snapshot.turnkeyM2.sourceCount+' nguồn)'
          :pricingMetaReady&&pricedCodes.length<PRICE_CODES.length
            ?'Nguồn thủ công chưa đủ và market snapshot đã stale/không khả dụng'
            :'Cần ngân sách; dùng market snapshot fresh hoặc nhập đủ bộ đơn giá dự án'
    ),
    engineeringStage('loads','Tải trọng',byIssue.get(4)),
    engineeringStage('rc','Kết cấu BTCT',byIssue.get(5)),
    engineeringStage('foundation','Móng',byIssue.get(6)),
    engineeringStage('electrical','Điện',byIssue.get(7)),
    engineeringStage('water','Cấp thoát nước',byIssue.get(8)),
    engineeringStage('hvac','HVAC / thông gió',byIssue.get(12)),
  ];
  const reportReady=stages.every(x=>x.status==='ready');
  stages.push(stage('report','Báo cáo A→Z',reportReady,reportReady?'Đủ dữ liệu để tổng hợp báo cáo standards-backed':'Báo cáo sẽ chỉ hoàn tất khi các bước trước sẵn sàng'));
  const complete=stages.filter(x=>x.status==='ready').length;
  return {
    ready:stages.every(x=>x.status==='ready'),
    complete,total:stages.length,
    progressPercent:Math.round(complete/stages.length*100),
    stages,
  };
}

function engineeringStage(id,label,row) {
  if (!row) return stage(id,label,false,'Chưa có profile kỹ thuật');
  if (!row.standardsReady) return stage(id,label,false,'Coverage tiêu chuẩn chưa hoàn tất');
  if (!row.projectInputsReady) {
    return stage(id,label,false,row.blockers.includes('project-input-or-evidence-blocked')?'Thiếu/không hợp lệ dữ liệu dự án hoặc evidence':'Chưa có calculation run cho dự án');
  }
  return stage(id,label,true,'Tiêu chuẩn + input/evidence + calculation run đã sẵn sàng');
}

function stage(id,label,ready,message) {
  return {id,label,status:ready?'ready':'blocked',message};
}

function positive(field) {
  return Number(field?.value)>0;
}

function textValue(field) {
  return String(field?.value??'').trim();
}
