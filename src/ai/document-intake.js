import { interpretHomeownerText } from './intake.js';

const LABELS=Object.freeze({
  'location.province':'Tỉnh/thành',
  'land.widthM':'Rộng đất (m)',
  'land.lengthM':'Dài đất (m)',
  'design.storeys':'Số tầng',
  'household.people':'Số người',
  'household.bedrooms':'Phòng ngủ',
  'budget.totalVnd':'Ngân sách mục tiêu',
  'pricing.sourceLabel':'Nguồn báo giá',
  'pricing.effectiveDate':'Ngày báo giá',
  'pricing.items.concrete':'Bê tông (VND/m³)',
  'pricing.items.rebar':'Thép (VND/kg)',
  'pricing.items.masonry':'Xây tường (VND/m²)',
  'pricing.items.plaster':'Tô trát (VND/m²)',
  'pricing.items.paint':'Sơn (VND/m²)',
  'pricing.items.electrical':'Điểm điện',
  'pricing.items.plumbing':'Điểm nước',
  'engineering.allowableBearingKpa':'Áp lực nền cơ sở (kPa)',
  'engineering.allowableBearingSource':'Nguồn địa kỹ thuật',
  'mep.connectedPowerW':'Công suất điện kết nối (W)',
  'mep.demandFactor':'Hệ số nhu cầu',
  'mep.powerFactor':'Hệ số công suất',
  'mep.fixtureEquivalentUnits':'Tổng đương lượng thiết bị vệ sinh',
  'mep.waterLitersPerPersonDay':'Mức dùng nước (L/người.ngày)',
});

const PRICE_ITEMS=[
  ['pricing.items.concrete',['be tong','concrete']],
  ['pricing.items.rebar',['thep','rebar']],
  ['pricing.items.masonry',['xay tuong','masonry']],
  ['pricing.items.plaster',['to trat','plaster']],
  ['pricing.items.paint',['son ba','son nuoc','paint']],
  ['pricing.items.electrical',['diem dien','electrical point']],
  ['pricing.items.plumbing',['diem nuoc','thiet bi/diem nuoc','plumbing point']],
];

const DIRECT_FIELDS=[
  ['engineering.allowableBearingKpa',['ap luc nen','suc chiu tai nen','allowable bearing','bearing pressure']],
  ['mep.connectedPowerW',['cong suat dien ket noi','connected power']],
  ['mep.demandFactor',['he so nhu cau','demand factor']],
  ['mep.powerFactor',['he so cong suat','power factor']],
  ['mep.fixtureEquivalentUnits',['tong duong luong thiet bi','fixture equivalent']],
  ['mep.waterLitersPerPersonDay',['muc dung nuoc','liters per person','l/nguoi']],
];

export function extractDocumentCandidates(text,{fileName='Tài liệu'}={}) {
  const source=String(text??'');
  const candidates=[];
  const natural=interpretHomeownerText(source);
  for(const item of natural.updates) {
    add(candidates,{
      path:item.path,value:item.value,
      label:labelForPath(item.path),kind:typeof item.value==='number'?'number':'text',
      confidence:'medium',reason:'Nhận diện từ nội dung mô tả',source:fileName,
    });
  }

  const tablePrices=extractPriceTable(source,fileName);
  for(const item of tablePrices) add(candidates,item);

  const lines=source.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  for(const line of lines) {
    const normalized=normalize(line);
    for(const [path,aliases] of DIRECT_FIELDS) {
      if (!aliases.some(alias=>normalized.includes(alias))) continue;
      const value=lastNumber(line);
      if (Number.isFinite(value)) add(candidates,{
        path,value,label:labelForPath(path),kind:'number',confidence:'medium',
        reason:'Nhận diện theo nhãn kỹ thuật trong tài liệu',source:fileName,
      });
    }
    for(const [path,aliases] of PRICE_ITEMS) {
      if (candidates.some(item=>item.path===path)) continue;
      if (!aliases.some(alias=>normalized.includes(alias))) continue;
      const numbers=allNumbers(line);
      if (!numbers.length) continue;
      const value=numbers.length>=2?numbers.at(-2):numbers.at(-1);
      if (Number.isFinite(value)&&value>0) add(candidates,{
        path,value,label:labelForPath(path),kind:'number',confidence:'low',
        reason:'Ước đoán đơn giá từ dòng có tên hạng mục; cần kiểm tra lại',source:fileName,
      });
    }
  }

  const hasPricing=candidates.some(item=>item.path.startsWith('pricing.items.'));
  if (hasPricing) {
    add(candidates,{
      path:'pricing.sourceLabel',value:fileName,label:labelForPath('pricing.sourceLabel'),
      kind:'text',confidence:'high',reason:'Tên file được dùng làm nguồn báo giá',source:fileName,
    });
    const date=findDate(source);
    if (date) add(candidates,{
      path:'pricing.effectiveDate',value:date,label:labelForPath('pricing.effectiveDate'),
      kind:'text',confidence:'medium',reason:'Ngày nhận diện trong tài liệu',source:fileName,
    });
  }

  if (candidates.some(item=>item.path==='engineering.allowableBearingKpa')) {
    add(candidates,{
      path:'engineering.allowableBearingSource',value:fileName,
      label:labelForPath('engineering.allowableBearingSource'),kind:'text',
      confidence:'high',reason:'Tên file được dùng làm nguồn địa kỹ thuật',source:fileName,
    });
  }

  return candidates;
}

export function labelForPath(path) {
  return LABELS[path]??path;
}

function extractPriceTable(text,fileName) {
  const rows=parseDelimited(text);
  if(rows.length<2) return [];
  const headerIndex=rows.findIndex(row=>{
    const normalized=row.map(normalize);
    return normalized.some(cell=>cell.includes('don gia')||cell.includes('unit price')) &&
      normalized.some(cell=>cell.includes('hang muc')||cell.includes('noi dung')||cell.includes('item'));
  });
  if(headerIndex<0) return [];

  const header=rows[headerIndex].map(normalize);
  const itemIndex=header.findIndex(cell=>cell.includes('hang muc')||cell.includes('noi dung')||cell.includes('item'));
  const priceIndex=header.findIndex(cell=>cell.includes('don gia')||cell.includes('unit price'));
  if(itemIndex<0||priceIndex<0) return [];

  const result=[];
  for(const row of rows.slice(headerIndex+1)) {
    const item=normalize(row[itemIndex]??'');
    const price=parseLocalizedNumber(row[priceIndex]);
    if(!(price>0)) continue;
    const match=PRICE_ITEMS.find(([,aliases])=>aliases.some(alias=>item.includes(alias)));
    if(!match) continue;
    result.push({
      path:match[0],value:price,label:labelForPath(match[0]),kind:'number',
      confidence:'high',reason:'Đọc từ cột Đơn giá của bảng',source:fileName,
    });
  }
  return result;
}

function parseDelimited(text) {
  const lines=String(text??'').split(/\r?\n/).filter(line=>line.trim());
  if(!lines.length) return [];
  const delimiter=guessDelimiter(lines.slice(0,5));
  if(!delimiter) return [];
  return lines.map(line=>splitCsvLine(line,delimiter));
}

function guessDelimiter(lines) {
  const options=[',',';','\t'];
  let best=null,bestScore=0;
  for(const delimiter of options) {
    const counts=lines.map(line=>splitCsvLine(line,delimiter).length);
    const score=Math.min(...counts);
    if(score>bestScore&&score>=2){best=delimiter;bestScore=score;}
  }
  return best;
}

function splitCsvLine(line,delimiter) {
  const cells=[]; let current='',quoted=false;
  for(let i=0;i<line.length;i+=1){
    const char=line[i];
    if(char==='"'&&line[i+1]==='"'&&quoted){current+='"';i+=1;continue;}
    if(char==='"'){quoted=!quoted;continue;}
    if(char===delimiter&&!quoted){cells.push(current.trim());current='';continue;}
    current+=char;
  }
  cells.push(current.trim());
  return cells;
}

function allNumbers(text) {
  const matches=String(text??'').match(/-?\d[\d.,\s]*/g)??[];
  return matches.map(parseLocalizedNumber).filter(Number.isFinite);
}

function lastNumber(text) {
  return allNumbers(text).at(-1);
}

function parseLocalizedNumber(raw) {
  let value=String(raw??'').trim().replace(/\s/g,'');
  if(!value) return NaN;
  const hasDot=value.includes('.'),hasComma=value.includes(',');
  if(hasDot&&hasComma) {
    if(value.lastIndexOf(',')>value.lastIndexOf('.')) value=value.replaceAll('.','').replace(',','.');
    else value=value.replaceAll(',','');
  } else if(hasComma) {
    const parts=value.split(',');
    value=parts.length>2||parts.at(-1).length===3&&parts[0].length>0?parts.join(''):value.replace(',','.');
  } else if(hasDot) {
    const parts=value.split('.');
    if(parts.length>2||parts.at(-1).length===3&&parts[0].length>0) value=parts.join('');
  }
  return Number(value);
}

function findDate(text) {
  const iso=String(text).match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if(iso) return [iso[1],pad(iso[2]),pad(iso[3])].join('-');
  const vi=String(text).match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if(vi) return [vi[3],pad(vi[2]),pad(vi[1])].join('-');
  return null;
}

function add(list,candidate) {
  const index=list.findIndex(item=>item.path===candidate.path);
  if(index<0) list.push(candidate);
  else if(rank(candidate.confidence)>rank(list[index].confidence)) list[index]=candidate;
}

function rank(value) {
  return ({low:1,medium:2,high:3})[value]??0;
}

function pad(value) {
  return String(value).padStart(2,'0');
}

function normalize(value) {
  return String(value??'').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
    .toLowerCase().replace(/\s+/g,' ').trim();
}
