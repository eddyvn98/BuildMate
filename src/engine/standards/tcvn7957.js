import { standardRef, standardResult } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7957%3A2023';
const TEXT='https://www.atld.vn/law/2710/content';

export const MANNING_N=Object.freeze({
  reinforcedConcrete:0.013,
  castIron:0.012,
  steel:0.012,
  plasticMin:0.011,
  plasticMax:0.0115,
});

export function manningVelocity({hydraulicRadiusM,hydraulicSlope,manningN}) {
  requirePositive('hydraulicRadiusM',hydraulicRadiusM); requirePositive('hydraulicSlope',hydraulicSlope); requirePositive('manningN',manningN);
  const v=(1/Number(manningN))*Number(hydraulicRadiusM)**(2/3)*Math.sqrt(Number(hydraulicSlope));
  return standardResult({
    value:round(v,4),unit:'m/s',formulaId:'TCVN7957-2023-Manning',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.2, Table 9',formula:'v=(1/n)·R^(2/3)·i^(1/2)',sourceUrl:TEXT}),
    inputs:{hydraulicRadiusM:Number(hydraulicRadiusM),hydraulicSlope:Number(hydraulicSlope),manningN:Number(manningN)},
    warnings:['Gravity sewer velocity must also satisfy the self-cleansing requirement stated in clause 5.3.2.'],
  });
}

export function manningNForMaterial(material) {
  if (!(material in MANNING_N)) throw new RangeError('Unsupported TCVN 7957 Table 9 material');
  const value=MANNING_N[material];
  return {
    value,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.2, Table 9',sourceUrl:TEXT,note:'Manning coefficient by conduit material.'}),
  };
}

export const TCVN7957_METADATA={standard:'TCVN 7957:2023',statusSource:SOURCE,textSource:TEXT};
function requirePositive(n,v){if(!(Number(v)>0))throw new RangeError(`${n} must be > 0`);}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}


export function minimumDrainDiameter({system,location}) {
  const rows={
    sanitary:{site:150,street:200},
    storm:{site:300,street:400},
    combined:{site:300,street:400},
    sludge:{site:150,street:null},
  };
  const row=rows[system];
  if (!row) throw new RangeError('system must be sanitary, storm, combined or sludge');
  if (!['site','street'].includes(location)) throw new RangeError('location must be site or street');
  const value=row[location];
  if (value==null) return {blocked:true,reason:'No minimum diameter specified for this case in Table 10'};
  return {
    minimumDiameterMm:value,system,location,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.4, Table 10',sourceUrl:TEXT}),
  };
}

export function checkRainInletConnectionSlope(slope) {
  if (!(Number(slope)>=0)) throw new RangeError('slope must be >= 0');
  return {
    slope:Number(slope),minimumSlope:0.02,pass:Number(slope)>=0.02,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.11',formula:'i ≥ 0.02 for connection from rainwater inlet to sewer',sourceUrl:TEXT}),
  };
}


export function maximumFillRatio(diameterMm) {
  const d=Number(diameterMm);
  if (!(d>0)) throw new RangeError('diameterMm must be > 0');
  let ratio;
  if (d>=200&&d<=300) ratio=0.6;
  else if (d>300&&d<=450) ratio=0.7;
  else if (d>450&&d<=900) ratio=0.75;
  else if (d>900) ratio=0.8;
  else throw new RangeError('TCVN 7957 Table 11 implemented for diameter >= 200 mm');
  return {
    maximumFillRatio:ratio,diameterMm:d,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.5, Table 11',sourceUrl:TEXT}),
  };
}

export function minimumSelfCleansingVelocity(diameterMm,{settledOrBiologicallyTreated=false}={}) {
  if (settledOrBiologicallyTreated) {
    return {
      minimumVelocityMps:0.4,diameterMm:Number(diameterMm),level:'engineering-review',
      reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.6, Table 12 note 3',sourceUrl:TEXT}),
    };
  }
  const d=Number(diameterMm);
  if (!(d>=150)) throw new RangeError('TCVN 7957 Table 12 implemented for diameter >= 150 mm');
  let v;
  if (d<=200) v=0.7;
  else if (d<=400) v=0.8;
  else if (d<=500) v=0.9;
  else if (d<=800) v=1.0;
  else if (d<=1200) v=1.15;
  else if (d<=1500) v=1.2;
  else v=1.3;
  return {
    minimumVelocityMps:v,diameterMm:d,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7957:2023',clause:'5.3.6, Table 12',sourceUrl:TEXT}),
  };
}

export function checkDrainVelocity({velocityMps,diameterMm,material='nonmetal',flowType='wastewater',settledOrBiologicallyTreated=false}) {
  if (!(Number(velocityMps)>=0)) throw new RangeError('velocityMps must be >= 0');
  const minimum=minimumSelfCleansingVelocity(diameterMm,{settledOrBiologicallyTreated});
  const maximum=flowType==='storm'
    ? (material==='metal'?10:7)
    : (material==='metal'?8:4);
  if (!['metal','nonmetal'].includes(material)) throw new RangeError('material must be metal or nonmetal');
  if (!['wastewater','storm'].includes(flowType)) throw new RangeError('flowType must be wastewater or storm');
  return {
    velocityMps:Number(velocityMps),minimumVelocityMps:minimum.minimumVelocityMps,maximumVelocityMps:maximum,
    minimumPass:Number(velocityMps)>=minimum.minimumVelocityMps,
    maximumPass:Number(velocityMps)<=maximum,
    pass:Number(velocityMps)>=minimum.minimumVelocityMps&&Number(velocityMps)<=maximum,
    level:'engineering-review',
    references:[
      minimum.reference,
      standardRef({standard:'TCVN 7957:2023',clause:'5.3.9',sourceUrl:TEXT,note:'Maximum velocity: wastewater 8 m/s metal, 4 m/s nonmetal; stormwater 10/7 m/s.'}),
    ],
  };
}
