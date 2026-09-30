import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath,pathToFileURL } from 'node:url';
import path from 'node:path';
import { parsePriceSource } from './market-price-parsers.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const LIVE_PATH=path.join(ROOT,'src/engine/market-price-live.js');
const FIXED_DATE=process.env.BUILDMATE_PRICE_DATE||null;
const today=FIXED_DATE||new Date().toISOString().slice(0,10);
const dryRun=process.argv.includes('--dry-run');

const adapters=[
  {
    id:'hcm-official-vlxd',type:'official',kind:'official-anchor',
    name:'Viện Kinh tế xây dựng / Sở Xây dựng TP.HCM',
    url:'https://kinhtexaydung.gov.vn/tinh-thanh/thanh-pho-ho-chi-minh/',
    entryPattern:/Công bố giá Vật liệu xây dựng trên địa bàn Thành phố Hồ Chí Minh tháng (?<month>\d{1,2}\/\d{4})\s+(?<number>[0-9A-Z/-]+)\s+(?<date>\d{1,2}\/\d{1,2}\/\d{4})/gi,
  },
  {
    id:'khanggia-turnkey',type:'observation',kind:'contractor',name:'Khang Gia House',
    url:'https://khanggiahouse.net/bao-gia-xay-dung-nha-pho/',
    code:'turnkey-m2',unit:'VND/m²',
    extract:{type:'range-near',marker:'NHÀ PHỐ 1 MẶT TIỀN',rangeIndex:1,minValue:4_000_000,maxValue:10_000_000},
    vatIncluded:false,deliveryIncluded:'conditional',
  },
  {
    id:'daiphong-turnkey',type:'observation',kind:'contractor',name:'Đại Phong Group',
    url:'https://daiphonggroup.vn/bao-gia-xay-nha-tron-goi-ho-chi-minh/',
    code:'turnkey-m2',unit:'VND/m²',
    extract:{type:'exact-near',marker:'Đơn giá xây dựng',minValue:4_000_000,maxValue:10_000_000},
  },
  {
    id:'ngoinhahoanhao-turnkey',type:'observation',kind:'contractor',name:'Ngôi Nhà Hoàn Hảo',
    url:'https://ngoinhahoanhao.vn/gia-xay-nha-tron-goi-tphcm-2026/',
    code:'turnkey-m2',unit:'VND/m²',
    extract:{type:'range-near',marker:'Giá xây nhà trọn gói TP.HCM từ',minValue:4_000_000,maxValue:10_000_000},
  },
  {
    id:'negeco-turnkey',type:'observation',kind:'contractor',name:'NEGECO',
    url:'https://xaydungnegeco.vn/ky-thuat-xay-nha-tron-goi-2026/',
    code:'turnkey-m2',unit:'VND/m²',
    extract:{type:'range-near',marker:'Gói Khá (Phổ biến)',minValue:4_000_000,maxValue:10_000_000},
  },
  {
    id:'mtp-rebar-hcm',type:'observation',kind:'market',name:'Mạnh Tiến Phát',
    url:'https://baogiathep.net/bao-gia-thep-tai-ho-chi-minh/',
    code:'rebar',unit:'VND/kg',
    datePatterns:[/cập nhật[^0-9]{0,40}(?<date>\d{1,2}\/\d{1,2}\/\d{4})/i],
    extract:{type:'numeric-band',marker:'Bảng báo giá sắt thép',window:16000,minValue:14_000,maxValue:22_000},
    vatIncluded:null,deliveryIncluded:'conditional',
  },
  {
    id:'mekong-concrete',type:'observation',kind:'market',name:'Bê tông Mê Kông',
    url:'https://mekongthuongtin.com/gia-be-tong-tuoi/',
    code:'concrete-m250',unit:'VND/m³',periodDate:true,
    datePatterns:[/cập nhật(?: lần cuối)?:?\s*(?:tháng\s*)?(?<date>\d{1,2}\/\d{4})/i],
    extract:{type:'exact-near',marker:'M250 R28',minValue:900_000,maxValue:2_500_000},
  },
  {
    id:'betonggiatot-concrete',type:'observation',kind:'market',name:'Bê Tông Tươi Giá Tốt',
    url:'https://betongtuoigiatot.com/',
    code:'concrete-m250',unit:'VND/m³',
    datePatterns:[/Cập nhật:\s*(?<date>\d{1,2}-\d{1,2}-\d{4})/i],
    extract:{type:'exact-near',marker:'M250 R28',minValue:900_000,maxValue:2_500_000},
    vatIncluded:true,deliveryIncluded:null,
  },
  {
    id:'huydong-cement',type:'observation',kind:'market',name:'Xi Măng Huy Đồng',
    url:'https://www.ximanghuydong.vn/bao-gia-xi-mang-ha-tien',
    code:'cement-pcb40-50kg',unit:'VND/bao 50kg',
    datePatterns:[/cập nhật ngày\s*(?<date>\d{1,2}\/\d{1,2}\/\d{4})/i],
    extract:{type:'exact-near',marker:'Hà Tiên PCB40',valueIndex:1,minValue:60_000,maxValue:150_000},
  },
  {
    id:'songphuong-sand-plaster',type:'observation',kind:'market',name:'VLXD Song Phương',
    url:'https://khocatdaxaydung.com/gia-cat-xay-to/',
    code:'sand-plaster',unit:'VND/m³',
    datePatterns:[/cập nhật mới nhất\s*(?<date>\d{1,2}\/\d{1,2}\/\d{4})/i],
    extract:{type:'range-near',marker:'Cát xây tô (m³)',minValue:100_000,maxValue:800_000},
  },
  {
    id:'songphuong-sand-concrete',type:'observation',kind:'market',name:'VLXD Song Phương',
    url:'https://khocatdaxaydung.com/gia-cat-be-tong/',
    code:'sand-concrete',unit:'VND/m³',
    datePatterns:[/cập nhật mới nhất\s*(?<date>\d{1,2}\/\d{1,2}\/\d{4})/i],
    extract:{type:'range-near',marker:'Cát bê tông (m³)',minValue:100_000,maxValue:800_000},
  },
];

const previous=await loadPrevious();
const sourceMap=new Map(previous.sources.map(x=>[x.id,{...x}]));
const observationMap=new Map(previous.observations.map(x=>[keyOf(x),{...x}]));

const attempts=await Promise.all(adapters.map(async(adapter)=>{
  const base=sourceMap.get(adapter.id)??baseSource(adapter);
  try {
    const html=await fetchText(adapter.url);
    const parsed=parsePriceSource(adapter,html,{checkedAt:today});
    return {
      source:{...base,...sourceFields(adapter),...parsed.sourcePatch},
      observation:parsed.observationPatch,
      result:{
        id:adapter.id,ok:true,code:adapter.code??null,
        sourceDate:parsed.sourcePatch.sourceDate??null,
        min:parsed.observationPatch?.min??null,max:parsed.observationPatch?.max??null,
      },
    };
  } catch (error) {
    return {
      source:{...base,...sourceFields(adapter),lastCheckedAt:today,lastError:String(error.message??error)},
      observation:null,
      result:{id:adapter.id,ok:false,error:String(error.message??error),code:adapter.code??null},
    };
  }
}));

for (const attempt of attempts) {
  sourceMap.set(attempt.source.id,attempt.source);
  if (attempt.observation) observationMap.set(keyOf(attempt.observation),attempt.observation);
}
const results=attempts.map(x=>x.result);

const successes=results.filter(x=>x.ok);
const turnkeySuccesses=successes.filter(x=>x.code==='turnkey-m2');
if (successes.length<6||turnkeySuccesses.length<2) {
  throw new Error(`refresh quality gate failed: ${successes.length} sources, ${turnkeySuccesses.length} turnkey sources`);
}

const payload={
  meta:{schema:'buildmate-market-prices-v1',province:'TP.HCM',refreshedAt:today,successfulSources:successes.length,totalSources:adapters.length},
  sources:[...sourceMap.values()].sort((a,b)=>a.id.localeCompare(b.id)),
  observations:[...observationMap.values()].sort((a,b)=>keyOf(a).localeCompare(keyOf(b))),
};

const output=renderModule(payload);
if (!dryRun) await writeFile(LIVE_PATH,output,'utf8');
process.stdout.write(JSON.stringify({today,dryRun,results,meta:payload.meta},null,2)+'\n');

async function loadPrevious() {
  try {
    await readFile(LIVE_PATH,'utf8');
    const url=pathToFileURL(LIVE_PATH);
    url.searchParams.set('t',Date.now().toString());
    const mod=await import(url.href);
    return {
      sources:structuredClone(mod.LIVE_PRICE_SOURCES??[]),
      observations:structuredClone(mod.LIVE_PRICE_OBSERVATIONS??[]),
    };
  } catch {
    return {sources:[],observations:[]};
  }
}

async function fetchText(url) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15_000);
  try {
    const response=await fetch(url,{
      signal:controller.signal,
      redirect:'follow',
      headers:{
        'user-agent':'BuildMatePriceBot/0.7 (+https://github.com/eddyvn98/BuildMate)',
        'accept':'text/html,application/xhtml+xml',
        'accept-language':'vi,en;q=0.8',
      },
    });
    if (!response.ok) throw new Error('http-'+response.status);
    const text=await response.text();
    if (text.length<200) throw new Error('source-content-too-short');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function baseSource(adapter) {
  return {
    ...sourceFields(adapter),sourceDate:null,observedAt:today,verifiedAt:null,
    lastCheckedAt:null,lastError:null,note:adapter.note??null,
  };
}

function sourceFields(adapter) {
  return {id:adapter.id,kind:adapter.kind,name:adapter.name,url:adapter.url};
}

function keyOf(item) {
  return `${item.sourceId}::${item.code}`;
}

function renderModule(payload) {
  return `// Generated by scripts/refresh-market-prices.mjs. Do not edit manually.\n`+
    `export const MARKET_PRICE_META=Object.freeze(${JSON.stringify(payload.meta,null,2)});\n\n`+
    `export const LIVE_PRICE_SOURCES=Object.freeze(${JSON.stringify(payload.sources,null,2)});\n\n`+
    `export const LIVE_PRICE_OBSERVATIONS=Object.freeze(${JSON.stringify(payload.observations,null,2)});\n`;
}
