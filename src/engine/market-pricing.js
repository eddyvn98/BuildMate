import { HCM_PRICE_OBSERVATIONS,HCM_PRICE_SOURCES } from './market-price-seed.js';
import { readValue } from './project.js';

const MAX_AGE_DAYS=Object.freeze({market:30,contractor:45,'official-anchor':60});
const FINISH_FACTOR=Object.freeze({economy:0.9,balanced:1,comfort:1.15});

export function buildMarketSnapshot({
  province='TP.HCM',asOf='2026-09-30',
  observations=HCM_PRICE_OBSERVATIONS,sources=HCM_PRICE_SOURCES,
}={}) {
  const sourceMap=new Map(sources.map(x=>[x.id,x]));
  const active=observations
    .filter(x=>sameProvince(x.province,province))
    .map(x=>decorate(x,sourceMap.get(x.sourceId),asOf))
    .filter(x=>x.source&&x.freshness.status!=='stale');

  const codes=[...new Set(active.map(x=>x.code))];
  const series=Object.fromEntries(codes.map(code=>[code,summarize(code,active.filter(x=>x.code===code))]));
  const officialAnchors=sources
    .filter(x=>x.kind==='official-anchor')
    .map(x=>({...x,freshness:sourceFreshness(x,asOf)}));

  return {
    province,asOf,
    turnkeyM2:series['turnkey-m2']??null,
    materials:Object.fromEntries(Object.entries(series).filter(([code])=>code!=='turnkey-m2')),
    officialAnchors,
    sourceCount:new Set(active.map(x=>x.sourceId)).size,
    generatedFrom:'curated-market-observations',
  };
}

export function quickTownhouseEstimate({
  footprintM2,storeys,finishLevel='balanced',snapshot,
  foundationFactor=0.4,roofFactor=0.5,
}={}) {
  if (!(Number(footprintM2)>0)) throw new RangeError('footprintM2 must be > 0');
  if (!(Number(storeys)>0)) throw new RangeError('storeys must be > 0');
  const price=snapshot?.turnkeyM2;
  if (!price) return {status:'blocked',reason:'fresh-turnkey-market-price-unavailable'};
  const factor=FINISH_FACTOR[finishLevel]??1;
  const convertedArea=Number(footprintM2)*(Number(storeys)+Number(foundationFactor)+Number(roofFactor));
  return {
    status:'ready',
    level:'market-quick-estimate',
    centerVnd:round(convertedArea*price.center*factor,0),
    lowVnd:round(convertedArea*price.range.low*factor,0),
    highVnd:round(convertedArea*price.range.high*factor,0),
    convertedAreaM2:round(convertedArea,2),
    pricePerM2:{center:price.center,low:price.range.low,high:price.range.high,unit:price.unit},
    finishLevel,finishFactor:factor,
    areaAssumptions:{foundationFactor:Number(foundationFactor),roofFactor:Number(roofFactor)},
    confidence:price.confidence,
    freshestSourceDate:price.freshestSourceDate,
    sourceCount:price.sourceCount,
    warning:'Ước tính nhanh theo báo giá/m² thị trường; dùng để chốt khung ngân sách, không thay BOQ/hợp đồng.',
  };
}

export function buildProjectMarketPricing(project,areas) {
  const asOf=String(readValue(project,'context.projectDate',new Date().toISOString().slice(0,10)));
  const province=String(readValue(project,'location.province','TP.HCM')||'TP.HCM');
  const snapshot=buildMarketSnapshot({province,asOf});
  const quickEstimate=areas?.footprint?.value
    ? quickTownhouseEstimate({
        footprintM2:areas.footprint.value,
        storeys:Number(readValue(project,'design.storeys',1)),
        finishLevel:String(readValue(project,'design.finishLevel','balanced')),
        snapshot,
      })
    : {status:'blocked',reason:'project-area-unavailable'};
  return {snapshot,quickEstimate};
}

export function projectMarketPricingReady(project) {
  const asOf=String(readValue(project,'context.projectDate',new Date().toISOString().slice(0,10)));
  const province=String(readValue(project,'location.province','TP.HCM')||'TP.HCM');
  const snapshot=buildMarketSnapshot({province,asOf});
  return {
    ready:Boolean(snapshot.turnkeyM2&&['high','medium'].includes(snapshot.turnkeyM2.confidence)),
    snapshot,
  };
}

function summarize(code,rows) {
  const mids=rows.map(x=>(x.min+x.max)/2).sort((a,b)=>a-b);
  const sourceCount=new Set(rows.map(x=>x.sourceId)).size;
  const center=median(mids);
  const robustLow=quantile(mids,0.2);
  const robustHigh=quantile(mids,0.8);
  const spread=center>0?(robustHigh-robustLow)/center:1;
  const explicitRatio=rows.filter(x=>x.dateBasis==='explicit'||x.dateBasis==='period').length/rows.length;
  const maxAge=Math.max(...rows.map(x=>x.freshness.ageDays));
  let confidence='low';
  if (sourceCount>=4&&explicitRatio>=0.75&&spread<=0.2&&maxAge<=30) confidence='high';
  else if (sourceCount>=2&&spread<=0.35&&maxAge<=45) confidence='medium';
  return {
    code,unit:rows[0]?.unit??null,center:round(center,0),
    range:{low:round(robustLow,0),high:round(robustHigh,0)},
    observedRange:{low:Math.min(...rows.map(x=>x.min)),high:Math.max(...rows.map(x=>x.max))},
    sourceCount,confidence,
    freshestSourceDate:rows.map(x=>x.sourceDate??x.observedAt).sort().at(-1)??null,
    maxAgeDays:maxAge,
    sources:rows.map(x=>({
      sourceId:x.sourceId,name:x.source.name,url:x.source.url,
      sourceDate:x.sourceDate,observedAt:x.observedAt,dateBasis:x.dateBasis,
      min:x.min,max:x.max,freshness:x.freshness.status,
    })),
  };
}

function decorate(observation,source,asOf) {
  return {...observation,source,sourceDate:source?.sourceDate??null,observedAt:source?.observedAt??null,freshness:sourceFreshness(source,asOf)};
}

function sourceFreshness(source,asOf) {
  if (!source) return {status:'stale',ageDays:999};
  const date=source.sourceDate??source.observedAt;
  const ageDays=Math.max(0,Math.floor((Date.parse(asOf+'T00:00:00Z')-Date.parse(date+'T00:00:00Z'))/86400000));
  const max=MAX_AGE_DAYS[source.kind]??30;
  return {ageDays,status:ageDays<=Math.min(30,max)?'fresh':ageDays<=max?'aging':'stale',maxAgeDays:max,dateBasis:source.sourceDate?'source-date':'observed-date'};
}

function sameProvince(a,b) {
  const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  return norm(a)===norm(b)||norm(b).includes('hcm')&&norm(a).includes('hcm');
}

function median(values) {
  if (!values.length) return null;
  const m=Math.floor(values.length/2);
  return values.length%2?values[m]:(values[m-1]+values[m])/2;
}

function quantile(values,q) {
  if (!values.length) return null;
  if (values.length===1) return values[0];
  const pos=(values.length-1)*q,lo=Math.floor(pos),hi=Math.ceil(pos);
  return values[lo]+(values[hi]-values[lo])*(pos-lo);
}

function round(v,d=2) {
  const f=10**d; return Math.round(Number(v)*f)/f;
}
