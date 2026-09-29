import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988';
const FULL_TEXT='https://icci.vn/download/452/aHR0cHM6Ly9pY2NpLnZuL3N0b3JhZ2UvdXBsb2Fkcy9kb2N1bWVudC8xNi90Y3ZuLTQ1MTMtMTk4OC5wZGY%3D';

const ALPHA=Object.freeze({100:2.2,125:2.16,150:2.15,200:2.14,250:2.05,300:2.0,350:1.9,400:1.85});
export const FIXTURE_UNITS=Object.freeze({
  slopSinkTap:{units:1,flowLps:0.2,diameterMm:[10,15]},
  washBasinTap:{units:0.33,flowLps:0.07,diameterMm:[10,15]},
  urinalTap:{units:0.17,flowLps:0.035,diameterMm:[10,15]},
  urinalFlushingPipePerM:{units:0.3,flowLps:0.06,diameterMm:[10,15]},
  wcFlushValve:{units:[6,7],flowLps:[1.2,1.4],diameterMm:[25,32]},
  wcCistern:{units:0.5,flowLps:0.1,diameterMm:[10,15]},
  bathtubMixerCentralHotWater:{units:1.5,flowLps:0.3,diameterMm:15},
  bathtubMixerElectricHeater:{units:1,flowLps:0.2,diameterMm:15},
  laundrySinkTap:{units:1,flowLps:0.2,diameterMm:15},
  bidet:{units:0.35,flowLps:0.07,diameterMm:[10,15]},
  groupShower:{units:1,flowLps:0.2,diameterMm:15},
  dwellingShower:{units:0.67,flowLps:0.14,diameterMm:15},
  poolShower:{units:1,flowLps:0.2,diameterMm:15},
  hotWaterTap:{units:0.17,flowLps:0.035,diameterMm:[10,15]},
  laboratorySlopSinkTap:{units:0.5,flowLps:0.1,diameterMm:[10,15]},
  roomWashBasinTap:{units:1,flowLps:0.2,diameterMm:15},
});

export function housingDesignFlow({fixtureEquivalentUnits,litersPerPersonDay}) {
  const N=Number(fixtureEquivalentUnits);
  if (!(N>0&&N<=5000)) throw new RangeError('fixtureEquivalentUnits must be >0 and <=5000');
  const alpha=ALPHA[Number(litersPerPersonDay)];
  if (alpha==null) throw new RangeError('litersPerPersonDay must match TCVN 4513 Table 9 values');
  const K=N<=300?0.002:N<=500?0.003:N<=800?0.004:N<=1200?0.005:0.006;
  const q=0.2*alpha*Math.sqrt(N)+K*N;
  return standardResult({
    value:round(q,3),unit:'L/s',formulaId:'TCVN4513-1988-Eq2',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.7, equation (2), Tables 9-10',formula:'q=0.2·α·√N+K·N',sourceUrl:FULL_TEXT}),
    inputs:{fixtureEquivalentUnits:N,litersPerPersonDay:Number(litersPerPersonDay),alpha,K},
  });
}

export function smallFixturePipeDiameter(fixtureEquivalentUnits) {
  const N=Number(fixtureEquivalentUnits);
  if (!(N>0&&N<=20)) throw new RangeError('TCVN 4513 Table 8 applies for N <= 20');
  const steps=[[1,10],[3,15],[6,20],[12,25],[20,32]];
  const pair=steps.find(([limit])=>N<=limit);
  return {
    nominalDiameterMm:pair[1],level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.6, Table 8',sourceUrl:FULL_TEXT,note:'Permitted pipe diameter lookup when total fixture equivalent units are 20 or less.'}),
  };
}

export const TCVN4513_METADATA={standard:'TCVN 4513:1988',statusSource:SOURCE,fullTextSource:FULL_TEXT};
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}


export function fixtureUnitSchedule(items) {
  if (!Array.isArray(items)||items.length===0) throw new TypeError('items are required');
  let total=0;
  const rows=items.map((item)=>{
    const fixture=FIXTURE_UNITS[item.type];
    if (!fixture) throw new RangeError(`Unsupported TCVN 4513 Table 2 fixture: ${item.type}`);
    if (Array.isArray(fixture.units)) throw new RangeError(`${item.type} has a TCVN range and requires an explicit selected fixture-unit value`);
    const count=Number(item.count);
    if (!(count>0)) throw new RangeError('fixture count must be > 0');
    const units=count*fixture.units;
    total+=units;
    return {type:item.type,count,unitEquivalent:fixture.units,totalEquivalent:round(units,3),flowLps:fixture.flowLps,connectionDiameterMm:fixture.diameterMm};
  });
  return {
    totalEquivalent:round(total,3),items:rows,level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'3.5, Table 2',sourceUrl:FULL_TEXT,note:'Fixture-unit equivalents, fixture flow and connection-pipe diameter.'}),
  };
}

export function checkDomesticSteelPipeVelocity({velocityMps,segmentType}) {
  if (!(Number(velocityMps)>=0)) throw new RangeError('velocityMps must be >= 0');
  const max=segmentType==='main-riser'?2:segmentType==='fixture-branch'?2.5:null;
  if (max==null) throw new RangeError('segmentType must be main-riser or fixture-branch');
  return {
    velocityMps:Number(velocityMps),maximumMps:max,pass:Number(velocityMps)<=max,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.5',sourceUrl:FULL_TEXT,note:'Domestic steel-pipe velocity: mains/risers 1.5-2 m/s; fixture branches not over 2.5 m/s.'}),
  };
}


export function requireBoosterPump({availablePressureM,requiredPressureM}) {
  if (!(Number(availablePressureM)>=0)) throw new RangeError('availablePressureM must be >= 0');
  if (!(Number(requiredPressureM)>0)) throw new RangeError('requiredPressureM must be > 0');
  const required=Number(availablePressureM)<Number(requiredPressureM);
  return {
    boosterRequired:required,availablePressureM:Number(availablePressureM),requiredPressureM:Number(requiredPressureM),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.3 and 7.1',sourceUrl:FULL_TEXT,note:'Network must ensure required pressure at the highest/most remote fixture; booster station is required when external pressure is insufficient.'}),
  };
}

export function pumpDesignFlowBasis({hasStorageTank,hourlyMaximumFlowM3h=null,secondDesignFlowLps=null}) {
  if (hasStorageTank) {
    if (!(Number(hourlyMaximumFlowM3h)>0)) throw new RangeError('hourlyMaximumFlowM3h is required with storage tank');
    return {
      basis:'maximum-hour-flow',designFlowM3h:Number(hourlyMaximumFlowM3h),level:'engineering-review',
      reference:standardRef({standard:'TCVN 4513:1988',clause:'7.7',sourceUrl:FULL_TEXT,note:'Domestic/production pump with storage tank is sized from maximum hourly flow.'}),
    };
  }
  if (!(Number(secondDesignFlowLps)>0)) throw new RangeError('secondDesignFlowLps is required without storage tank');
  return {
    basis:'second-design-flow',designFlowLps:Number(secondDesignFlowLps),level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'7.7',sourceUrl:FULL_TEXT,note:'Pump without storage tank is sized from design flow per second.'}),
  };
}

export function pressureTankCapacityLimit(volumeM3) {
  if (!(Number(volumeM3)>0)) throw new RangeError('volumeM3 must be > 0');
  return {
    volumeM3:Number(volumeM3),pass:Number(volumeM3)<=25,splitRequired:Number(volumeM3)>25,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'8.1 note 2',formula:'individual pressure tank volume ≤ 20-25 m³',sourceUrl:FULL_TEXT}),
  };
}


export function steelCastIronFrictionGradient({resistanceA,flowLps}) {
  if (!(Number(resistanceA)>0)) throw new RangeError('resistanceA must be > 0 and sourced from TCVN 4513 Table 14/hydraulic table');
  if (!(Number(flowLps)>0)) throw new RangeError('flowLps must be > 0');
  const i=Number(resistanceA)*Number(flowLps)**2;
  return standardResult({
    value:round(i,6),unit:'m/m',formulaId:'TCVN4513-1988-6.14',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.14, Table 14',formula:'i=A·q²',sourceUrl:FULL_TEXT}),
    inputs:{resistanceA:Number(resistanceA),flowLps:Number(flowLps)},
    warnings:['A must be selected from the applicable TCVN 4513 hydraulic table for pipe diameter/material and flow-unit convention.'],
  });
}

export function localLossAllowance({frictionHeadM,networkType}) {
  if (!(Number(frictionHeadM)>=0)) throw new RangeError('frictionHeadM must be >= 0');
  const factors={
    domestic:0.30,
    domesticFireCombined:0.20,
    production:0.20,
    productionFireCombined:0.15,
    fireOnly:0.10,
  };
  const factor=factors[networkType];
  if (factor==null) throw new RangeError('Unsupported TCVN 4513 clause 6.16 networkType');
  return standardResult({
    value:round(Number(frictionHeadM)*factor,4),unit:'m',formulaId:'TCVN4513-1988-6.16',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'6.16',formula:'local loss = prescribed percentage × friction loss',sourceUrl:FULL_TEXT}),
    inputs:{frictionHeadM:Number(frictionHeadM),networkType,factor},
  });
}

export function fixturePressureCheck({availableHeadM,fixtureType='general'}) {
  if (!(Number(availableHeadM)>=0)) throw new RangeError('availableHeadM must be >= 0');
  const minimum={general:1,wcFlushValve:3,drinkingBoiler:4,shower:4}[fixtureType];
  if (minimum==null) throw new RangeError('Unsupported fixtureType');
  return {
    availableHeadM:Number(availableHeadM),minimumHeadM:minimum,maximumWorkingHeadM:60,
    minimumPass:Number(availableHeadM)>=minimum,maximumPass:Number(availableHeadM)<=60,
    pass:Number(availableHeadM)>=minimum&&Number(availableHeadM)<=60,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 4513:1988',clause:'3.8-3.9',sourceUrl:FULL_TEXT,note:'Minimum free head by fixture and maximum 60 m working head for domestic sanitary fixtures.'}),
  };
}
