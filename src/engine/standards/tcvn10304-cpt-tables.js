import { standardRef } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

const BETA1_ROWS=[
  {qs:1000,driven:0.90,screwCompression:0.50,screwTension:0.40},
  {qs:2500,driven:0.80,screwCompression:0.45,screwTension:0.38},
  {qs:5000,driven:0.65,screwCompression:0.32,screwTension:0.27},
  {qs:7500,driven:0.55,screwCompression:0.26,screwTension:0.22},
  {qs:10000,driven:0.45,screwCompression:0.23,screwTension:0.19},
  {qs:15000,driven:0.35,screwCompression:null,screwTension:null},
  {qs:20000,driven:0.30,screwCompression:null,screwTension:null},
  {qs:30000,driven:0.20,screwCompression:null,screwTension:null},
];

const SIDE_ROWS=[
  {fs:20,beta2Sand:2.40,beta2Clay:1.50,betaISand:0.75,betaIClay:1.00},
  {fs:40,beta2Sand:1.65,beta2Clay:1.00,betaISand:0.60,betaIClay:0.75},
  {fs:60,beta2Sand:1.20,beta2Clay:0.75,betaISand:0.55,betaIClay:0.60},
  {fs:80,beta2Sand:1.00,beta2Clay:0.60,betaISand:0.50,betaIClay:0.45},
  {fs:100,beta2Sand:0.85,beta2Clay:0.50,betaISand:0.45,betaIClay:0.40},
  {fs:120,beta2Sand:0.75,beta2Clay:0.40,betaISand:0.40,betaIClay:0.30},
];

const BORED_ROWS=[
  {qc:1000,qbSand:null,qbClay:200,fiSand:null,fiClay:15},
  {qc:2500,qbSand:null,qbClay:580,fiSand:null,fiClay:25},
  {qc:5000,qbSand:900,qbClay:900,fiSand:30,fiClay:35},
  {qc:7500,qbSand:1100,qbClay:1200,fiSand:40,fiClay:45},
  {qc:10000,qbSand:1300,qbClay:1400,fiSand:50,fiClay:60},
  {qc:12000,qbSand:1400,qbClay:null,fiSand:60,fiClay:null},
  {qc:15000,qbSand:1500,qbClay:null,fiSand:70,fiClay:null},
  {qc:20000,qbSand:2000,qbClay:null,fiSand:70,fiClay:null},
];

export function cptBeta1({qsKpa,pileType='driven'}) {
  const q=Number(qsKpa);
  if (!(q>0)) throw new RangeError('qsKpa must be >0');
  const key={driven:'driven',screwCompression:'screwCompression',screwTension:'screwTension'}[pileType];
  if (!key) throw new RangeError('pileType must be driven, screwCompression or screwTension');
  const row=boundaryRow(BETA1_ROWS,q,'qs');
  const value=row[key];
  if (value==null) throw new RangeError('TCVN Table 15 has no coefficient for selected pile type at this qs row');
  return traced(value,'7.3.4.2-7.3.4.3, Table 15',{qsKpa:q,pileType,tableQsKpa:row.qs});
}

export function cptSideCoefficient({fsKpa,probeType='I',soil='sand'}) {
  const f=Number(fsKpa);
  if (!(f>=0)) throw new RangeError('fsKpa must be >=0');
  if (!['sand','clay'].includes(soil)) throw new RangeError('soil must be sand or clay');
  const row=boundaryRow(SIDE_ROWS,f,'fs');
  const key=probeType==='I'
    ? (soil==='sand'?'beta2Sand':'beta2Clay')
    : ['II','III'].includes(probeType)
      ? (soil==='sand'?'betaISand':'betaIClay')
      : null;
  if (!key) throw new RangeError('probeType must be I, II or III');
  return traced(row[key],'7.3.4.2, Table 15',{fsKpa:f,probeType,soil,tableFsKpa:row.fs});
}

export function boredCptCoefficient({qcKpa,soil='sand',kind='toe'}) {
  const q=Number(qcKpa);
  if (!(q>=1000&&q<=20000)) throw new RangeError('Table 16 implemented for qc 1000..20000 kPa');
  if (!['sand','clay'].includes(soil)) throw new RangeError('soil must be sand or clay');
  if (!['toe','shaft'].includes(kind)) throw new RangeError('kind must be toe or shaft');
  const key=kind==='toe'?(soil==='sand'?'qbSand':'qbClay'):(soil==='sand'?'fiSand':'fiClay');
  const exact=BORED_ROWS.find(r=>r.qc===q);
  if (exact) {
    if (exact[key]==null) throw new RangeError('Table 16 has no value for selected soil/kind at this qc');
    return boredTrace(exact[key],q,soil,kind,{interpolated:false});
  }
  const [lo,hi]=bracket(BORED_ROWS,q,'qc');
  if (!lo||!hi||lo[key]==null||hi[key]==null) throw new RangeError('Table 16 interpolation cannot cross a missing-value interval');
  const value=lo[key]+(hi[key]-lo[key])*(q-lo.qc)/(hi.qc-lo.qc);
  return boredTrace(round(value,4),q,soil,kind,{interpolated:true,lower:lo.qc,upper:hi.qc});
}

export function boredPileCptCapacity({toeQcKpa,toeSoil,toeAreaM2,perimeterM,embedmentM,layers}) {
  if (!(Number(toeAreaM2)>0)||!(Number(perimeterM)>0)||!(Number(embedmentM)>=5)) {
    throw new RangeError('Table 16 requires toeArea/perimeter >0 and embedmentM >=5');
  }
  if (!Array.isArray(layers)||!layers.length) throw new TypeError('layers are required');
  const qb=boredCptCoefficient({qcKpa:toeQcKpa,soil:toeSoil,kind:'toe'});
  let shaft=0;
  const detail=layers.map((layer,i)=>{
    const h=Number(layer.thicknessM);
    if (!(h>0)) throw new RangeError('layer '+i+' thicknessM must be >0');
    const fi=boredCptCoefficient({qcKpa:layer.qcKpa,soil:layer.soil,kind:'shaft'});
    const contribution=fi.value*h*Number(perimeterM);
    shaft+=contribution;
    return {...layer,fiKpa:fi.value,contributionKn:round(contribution,4),reference:fi.reference};
  });
  const toe=qb.value*Number(toeAreaM2);
  return {
    value:round(toe+shaft,4),unit:'kN',formulaId:'TCVN10304-2025-Eq29-Table16',
    checks:{toeResistanceKpa:qb.value,toeKn:round(toe,4),shaftKn:round(shaft,4)},
    inputs:{toeQcKpa:Number(toeQcKpa),toeSoil,toeAreaM2:Number(toeAreaM2),perimeterM:Number(perimeterM),embedmentM:Number(embedmentM),layers:detail},
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 10304:2025',clause:'7.3.4.4, equation (29), Table 16',formula:'Rk,u = qb A + sum(fi hi u); intermediate qc by linear interpolation',sourceUrl:SOURCE,note:'Table 16 applies to bored piles diameter 600-1200 mm embedded at least 5 m.'}),
  };
}

function boundaryRow(rows,x,key) {
  if (x<=rows[0][key]) return rows[0];
  if (x>=rows.at(-1)[key]) return rows.at(-1);
  const exact=rows.find(r=>r[key]===x);
  if (exact) return exact;
  throw new RangeError('Table 15 does not state interpolation; use an exact tabulated row or a separately sourced coefficient');
}
function bracket(rows,x,key){for(let i=1;i<rows.length;i++)if(x>rows[i-1][key]&&x<rows[i][key])return[rows[i-1],rows[i]];return[null,null];}
function traced(value,clause,inputs){return {value,inputs,level:'engineering-review',reference:standardRef({standard:'TCVN 10304:2025',clause,sourceUrl:SOURCE,note:'Exact Table 15 row; no interpolation assumed.'})};}
function boredTrace(value,qcKpa,soil,kind,meta){return {value,qcKpa,soil,kind,...meta,level:'engineering-review',reference:standardRef({standard:'TCVN 10304:2025',clause:'7.3.4.4, Table 16 notes 1-3',sourceUrl:SOURCE,note:'Intermediate qc values use linear interpolation. Applicable to bored piles d=600-1200 mm, embedment >=5 m.'})};}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
