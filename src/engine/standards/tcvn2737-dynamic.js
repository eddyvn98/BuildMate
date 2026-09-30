import { standardRef, standardResult } from './common.js';

const SOURCE='https://icci.vn/storage/documents/September2023/TCVN2737_2023_920293.pdf';

const TERRAIN=Object.freeze({
  A:{cr:0.15,lM:198.12,epsilon:1/8,bBar:0.80,alpha:1/9},
  B:{cr:0.20,lM:152.40,epsilon:1/5,bBar:0.65,alpha:1/6.5},
  C:{cr:0.30,lM:97.54,epsilon:1/3,bBar:0.45,alpha:1/4},
});

export function windDynamicTerrainCoefficients(terrain) {
  const row=TERRAIN[String(terrain).toUpperCase()];
  if (!row) throw new RangeError('terrain must be A, B or C');
  return {
    terrain:String(terrain).toUpperCase(),...row,level:'engineering-review',
    reference:standardRef({standard:'TCVN 2737:2023',clause:'10.2.7.3, Table 10',sourceUrl:SOURCE}),
  };
}

export function flexibleStructureGustFactor({
  heightM,widthM,depthM,firstNaturalFrequencyHz,v3s50Mps,terrain,
  structuralType='reinforcedConcrete'
}) {
  for (const [name,value] of Object.entries({heightM,widthM,depthM,firstNaturalFrequencyHz,v3s50Mps})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  const n1=Number(firstNaturalFrequencyHz);
  if (!(1/n1>1)) throw new RangeError('flexible-structure workflow requires T1=1/n1 > 1 s');
  const beta={steel:0.01,composite:0.015,concrete:0.02,reinforcedConcrete:0.02,masonry:0.02}[structuralType];
  if (!beta) throw new RangeError('unsupported structuralType');

  const t=windDynamicTerrainCoefficients(terrain);
  const h=Number(heightM),b=Number(widthM),d=Number(depthM),V3=Number(v3s50Mps);
  const zs=0.6*h;
  const I=t.cr*(10/zs)**(1/6);
  const L=t.lM*(zs/10)**t.epsilon;
  const gQ=3.4,gv=3.4;
  const logTerm=2*Math.log(3600*n1);
  if (!(logTerm>0)) throw new RangeError('3600*n1 must make logarithm positive');
  const gR=Math.sqrt(logTerm)+0.577/Math.sqrt(logTerm);
  const Q=Math.sqrt(1/(1+0.63*((b+h)/L)**0.63));
  const V=t.bBar*(zs/10)**t.alpha*V3;
  const N1=n1*L/V;
  const Rn=7.47*N1/(1+10.3*N1)**(5/3);
  const Rh=admittance(4.6*n1*h/V);
  const Rb=admittance(4.6*n1*b/V);
  const Rd=admittance(15.4*n1*d/V);
  const R=Math.sqrt((1/beta)*Rn*Rh*Rb*(0.53+0.47*Rd));
  const numerator=1+1.7*I*Math.sqrt((gQ*Q)**2+(gR*R)**2);
  const denominator=1+1.7*gv*I;
  const Gf=0.925*numerator/denominator;

  return standardResult({
    value:round(Gf,6),unit:'ratio',formulaId:'TCVN2737-2023-Eq13-24',
    reference:standardRef({
      standard:'TCVN 2737:2023',clause:'10.2.7.3, equations (13)-(24), Table 10',
      formula:'Gf=0.925[1+1.7I sqrt(gQ^2 Q^2+gR^2 R^2)]/[1+1.7 gv I], with Eq.(14)-(24) subexpressions',
      sourceUrl:SOURCE,
    }),
    inputs:{
      heightM:h,widthM:b,depthM:d,firstNaturalFrequencyHz:n1,v3s50Mps:V3,
      terrain:t.terrain,structuralType,beta,zsM:round(zs,4),turbulenceI:round(I,6),
      turbulenceLengthM:round(L,4),gQ,gv,gR:round(gR,6),Q:round(Q,6),
      hourlyWindMps:round(V,6),N1:round(N1,6),Rn:round(Rn,6),
      Rh:round(Rh,6),Rb:round(Rb,6),Rd:round(Rd,6),R:round(R,6),
    },
  });
}

function admittance(eta) {
  if (Math.abs(eta)<1e-12) return 1;
  return 1/eta-(1-Math.exp(-2*eta))/(2*eta*eta);
}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
