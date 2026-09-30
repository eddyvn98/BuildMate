import { standardRef, standardResult } from './common.js';

const SOURCE='https://dulieuphapluat.vn/van-ban/xay-dung-van-ban/tieu-chuan-quoc-gia-tcvn-55742018-ve-thiet-ke-ket-cau-be-tong-va-be-tong-cot-thep-86955.html';

const HEAVY=Object.freeze({
  'B3.5':{Rb:2.1,Rbt:0.26,RbSer:2.7,RbtSer:0.39,Eb:9500},
  B5:{Rb:2.8,Rbt:0.37,RbSer:3.5,RbtSer:0.55,Eb:13000},
  'B7.5':{Rb:4.5,Rbt:0.48,RbSer:5.5,RbtSer:0.70,Eb:16000},
  B10:{Rb:6.0,Rbt:0.56,RbSer:7.5,RbtSer:0.85,Eb:19000},
  'B12.5':{Rb:7.5,Rbt:0.66,RbSer:9.5,RbtSer:1.00,Eb:21500},
  B15:{Rb:8.5,Rbt:0.75,RbSer:11.0,RbtSer:1.10,Eb:24000},
  B20:{Rb:11.5,Rbt:0.90,RbSer:15.0,RbtSer:1.35,Eb:27500},
  B25:{Rb:14.5,Rbt:1.05,RbSer:18.5,RbtSer:1.55,Eb:30000},
  B30:{Rb:17.0,Rbt:1.15,RbSer:22.0,RbtSer:1.75,Eb:32500},
  B35:{Rb:19.5,Rbt:1.30,RbSer:25.5,RbtSer:1.95,Eb:34500},
  B40:{Rb:22.0,Rbt:1.40,RbSer:29.0,RbtSer:2.10,Eb:36000},
  B45:{Rb:25.0,Rbt:1.50,RbSer:32.0,RbtSer:2.25,Eb:37000},
  B50:{Rb:27.5,Rbt:1.60,RbSer:36.0,RbtSer:2.45,Eb:38000},
  B55:{Rb:30.0,Rbt:1.70,RbSer:39.5,RbtSer:2.60,Eb:39000},
  B60:{Rb:33.0,Rbt:1.80,RbSer:43.0,RbtSer:2.75,Eb:39500},
  B70:{Rb:37.0,Rbt:1.90,RbSer:50.0,RbtSer:3.00,Eb:41000},
  B80:{Rb:41.0,Rbt:2.10,RbSer:57.0,RbtSer:3.30,Eb:42000},
  B90:{Rb:44.0,Rbt:2.15,RbSer:64.0,RbtSer:3.60,Eb:42500},
  B100:{Rb:47.5,Rbt:2.20,RbSer:71.0,RbtSer:3.80,Eb:43000},
});

const LIGHTWEIGHT=Object.freeze({
  'B2.5':{Rb:1.5,Rbt:0.20,RbSer:1.9,RbtSer:0.29},
  'B3.5':{Rb:2.1,Rbt:0.26,RbSer:2.7,RbtSer:0.39},
  B5:{Rb:2.8,Rbt:0.37,RbSer:3.5,RbtSer:0.55},
  'B7.5':{Rb:4.5,Rbt:0.48,RbSer:5.5,RbtSer:0.70},
  B10:{Rb:6.0,Rbt:0.56,RbSer:7.5,RbtSer:0.85},
  'B12.5':{Rb:7.5,Rbt:0.66,RbSer:9.5,RbtSer:1.00},
  B15:{Rb:8.5,Rbt:0.75,RbSer:11.0,RbtSer:1.10},
  B20:{Rb:11.5,Rbt:0.90,RbSer:15.0,RbtSer:1.35},
  B25:{Rb:14.5,Rbt:1.05,RbSer:18.5,RbtSer:1.55},
  B30:{Rb:17.0,Rbt:1.15,RbSer:22.0,RbtSer:1.75},
  B35:{Rb:19.5,Rbt:1.30,RbSer:25.5,RbtSer:1.95},
  B40:{Rb:22.0,Rbt:1.40,RbSer:29.0,RbtSer:2.10},
});

const AERATED=Object.freeze({
  'B1.5':{Rb:0.95,Rbt:0.09,RbSer:1.4,RbtSer:0.22},
  B2:{Rb:1.3,Rbt:0.12,RbSer:1.9,RbtSer:0.26},
  'B2.5':{Rb:1.6,Rbt:0.14,RbSer:2.4,RbtSer:0.31},
  'B3.5':{Rb:2.2,Rbt:0.18,RbSer:3.3,RbtSer:0.41},
  B5:{Rb:3.1,Rbt:0.24,RbSer:4.6,RbtSer:0.55},
  'B7.5':{Rb:4.6,Rbt:0.28,RbSer:6.9,RbtSer:0.63},
  B10:{Rb:6.0,Rbt:0.39,RbSer:9.0,RbtSer:0.89},
  'B12.5':{Rb:7.0,Rbt:0.44,RbSer:10.5,RbtSer:1.00},
  B15:{Rb:7.7,Rbt:0.46,RbSer:11.5,RbtSer:1.05},
});

const CREEP=Object.freeze({
  high:{B10:2.8,B15:2.4,B20:2.0,B25:1.8,B30:1.6,B35:1.5,B40:1.4,B45:1.3,B50:1.2,B55:1.1,B60:1.0},
  medium:{B10:3.9,B15:3.4,B20:2.8,B25:2.5,B30:2.3,B35:2.1,B40:1.9,B45:1.8,B50:1.6,B55:1.5,B60:1.4},
  low:{B10:5.6,B15:4.8,B20:4.0,B25:3.6,B30:3.2,B35:3.0,B40:2.8,B45:2.6,B50:2.4,B55:2.2,B60:2.0},
});

const LIGHT_EB=Object.freeze({
  800:{'B2.5':4000,'B3.5':4500,B5:5000,'B7.5':5500},
  1000:{'B2.5':5000,'B3.5':5500,B5:6300,'B7.5':7200,B10:8000,'B12.5':8400},
  1200:{'B2.5':6000,'B3.5':6700,B5:7600,'B7.5':8700,B10:9500,'B12.5':10000,B15:10500},
  1400:{'B2.5':7000,'B3.5':7800,B5:8800,'B7.5':10000,B10:11000,'B12.5':11700,B15:12500,B20:13500,B25:14500,B30:15500},
  1600:{'B3.5':9000,B5:10000,'B7.5':11500,B10:12500,'B12.5':13200,B15:14000,B20:15500,B25:16500,B30:17500,B35:18000},
  1800:{B5:11200,'B7.5':13000,B10:14000,'B12.5':14700,B15:15500,B20:17000,B25:18500,B30:19500,B35:20500,B40:21000},
  2000:{'B7.5':14500,B10:16000,'B12.5':17000,B15:18000,B20:19500,B25:21000,B30:22000,B35:23000,B40:23500},
});

const AERATED_EB=Object.freeze({
  500:{'B1.5':1400},
  600:{'B1.5':1700,B2:1800,'B2.5':2100},
  700:{'B1.5':1900,B2:2200,'B2.5':2500,'B3.5':2900},
  800:{'B2.5':2900,'B3.5':3400,B5:4000},
  900:{'B3.5':3800,B5:4500,'B7.5':5500},
  1000:{B5:5000,'B7.5':6000,B10:7000},
  1100:{'B7.5':6800,B10:7900,'B12.5':8300,B15:8600},
  1200:{B10:8400,'B12.5':8800,B15:9300},
});

export function concreteMaterialProperties({strengthClass,type='heavy',densityKgM3=null}) {
  const table=type==='heavy'?HEAVY:type==='lightweight'?LIGHTWEIGHT:type==='aerated'?AERATED:null;
  if (!table) throw new RangeError('type must be heavy, lightweight or aerated');
  const row=table[strengthClass];
  if (!row) throw new RangeError('strengthClass is not tabulated for selected concrete type');
  let Eb=row.Eb??null;
  if (type==='lightweight') Eb=densityLookup(LIGHT_EB,densityKgM3,strengthClass);
  if (type==='aerated') Eb=densityLookup(AERATED_EB,densityKgM3,strengthClass);
  return {
    strengthClass,type,densityKgM3:densityKgM3==null?null:Number(densityKgM3),
    ...row,Eb,unit:'MPa',level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'6.1.2.2, Tables 6-7',sourceUrl:SOURCE,note:'ULS Rb/Rbt and SLS/standard Rb,ser/Rbt,ser.'}),
      standardRef({standard:'TCVN 5574:2018',clause:'6.1.3.3, Table 10',sourceUrl:SOURCE,note:'Initial elastic modulus Eb; density is required for lightweight/aerated concrete.'}),
    ],
  };
}

export function concreteCreepFactor({strengthClass,relativeHumidityPercent,type='heavy',densityKgM3=null}) {
  const rh=Number(relativeHumidityPercent);
  if (!(rh>=0&&rh<=100)) throw new RangeError('relativeHumidityPercent must be 0..100');
  const B=Number(String(strengthClass).replace('B',''));
  const key=B>=60?'B60':strengthClass;
  const band=rh>75?'high':rh>=40?'medium':'low';
  const base=CREEP[band][key];
  if (base==null) throw new RangeError('Table 11 creep factor is tabulated for B10 and B15..B100 heavy concrete');
  let factor=base;
  if (type==='lightweight') {
    if (!(Number(densityKgM3)>0)) throw new RangeError('densityKgM3 is required for lightweight creep factor');
    factor*=Math.pow(Number(densityKgM3)/2200,2);
  } else if (type!=='heavy') {
    throw new RangeError('TCVN 5574 directs aerated/hollow concrete creep to separate provisions; no silent substitution is allowed');
  }
  return standardResult({
    value:round(factor,5),unit:'ratio',formulaId:'TCVN5574-2018-Table11',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'6.1.3.4, Table 11',sourceUrl:SOURCE,note:'Relative humidity is the average monthly humidity of the hottest month at the construction location.'}),
    inputs:{strengthClass,relativeHumidityPercent:rh,type,densityKgM3:densityKgM3==null?null:Number(densityKgM3),humidityBand:band,baseFactor:base},
  });
}

export function longTermConcreteModulus({EbMpa,creepFactor}) {
  const E=Number(EbMpa),phi=Number(creepFactor);
  if (!(E>0)||!(phi>=0)) throw new RangeError('EbMpa must be >0 and creepFactor >=0');
  return standardResult({
    value:round(E/(1+phi),3),unit:'MPa',formulaId:'TCVN5574-2018-Eq192',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'8.2.3.3.4, equation (192)',formula:'Eb1 = Eb,tau = Eb/(1+phi_b,cr)',sourceUrl:SOURCE}),
    inputs:{EbMpa:E,creepFactor:phi},
  });
}

export function concreteWorkingConditionFactors({
  concreteType='heavy',loadDuration='allLoads',plainConcrete=false,
  verticalCastHeightM=0,aeratedHumidityPercent=null
}) {
  const cellular=concreteType==='aerated'||concreteType==='hollow';
  const gammaB1=loadDuration==='allLoads'?1
    :loadDuration==='longOnly'?(cellular?0.85:0.9):null;
  if (gammaB1==null) throw new RangeError('loadDuration must be allLoads or longOnly');
  const gammaB2=plainConcrete?0.9:1;
  const gammaB3=Number(verticalCastHeightM)>1.5?0.85:1;
  let gammaB4=1;
  if (concreteType==='aerated'&&aeratedHumidityPercent!=null) {
    const w=Number(aeratedHumidityPercent);
    if (!(w>=0)) throw new RangeError('aeratedHumidityPercent must be >= 0');
    gammaB4=w<=10?1:w>=25?0.85:1-(w-10)*(0.15/15);
  }
  return {
    gammaB1:round(gammaB1,5),gammaB2,gammaB3,gammaB4:round(gammaB4,5),
    RbFactor:round(gammaB1*gammaB2*gammaB3*gammaB4,6),
    RbtFactor:round(gammaB1,6),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 5574:2018',clause:'6.1.2.3(a)-(d)',sourceUrl:SOURCE,note:'gamma_b1 acts on Rb/Rbt; gamma_b2, gamma_b3 and gamma_b4 act on Rb in their stated cases.'}),
  };
}

export function adjustedConcreteDesignStrengths({properties,workingConditions}) {
  if (!properties?.Rb||!properties?.Rbt) throw new TypeError('concrete material properties are required');
  if (!workingConditions?.RbFactor||!workingConditions?.RbtFactor) throw new TypeError('workingConditions are required');
  return {
    RbMpa:round(properties.Rb*workingConditions.RbFactor,4),
    RbtMpa:round(properties.Rbt*workingConditions.RbtFactor,4),
    base:{RbMpa:properties.Rb,RbtMpa:properties.Rbt},
    workingConditions:structuredClone(workingConditions),
    level:'engineering-review',
    reference:workingConditions.reference,
  };
}

function densityLookup(table,density,strengthClass) {
  const d=Number(density);
  if (!(d>0)) throw new RangeError('densityKgM3 is required for selected concrete type');
  const row=table[d];
  if (!row||row[strengthClass]==null) throw new RangeError('Eb is not tabulated for selected density/strengthClass pair');
  return row[strengthClass];
}
function round(v,d=5){const f=10**d;return Math.round(v*f)/f;}
