export function htmlToText(html='') {
  return decodeEntities(String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/\s+/g,' ')
    .trim());
}

export function parsePriceSource(adapter,html,{checkedAt}={}) {
  const text=htmlToText(html);
  if (!text) throw new Error('empty-source-content');
  const parsed=adapter.type==='official'
    ? parseOfficial(text,adapter)
    : parseObservation(text,adapter);
  return {
    sourcePatch:{
      sourceDate:parsed.sourceDate??null,
      verifiedAt:String(checkedAt),
      lastCheckedAt:String(checkedAt),
      lastError:null,
      note:parsed.note??adapter.note??null,
    },
    observationPatch:parsed.observation??null,
  };
}

export function parseDateFromText(text,{datePatterns=[]}={}) {
  for (const pattern of datePatterns) {
    const match=String(text).match(pattern);
    if (!match) continue;
    const raw=match.groups?.date??match[1];
    const normalized=normalizeDate(raw);
    if (normalized) return normalized;
  }
  return null;
}

export function normalizeDate(raw) {
  const value=String(raw??'').trim();
  let m=value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) return iso(Number(m[3]),Number(m[2]),Number(m[1]));
  m=value.match(/^(\d{1,2})[\/-](\d{4})$/);
  if (m) return iso(Number(m[2]),Number(m[1]),1);
  m=value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return value;
  return null;
}

export function parseMoney(raw) {
  const digits=String(raw??'').replace(/[^0-9]/g,'');
  return digits?Number(digits):null;
}

function parseOfficial(text,adapter) {
  const matches=[...text.matchAll(adapter.entryPattern)];
  if (!matches.length) throw new Error('official-entry-not-found');
  const rows=matches.map(match=>{
    const sourceDate=normalizeDate(match.groups?.date??'');
    const month=match.groups?.month??'';
    const number=match.groups?.number??'';
    if (!sourceDate) return null;
    return {sourceDate,month,number};
  }).filter(Boolean).sort((a,b)=>a.sourceDate.localeCompare(b.sourceDate));
  const latest=rows.at(-1);
  if (!latest) throw new Error('official-date-not-found');
  return {
    sourceDate:latest.sourceDate,
    note:`Công bố giá VLXD TP.HCM tháng ${latest.month}; số ${latest.number}.`,
    observation:null,
  };
}

function parseObservation(text,adapter) {
  const sourceDate=parseDateFromText(text,adapter);
  let min,max;
  if (adapter.extract?.type==='range-near') {
    [min,max]=rangeNear(text,adapter.extract);
  } else if (adapter.extract?.type==='exact-near') {
    const value=exactNear(text,adapter.extract);
    min=value; max=value;
  } else if (adapter.extract?.type==='numeric-band') {
    [min,max]=numericBand(text,adapter.extract);
  } else {
    throw new Error('unsupported-extractor');
  }
  if (!(min>0)||!(max>=min)) throw new Error('invalid-price-range');
  return {
    sourceDate,
    observation:{
      code:adapter.code,min,max,unit:adapter.unit,sourceId:adapter.id,
      dateBasis:sourceDate?(adapter.periodDate?'period':'explicit'):'verified',
      province:adapter.province??'TP.HCM',
      vatIncluded:adapter.vatIncluded??null,
      deliveryIncluded:adapter.deliveryIncluded??null,
    },
  };
}

function rangeNear(text,{marker,window=600,rangeIndex=0,minValue=1,maxValue=100_000_000}) {
  const segment=segmentAfter(text,marker,window);
  const ranges=[...segment.matchAll(/([0-9][0-9.,]{3,})\s*(?:đ|vnđ)?(?:\s*\/?\s*m[²2])?\s*(?:[–—-]|đến)\s*([0-9][0-9.,]{3,})/gi)]
    .map(m=>[parseMoney(m[1]),parseMoney(m[2])])
    .filter(([a,b])=>a>=minValue&&b<=maxValue&&b>=a);
  const row=ranges[rangeIndex]??ranges[0];
  if (!row) throw new Error('price-range-not-found');
  return row;
}

function exactNear(text,{marker,window=500,valueIndex=0,minValue=1,maxValue=100_000_000}) {
  const segment=segmentAfter(text,marker,window);
  const values=[...segment.matchAll(/(?:^|\s)([0-9]{1,3}(?:[.,][0-9]{3}){1,3})(?:\s*(?:đ|vnđ))?/gi)]
    .map(m=>parseMoney(m[1]))
    .filter(v=>v>=minValue&&v<=maxValue);
  const value=values[valueIndex]??values[0];
  if (!(value>0)) throw new Error('price-value-not-found');
  return value;
}

function numericBand(text,{marker='',window=8000,minValue,maxValue}) {
  const segment=marker?segmentAfter(text,marker,window):text.slice(0,window);
  const values=[...segment.matchAll(/(?:^|\s)([0-9]{1,3}(?:[.,][0-9]{3})+)(?:\s*(?:đ|vnđ))?/gi)]
    .map(m=>parseMoney(m[1]))
    .filter(v=>v>=minValue&&v<=maxValue);
  const unique=[...new Set(values)].sort((a,b)=>a-b);
  if (!unique.length) throw new Error('numeric-band-not-found');
  return [unique[0],unique.at(-1)];
}

function segmentAfter(text,marker,window) {
  const hay=normalizeSearch(text),needle=normalizeSearch(marker);
  const index=hay.indexOf(needle);
  if (index<0) throw new Error('marker-not-found: '+marker);
  return text.slice(index,index+window);
}

function normalizeSearch(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&ndash;|&#8211;/gi,'–')
    .replace(/&mdash;|&#8212;/gi,'—')
    .replace(/&sup2;|&#178;/gi,'²')
    .replace(/&sup3;|&#179;/gi,'³')
    .replace(/&amp;/gi,'&')
    .replace(/&quot;/gi,'"')
    .replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<')
    .replace(/&gt;/gi,'>');
}

function iso(year,month,day) {
  if (!(year>=2000&&year<=2100&&month>=1&&month<=12&&day>=1&&day<=31)) return null;
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
