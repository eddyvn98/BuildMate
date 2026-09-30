import { MARKET_PRICE_HISTORY } from './market-price-history.js';

export function marketPriceTrend({history=MARKET_PRICE_HISTORY,province='TP.HCM'}={}) {
  const rows=(history??[])
    .filter(x=>x.province===province&&x.turnkeyM2?.center>0)
    .slice()
    .sort((a,b)=>a.date.localeCompare(b.date));
  if (!rows.length) return {status:'empty',points:[]};
  const latest=rows.at(-1);
  const previous=findPrevious(rows,latest.date,30);
  const materialDrift=materialChanges(previous,latest);
  return {
    status:previous?'ready':'building-history',
    latest,
    previous:previous??null,
    turnkeyChangePercent:previous?percent(previous.turnkeyM2.center,latest.turnkeyM2.center):null,
    materialDrift,
    points:rows.map(x=>({date:x.date,center:x.turnkeyM2.center,low:x.turnkeyM2.low,high:x.turnkeyM2.high})),
  };
}

function findPrevious(rows,latestDate,days) {
  if (rows.length<2) return null;
  const latestMs=Date.parse(latestDate+'T00:00:00Z');
  const target=latestMs-days*86400000;
  const candidates=rows.slice(0,-1);
  return candidates.reduce((best,row)=>{
    const distance=Math.abs(Date.parse(row.date+'T00:00:00Z')-target);
    return !best||distance<best.distance?{row,distance}:best;
  },null)?.row??null;
}

function materialChanges(previous,latest) {
  if (!previous) return [];
  const keys=new Set([...Object.keys(previous.materials??{}),...Object.keys(latest.materials??{})]);
  return [...keys].map(code=>{
    const before=previous.materials?.[code]?.center;
    const now=latest.materials?.[code]?.center;
    return {
      code,before:before??null,now:now??null,
      unit:latest.materials?.[code]?.unit??previous.materials?.[code]?.unit??'',
      changePercent:before>0&&now>0?percent(before,now):null,
    };
  }).filter(x=>x.changePercent!=null).sort((a,b)=>Math.abs(b.changePercent)-Math.abs(a.changePercent));
}

function percent(before,now) {
  return Math.round(((now-before)/before)*1000)/10;
}
