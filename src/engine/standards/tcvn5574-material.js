import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

const CREEP=Object.freeze({
  B10:[2.8,3.9,5.6],B15:[2.4,3.4,4.8],B20:[2.0,2.8,4.0],B25:[1.8,2.5,3.6],
  B30:[1.6,2.3,3.2],B35:[1.5,2.1,3.0],B40:[1.4,1.9,2.8],B45:[1.3,1.8,2.6],
  B50:[1.2,1.6,2.4],B55:[1.1,1.5,2.2],B60:[1.0,1.4,2.0],
  B70:[1.0,1.4,2.0],B80:[1.0,1.4,2.0],B90:[1.0,1.4,2.0],B100:[1.0,1.4,2.0],
});

const LONG_TERM_STRAINS=Object.freeze({
  high:{eb0:0.0030,eb2:0.0042,eb1red:0.0024,ebt0:0.00021,ebt2:0.00027,ebt1red:0.00019},
  medium:{eb0:0.0034,eb2:0.0048,eb1red:0.0028,ebt0:0.00024,ebt2:0.00031,ebt1red:0.00022},
  low:{eb0:0.0040,eb2:0.0056,eb1red:0.0034,ebt0:0.00028,ebt2:0.00036,ebt1red:0.00026},
});

export function concreteWorkingConditionFactors({
  loadDuration='all',
  concreteKind='reinforcedConcrete',
  verticalPourLayerHeightM=0,
  cellularMoisturePercent=null,
}) {
  if (!['all','permanent-long'].includes(loadDuration)) throw new RangeError('loadDuration must be all or permanent-long');
  const cellular=['cellular','porous'].includes(concreteKind);
  const plain=concreteKind==='plainConcrete';
  let gammaB1=loadDuration==='all'?1:(cellular?0.85:0.9);
  const gammaB2=plain?0.9:1;
  const gammaB3=Number(verticalPourLayerHeightM)>1.5?0.85:1;
  let gammaB4=1;
  if (cellular) {
    const w=Number(cellularMoisturePercent);
    if (!Number.isFinite(w)||w<0) throw new RangeError('cellularMoisturePercent is required and must be >=0 for cellular/porous concrete');
    if (w<=10) gammaB4=1;
    else if (w>25) gammaB4=0.85;
    else gammaB4=1-(w-10)*(0.15/15);
  }
  return {
    gammaB1,gammaB2,gammaB3,gammaB4,
    compressionFactor:round(gammaB1*gammaB2*gammaB3*gammaB4,6),
    tensionFactor:round(gammaB1,6),
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'6.1.2.3',
      formula:'Apply gamma_b1..gamma_b4 to concrete design strengths for the stated load/concrete/casting conditions',
      sourceUrl:SOURCE,
    }),
  };
}

export function applyConcreteWorkingConditions({RbMpa,RbtMpa,...conditions}) {
  if (!(Number(RbMpa)>0)||!(Number(RbtMpa)>0)) throw new RangeError('RbMpa and RbtMpa must be >0');
  const f=concreteWorkingConditionFactors(conditions);
  return {
    RbMpa:round(Number(RbMpa)*f.compressionFactor,4),
    RbtMpa:round(Number(RbtMpa)*f.tensionFactor,4),
    base:{RbMpa:Number(RbMpa),RbtMpa:Number(RbtMpa)},
    factors:f,
    level:'engineering-review',
    reference:f.reference,
  };
}

export function creepCoefficient({strengthClass,relativeHumidityPercent}) {
  const row=CREEP[strengthClass];
  if (!row) throw new RangeError('Table 11 implemented for heavy-concrete classes B10, B15...B100');
  const category=humidityCategory(relativeHumidityPercent);
  const index=category==='high'?0:category==='medium'?1:2;
  return standardResult({
    value:row[index],unit:'ratio',formulaId:'TCVN5574-2018-Table11',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'6.1.3.3, Table 11',
      sourceUrl:SOURCE,note:'Concrete creep coefficient by relative humidity and compressive-strength class.',
    }),
    inputs:{strengthClass,relativeHumidityPercent:Number(relativeHumidityPercent),humidityCategory:category},
  });
}

export function longTermConcreteStrains({strengthClass,relativeHumidityPercent}) {
  const category=humidityCategory(relativeHumidityPercent);
  const base=LONG_TERM_STRAINS[category];
  const B=parseStrength(strengthClass);
  let factor=1;
  if (B>60) {
    if (B<70||B>100) throw new RangeError('high-strength Table 9 factor is defined here for B70..B100');
    factor=(270-B)/210;
  }
  const values=Object.fromEntries(Object.entries(base).map(([k,v])=>[k,round(v*factor,8)]));
  return {
    ...values,strengthClass,relativeHumidityPercent:Number(relativeHumidityPercent),
    humidityCategory:category,highStrengthFactor:round(factor,8),
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'6.1.3.2, Table 9',
      formula:B>60?'Table 9 strains multiplied by (270-B)/210 for B70..B100':'Table 9 values',
      sourceUrl:SOURCE,
    }),
  };
}

export function longTermConcreteModulus({EbMpa,strengthClass,relativeHumidityPercent}) {
  if (!(Number(EbMpa)>0)) throw new RangeError('EbMpa must be >0');
  const phi=creepCoefficient({strengthClass,relativeHumidityPercent});
  return standardResult({
    value:round(Number(EbMpa)/(1+phi.value),4),unit:'MPa',formulaId:'TCVN5574-2018-Eq7-192',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'6.1.3.3 equation (7); 8.2.3.3.4 equation (192)',
      formula:'Eb1 = Eb,red = Eb/(1+phi_b,cr)',sourceUrl:SOURCE,
    }),
    inputs:{EbMpa:Number(EbMpa),strengthClass,relativeHumidityPercent:Number(relativeHumidityPercent),phiBcr:phi.value},
  });
}

export function equivalentConcreteModulus({
  RbSerMpa,duration='short-term',strengthClass=null,relativeHumidityPercent=null,concreteType='heavy'
}) {
  if (!(Number(RbSerMpa)>0)) throw new RangeError('RbSerMpa must be >0');
  let epsilon;
  let strainSource;
  if (duration==='short-term') {
    epsilon=concreteType==='heavy'?0.0015:concreteType==='lightweight'?0.0022:null;
    if (!epsilon) throw new RangeError('short-term concreteType must be heavy or lightweight');
    strainSource='6.1.4.3 equation (13) short-term epsilon_b1,red';
  } else if (duration==='long-term') {
    if (concreteType!=='heavy') throw new RangeError('automatic long-term Table 9 lookup is implemented for heavy concrete');
    const strains=longTermConcreteStrains({strengthClass,relativeHumidityPercent});
    epsilon=strains.eb1red;
    strainSource='6.1.3.2 Table 9 + 6.1.4.3 equation (13)';
  } else {
    throw new RangeError('duration must be short-term or long-term');
  }
  return standardResult({
    value:round(Number(RbSerMpa)/epsilon,4),unit:'MPa',formulaId:'TCVN5574-2018-Eq13',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:strainSource,
      formula:'Eb,red = Rb,ser / epsilon_b1,red',sourceUrl:SOURCE,
    }),
    inputs:{RbSerMpa:Number(RbSerMpa),duration,strengthClass,relativeHumidityPercent,concreteType,epsilonB1Red:epsilon},
  });
}

function humidityCategory(relativeHumidityPercent) {
  const rh=Number(relativeHumidityPercent);
  if (!(rh>=0&&rh<=100)) throw new RangeError('relativeHumidityPercent must be 0..100');
  return rh>75?'high':rh>=40?'medium':'low';
}
function parseStrength(strengthClass) {
  const match=String(strengthClass).match(/^B(\d+(?:\.\d+)?)$/);
  if (!match) throw new RangeError('strengthClass must be like B25');
  return Number(match[1]);
}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
