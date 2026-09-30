import { standardRef } from './common.js';

const SOURCE='https://moc.gov.vn/Images/editor/files/Quy%20Chu%E1%BA%A9n/BXD_02-2022-TT-BXD_26092022.pdf';

export const QCVN02_WIND_ZONES=Object.freeze({
  I:{w0DaNm2:65,v3s50Mps:36,v10m50Mps:26},
  II:{w0DaNm2:95,v3s50Mps:44,v10m50Mps:31},
  III:{w0DaNm2:125,v3s50Mps:50,v10m50Mps:36},
  IV:{w0DaNm2:155,v3s50Mps:56,v10m50Mps:40},
  V:{w0DaNm2:185,v3s50Mps:61,v10m50Mps:43},
});

export function validateQcvn02WindRow(row) {
  if (!row?.province||!row?.zone||!row?.sourceRow) throw new TypeError('province, zone and sourceRow are required');
  const zone=String(row.zone).toUpperCase();
  const metrics=QCVN02_WIND_ZONES[zone];
  if (!metrics) throw new RangeError('zone must be I, II, III, IV or V');
  for (const [key,expected] of Object.entries(metrics)) {
    if (row[key]!=null && Number(row[key])!==expected) {
      throw new RangeError(key+' does not match QCVN 02 zone '+zone);
    }
  }
  return {
    ...structuredClone(row),zone,...metrics,
    sourceUrl:String(row.sourceUrl ?? SOURCE),
    standard:'QCVN 02:2022/BXD',
    clause:'5.2.2-5.2.4, Table 5.1',
  };
}

export function createQcvn02WindRegistry(rows) {
  if (!Array.isArray(rows)||rows.length===0) throw new TypeError('rows are required');
  return rows.map(validateQcvn02WindRow);
}

export function resolveQcvn02WindLocality({registry,province,district=null,commune=null}) {
  if (!Array.isArray(registry)||registry.length===0) throw new TypeError('registry is required');
  const target={province:norm(province),district:norm(district),commune:norm(commune)};
  if (!target.province) throw new TypeError('province is required');

  const matches=registry
    .map((row)=>({row,score:matchScore(row,target)}))
    .filter(x=>x.score>=0)
    .sort((a,b)=>b.score-a.score);

  if (!matches.length) {
    return {
      blocked:true,
      reason:'No exact sourced QCVN 02:2022/BXD Table 5.1 locality row matches this administrative path. Supply the official Table 5.1 row or an authority-issued/map-derived wind value under 5.2.4.',
      target,
    };
  }
  const topScore=matches[0].score;
  const top=matches.filter(x=>x.score===topScore);
  const zones=new Set(top.map(x=>x.row.zone));
  if (zones.size>1) {
    return {blocked:true,reason:'Ambiguous equally specific QCVN 02 locality rows',target,candidates:top.map(x=>x.row.sourceRow)};
  }
  const row=top[0].row;
  return {
    zone:row.zone,w0DaNm2:row.w0DaNm2,v3s50Mps:row.v3s50Mps,v10m50Mps:row.v10m50Mps,
    locality:{province,district,commune},
    sourceRow:row.sourceRow,sourceUrl:row.sourceUrl,
    level:'engineering-review',
    reference:standardRef({
      standard:'QCVN 02:2022/BXD',clause:'5.2.2-5.2.4, Table 5.1',
      sourceUrl:row.sourceUrl,
      note:'Resolved from the most specific matching sourced administrative row. No unsourced fallback zone is used.',
    }),
  };
}

export function authorityWindInput({w0DaNm2=null,v3s20Mps=null,sourceAuthority,sourceDocument}) {
  if (!sourceAuthority||!sourceDocument) throw new TypeError('sourceAuthority and sourceDocument are required');
  let w0;
  if (w0DaNm2!=null) {
    w0=Number(w0DaNm2);
    if (!(w0>0)) throw new RangeError('w0DaNm2 must be >0');
  } else {
    const v=Number(v3s20Mps);
    if (!(v>0)) throw new RangeError('v3s20Mps must be >0 when w0DaNm2 is omitted');
    w0=0.0613*v*v;
  }
  return {
    w0DaNm2:round(w0,4),sourceAuthority:String(sourceAuthority),sourceDocument:String(sourceDocument),
    level:'engineering-review',
    reference:standardRef({
      standard:'QCVN 02:2022/BXD',clause:'5.2.4 and equation (5.1)',
      formula:'W0=0.0613 V0^2 when competent authority supplies V0 instead of W0',
      sourceUrl:SOURCE,
    }),
  };
}

export const QCVN02_BUILTIN_ROWS=createQcvn02WindRegistry([
  {province:'Thành phố Hồ Chí Minh',district:'*',excludeDistricts:['Củ Chi'],zone:'II',sourceRow:'HCMC all cities/districts including Thu Duc except Cu Chi',sourceUrl:SOURCE},
  {province:'Thành phố Hồ Chí Minh',district:'Củ Chi',zone:'I',sourceRow:'HCMC - Cu Chi',sourceUrl:SOURCE},
  {province:'Thành phố Cần Thơ',district:'*',zone:'II',sourceRow:'Can Tho - all districts',sourceUrl:SOURCE},
  {province:'Bà Rịa - Vũng Tàu',district:'*',excludeDistricts:['Côn Đảo'],zone:'II',sourceRow:'Ba Ria-Vung Tau except Con Dao',sourceUrl:SOURCE},
  {province:'Bà Rịa - Vũng Tàu',district:'Côn Đảo',zone:'III',sourceRow:'Ba Ria-Vung Tau - Con Dao',sourceUrl:SOURCE},
  {province:'Khánh Hòa',district:'Trường Sa',zone:'IV',sourceRow:'Khanh Hoa - Truong Sa islands',sourceUrl:SOURCE},
  {province:'Đà Nẵng',district:'Hoàng Sa',zone:'V',sourceRow:'Da Nang - Hoang Sa islands',sourceUrl:SOURCE},
]);

function matchScore(row,target) {
  if (norm(row.province)!==target.province) return -1;
  let score=10;
  if (row.district && row.district!=='*') {
    if (norm(row.district)!==target.district) return -1;
    score+=10;
  } else if (Array.isArray(row.excludeDistricts) && row.excludeDistricts.some(x=>norm(x)===target.district)) {
    return -1;
  }
  if (row.commune && row.commune!=='*') {
    if (norm(row.commune)!==target.commune) return -1;
    score+=10;
  } else if (Array.isArray(row.excludeCommunes) && row.excludeCommunes.some(x=>norm(x)===target.commune)) {
    return -1;
  }
  if (Array.isArray(row.includeCommunes)) {
    if (!row.includeCommunes.some(x=>norm(x)===target.commune)) return -1;
    score+=5;
  }
  return score+Number(row.priority??0);
}
function norm(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/\b(thanh pho|tp\.?|quan|huyen|thi xa|tx\.?|xa|phuong|thi tran)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
