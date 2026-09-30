import { standardRef, standardResult } from './common.js';
import { appendixGStatistics95 } from './tcvn10304-statistics.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

export function drivenPressedSptPoint({
  toeSoil,toeN=null,toeCuKpa=null,eta=1,toeAreaM2,perimeterM,layers
}) {
  if (!['granular','cohesive'].includes(toeSoil)) throw new RangeError('toeSoil must be granular or cohesive');
  if (!(Number(toeAreaM2)>0)||!(Number(perimeterM)>0)) throw new RangeError('toeAreaM2 and perimeterM must be >0');
  if (!(Number(eta)>0)) throw new RangeError('eta must be >0');
  if (!Array.isArray(layers)) throw new TypeError('layers are required');

  let qb;
  if (toeSoil==='granular') {
    const N=Math.min(requireNonNegative('toeN',toeN),100);
    qb=Math.min(300*Number(eta)*N,18000);
  } else {
    const cu=resolveCu({cuKpa:toeCuKpa,Nc:null,name:'toe'});
    qb=Math.min(6*cu,18000);
  }

  let RuFs=0,RuFc=0;
  const detail=layers.map((layer,i)=>{
    const h=Number(layer.thicknessM);
    if (!(h>=0)) throw new RangeError('layers['+i+'].thicknessM must be >=0');
    if (layer.soil==='granular') {
      const Ns=Math.min(requireNonNegative('Ns',layer.Ns),100);
      const fs=Math.min(2*Ns,100);
      const part=fs*h*Number(perimeterM); RuFs+=part;
      return {...layer,Ns,fsKpa:fs,contributionKn:round(part,4)};
    }
    if (layer.soil==='cohesive') {
      const cu=resolveCu({cuKpa:layer.cuKpa,Nc:layer.Nc,name:'layers['+i+']'});
      const fc=Math.min(0.8*cu,100);
      const part=fc*h*Number(perimeterM); RuFc+=part;
      return {...layer,cuKpa:cu,fcKpa:fc,contributionKn:round(part,4)};
    }
    throw new RangeError('layers['+i+'].soil must be granular or cohesive');
  });

  const RuB=qb*Number(toeAreaM2);
  const Ru=RuB+RuFs+RuFc;
  return standardResult({
    value:round(Ru,4),unit:'kN',formulaId:'TCVN10304-2025-D1-D6-driven',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'Appendix D, equations (D.1)-(D.6), Table D.1 row 5 driven/pressed pile',
      formula:'Ru=qb A + fs Ls u + fc Lc u; qb=min(300 eta N or 6cu,18000); fs=min(2Ns,100); fc=min(0.8cu,100)',
      sourceUrl:SOURCE,
    }),
    inputs:{toeSoil,toeN,toeCuKpa,eta:Number(eta),toeAreaM2:Number(toeAreaM2),perimeterM:Number(perimeterM),layers:detail},
    checks:{qbKpa:round(qb,3),RuBKn:round(RuB,4),RuFsKn:round(RuFs,4),RuFcKn:round(RuFc,4)},
  });
}

export function sptCharacteristicCapacity(points) {
  if (!Array.isArray(points)||points.length===0) throw new TypeError('SPT point capacities are required');
  const values=points.map(p=>Number(p?.value??p));
  if (!values.every(v=>v>0)) throw new RangeError('all SPT point capacities must be >0');
  if (values.length<6) {
    const minimum=Math.min(...values);
    return {
      RkKn:minimum,RuKKn:minimum,gammaCg1:1,method:'Ru,min for n<6',
      level:'engineering-review',
      reference:standardRef({standard:'TCVN 10304:2025',clause:'Appendix D, D.1 and 7.3.2',formula:'n<6: Ru,k=Ru,min and gamma_c,g1=1.0',sourceUrl:SOURCE}),
    };
  }
  const stats=appendixGStatistics95(values);
  return {
    RkKn:stats.standardValue,RuKKn:stats.standardValue,gammaCg1:stats.gammaG,
    designBasisKn:stats.designValue,statistics:stats,method:'Appendix G alpha=0.95',
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 10304:2025',clause:'Appendix D D.1; 7.3.2; Appendix G G.2',sourceUrl:SOURCE}),
  };
}

export function drivenCptPoint({
  toeAreaM2,perimeterM,embedmentM,qsKpa,beta1Driven,
  probeType='I',fsKpa=null,beta2=null,layers=null
}) {
  for (const [name,value] of Object.entries({toeAreaM2,perimeterM,embedmentM,qsKpa,beta1Driven})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be >0');
  }
  const Rs=Number(beta1Driven)*Number(qsKpa);
  let f;
  let detail=null;
  if (probeType==='I') {
    if (!(Number(fsKpa)>=0)||!(Number(beta2)>0)) throw new RangeError('probe type I requires fsKpa>=0 and beta2>0');
    f=Number(beta2)*Number(fsKpa);
  } else if (['II','III'].includes(probeType)) {
    if (!Array.isArray(layers)||!layers.length) throw new TypeError('probe type II/III requires layers');
    let sum=0,totalH=0;
    detail=layers.map((layer,i)=>{
      const fi=Number(layer.fsiKpa),h=Number(layer.thicknessM),beta=Number(layer.betaI);
      if (!(fi>=0)||!(h>0)||!(beta>0)) throw new RangeError('invalid CPT layer '+i);
      sum+=beta*fi*h; totalH+=h;
      return {...layer,weighted:round(beta*fi*h,4)};
    });
    f=sum/totalH;
  } else throw new RangeError('probeType must be I, II or III');

  const Ru=Rs*Number(toeAreaM2)+f*Number(embedmentM)*Number(perimeterM);
  return standardResult({
    value:round(Ru,4),unit:'kN',formulaId:'TCVN10304-2025-Eq25-28',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.3.4.2, equations (25)-(28), Table 15',
      formula:'Ru=Rs A + f h u; Rs=beta1 qs; type I f=beta2 fs; type II/III f=sum(beta_i fsi hi)/h',
      sourceUrl:SOURCE,
    }),
    inputs:{toeAreaM2:Number(toeAreaM2),perimeterM:Number(perimeterM),embedmentM:Number(embedmentM),qsKpa:Number(qsKpa),beta1Driven:Number(beta1Driven),probeType,fsKpa,beta2,layers:detail},
    checks:{RsKpa:round(Rs,4),averageSideResistanceKpa:round(f,4)},
    warnings:['Table 15 coefficient values must be selected from the published table for the measured qs/fs/fsi; BuildMate does not interpolate Table 15 unless the standard explicitly permits it.'],
  });
}

function resolveCu({cuKpa,Nc,name}) {
  if (Number(cuKpa)>0) return Number(cuKpa);
  if (Number(Nc)>=0) return 6.25*Math.min(Number(Nc),100);
  throw new RangeError(name+' cohesive soil requires cuKpa or Nc');
}
function requireNonNegative(name,v){const n=Number(v);if(!(n>=0))throw new RangeError(name+' must be >=0');return n;}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
