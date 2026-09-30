import { standardRef, standardResult } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Xay-dung/TCVN-10304-2025-Thiet-ke-mong-coc-921806.aspx';

export function poissonKv(nu) {
  const v=Number(nu);
  if (!(v>=0&&v<=0.5)) throw new RangeError('Poisson ratio must be 0..0.5');
  return standardResult({
    value:round(2.82-3.78*v+2.18*v*v,6),unit:'ratio',formulaId:'TCVN10304-2025-Eq33',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.2, equation (33)',
      formula:'kv = 2.82 - 3.78 nu + 2.18 nu^2',sourceUrl:SOURCE,
    }),
    inputs:{nu:v},
  });
}

export function soilShearModulusFromE0({E0Mpa,poissonRatio=null,usePermittedApproximation=false}) {
  const E=Number(E0Mpa);
  if (!(E>0)) throw new RangeError('E0Mpa must be > 0');
  if (usePermittedApproximation) {
    return standardResult({
      value:0.4*E,unit:'MPa',formulaId:'TCVN10304-2025-7.4.2-G-approx',
      reference:standardRef({
        standard:'TCVN 10304:2025',clause:'7.4.2 note after Table 18',
        formula:'G may be taken as 0.4 E0',sourceUrl:SOURCE,
      }),
      inputs:{E0Mpa:E,usePermittedApproximation:true},
    });
  }
  const nu=Number(poissonRatio);
  if (!(nu>=0&&nu<0.5)) throw new RangeError('poissonRatio must be provided in [0,0.5)');
  return standardResult({
    value:E/(2*(1+nu)),unit:'MPa',formulaId:'elastic-G',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.2 note after Table 18',
      formula:'G = E0 / [2(1+nu)]',sourceUrl:SOURCE,
    }),
    inputs:{E0Mpa:E,poissonRatio:nu},
  });
}

export function longFrictionPileSettlement({
  loadMN,G1Mpa,G2Mpa,nu1,nu2,pileLengthM,pileDiameterM,pileElasticModulusMpa,pileAreaM2
}) {
  for (const [name,value] of Object.entries({G1Mpa,G2Mpa,pileLengthM,pileDiameterM,pileElasticModulusMpa,pileAreaM2})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!(Number(loadMN)>=0)) throw new RangeError('loadMN must be >= 0');
  const L=Number(pileLengthM),d=Number(pileDiameterM),G1=Number(G1Mpa),G2=Number(G2Mpa);
  if (!(L/d>5)) throw new RangeError('TCVN 10304 7.4.2 requires L/d > 5');
  const k=G1*L/(G2*d);
  if (!(k>=7.5)) throw new RangeError('Eq.(30) long-friction-pile branch requires k >= 7.5');

  const nuAvg=(Number(nu1)+Number(nu2))/2;
  const kv=poissonKv(nuAvg).value;
  const kv1=poissonKv(Number(nu1)).value;
  const betaPrime=0.17*Math.log(kv*k);
  const alphaPrime=0.17*Math.log(kv1*L/d);
  const EA=Number(pileElasticModulusMpa)*Number(pileAreaM2);
  const chi=EA/(G1*L*L);
  const chi34=chi**0.75;
  const lambda1=(2.12*chi34)/(1+2.12*chi34);
  const beta=betaPrime/lambda1 + 0.3*(1-betaPrime/alphaPrime)/chi;
  const settlementM=beta*Number(loadMN)/(G1*L);

  return standardResult({
    value:round(settlementM*1000,4),unit:'mm',formulaId:'TCVN10304-2025-Eq30-33',
    reference:standardRef({
      standard:'TCVN 10304:2025',clause:'7.4.2, equations (30)-(33)',
      formula:'s=beta Nd,SLS/(G1 L); beta=betaPrime/lambda1+0.3(1-betaPrime/alphaPrime)/chi; lambda1=2.12 chi^(3/4)/(1+2.12 chi^(3/4)); kv=2.82-3.78nu+2.18nu^2',
      sourceUrl:SOURCE,
    }),
    inputs:{
      loadMN:Number(loadMN),G1Mpa:G1,G2Mpa:G2,nu1:Number(nu1),nu2:Number(nu2),
      pileLengthM:L,pileDiameterM:d,pileElasticModulusMpa:Number(pileElasticModulusMpa),pileAreaM2:Number(pileAreaM2),
      k:round(k,6),kv,kv1,betaPrime:round(betaPrime,6),alphaPrime:round(alphaPrime,6),
      EA_MN:round(EA,6),chi:round(chi,6),lambda1:round(lambda1,6),beta:round(beta,6),
    },
  });
}

function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
