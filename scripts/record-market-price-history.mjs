import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath,pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HISTORY_PATH=path.join(ROOT,'src/engine/market-price-history.js');
const LIVE_PATH=path.join(ROOT,'src/engine/market-price-live.js');
const MARKET_PATH=path.join(ROOT,'src/engine/market-pricing.js');

const liveUrl=pathToFileURL(LIVE_PATH);
liveUrl.searchParams.set('t',Date.now().toString());
const live=await import(liveUrl.href);

const marketUrl=pathToFileURL(MARKET_PATH);
marketUrl.searchParams.set('t',Date.now().toString());
const market=await import(marketUrl.href);

const date=live.MARKET_PRICE_META?.refreshedAt;
if (!date) throw new Error('market snapshot refreshedAt is missing');
const snapshot=market.buildMarketSnapshot({
  province:live.MARKET_PRICE_META.province??'TP.HCM',
  asOf:date,
  observations:live.LIVE_PRICE_OBSERVATIONS,
  sources:live.LIVE_PRICE_SOURCES,
});
if (!snapshot.turnkeyM2) throw new Error('turnkey market snapshot unavailable');

const previous=await loadHistory();
const point={
  date,
  province:snapshot.province,
  turnkeyM2:{
    center:snapshot.turnkeyM2.center,
    low:snapshot.turnkeyM2.range.low,
    high:snapshot.turnkeyM2.range.high,
    confidence:snapshot.turnkeyM2.confidence,
    sourceCount:snapshot.turnkeyM2.sourceCount,
  },
  materials:Object.fromEntries(Object.entries(snapshot.materials).map(([code,row])=>[
    code,{center:row.center,unit:row.unit}
  ])),
};
const map=new Map(previous.map(x=>[x.date+'::'+x.province,x]));
map.set(point.date+'::'+point.province,point);
const rows=[...map.values()].sort((a,b)=>a.date.localeCompare(b.date));
await writeFile(HISTORY_PATH,render(rows),'utf8');
process.stdout.write(JSON.stringify({recorded:point,historyPoints:rows.length},null,2)+'\n');

async function loadHistory() {
  try {
    await readFile(HISTORY_PATH,'utf8');
    const url=pathToFileURL(HISTORY_PATH);
    url.searchParams.set('t',Date.now().toString());
    const mod=await import(url.href);
    return structuredClone(mod.MARKET_PRICE_HISTORY??[]);
  } catch {
    return [];
  }
}

function render(rows) {
  return '// Generated/extended by scripts/record-market-price-history.mjs.\n'+
    'export const MARKET_PRICE_HISTORY=Object.freeze('+JSON.stringify(rows,null,2)+');\n';
}
