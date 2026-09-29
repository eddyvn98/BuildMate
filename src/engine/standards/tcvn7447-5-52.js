import { standardRef } from './common.js';

const STATUS='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-52%3A2010';
const TEXT='https://vanbanphapluat.co/tcvn-7447-5-52-2010-he-thong-lap-dat-dien-ha-ap-he-thong-di-day';

const CU_D1_D2=Object.freeze({
  1.5:[22,18,26,22],2.5:[29,24,34,29],4:[38,31,44,37],6:[47,39,56,46],
  10:[63,52,73,61],16:[81,67,95,79],25:[104,86,121,101],35:[125,103,146,122],
  50:[148,122,173,144],70:[183,151,213,178],95:[216,179,252,211],120:[246,203,287,240],
  150:[278,230,324,271],185:[312,258,363,304],240:[361,297,419,351],300:[408,336,474,396],
});

const GROUPING_BUNDLED=Object.freeze({1:1,2:0.8,3:0.7,4:0.65,6:0.55,9:0.5,12:0.45,16:0.4,20:0.4});

export function d1d2CopperAmpacity({sectionMm2,insulation='PVC',loadedConductors=2}) {
  const row=CU_D1_D2[Number(sectionMm2)];
  if (!row) throw new RangeError('Unsupported D1/D2 copper section');
  const index=insulation==='PVC'?(loadedConductors===2?0:loadedConductors===3?1:-1)
    :insulation==='XLPE'?(loadedConductors===2?2:loadedConductors===3?3:-1):-1;
  if (index<0) throw new RangeError('insulation must be PVC/XLPE and loadedConductors 2/3');
  return {
    ampacityA:row[index],sectionMm2:Number(sectionMm2),insulation,loadedConductors,
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix C, Table C.52.2',sourceUrl:TEXT,note:'D1/D2 installation method, copper conductor current-carrying capacity.'}),
  };
}

export function bundledGroupingFactor(circuitCount) {
  const n=Number(circuitCount);
  if (!(n in GROUPING_BUNDLED)) throw new RangeError('Use a Table C.52.3 circuit count: 1,2,3,4,6,9,12,16,20');
  return {
    factor:GROUPING_BUNDLED[n],circuitCount:n,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix C, Table C.52.3 item 1',sourceUrl:TEXT,note:'Grouped/bundled circuits in air, on a surface, embedded or enclosed.'}),
  };
}

export function correctedAmpacity({baseAmpacityA,correctionFactors=[]}) {
  if (!(Number(baseAmpacityA)>0)) throw new RangeError('baseAmpacityA must be > 0');
  if (!Array.isArray(correctionFactors)) throw new TypeError('correctionFactors must be an array');
  let value=Number(baseAmpacityA);
  for (const factor of correctionFactors) {
    if (!(Number(factor)>0&&Number(factor)<=1)) throw new RangeError('correction factors must be >0 and <=1');
    value*=Number(factor);
  }
  return {ampacityA:round(value),baseAmpacityA:Number(baseAmpacityA),correctionFactors:[...correctionFactors],level:'engineering-review'};
}

export const TCVN7447_5_52_METADATA={standard:'TCVN 7447-5-52:2010',statusSource:STATUS,textSource:TEXT};
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}


const PVC_CU_AIR=Object.freeze({
  1.5:{B1:[17.5,15.5],B2:[16.5,15],C:[19.5,17.5]},
  2.5:{B1:[24,21],B2:[23,20],C:[27,24]},
  4:{B1:[32,28],B2:[30,27],C:[36,32]},
  6:{B1:[41,36],B2:[38,34],C:[46,41]},
  10:{B1:[57,50],B2:[52,46],C:[63,57]},
  16:{B1:[76,68],B2:[69,62],C:[85,76]},
  25:{B1:[101,89],B2:[90,80],C:[112,96]},
  35:{B1:[125,110],B2:[111,99],C:[138,119]},
  50:{B1:[151,134],B2:[133,118],C:[168,144]},
  70:{B1:[192,171],B2:[168,149],C:[213,184]},
  95:{B1:[232,207],B2:[201,179],C:[258,223]},
  120:{B1:[269,239],B2:[232,206],C:[299,259]},
  150:{B1:[300,262],B2:[258,225],C:[344,299]},
  185:{B1:[341,296],B2:[294,255],C:[392,341]},
  240:{B1:[400,346],B2:[344,297],C:[461,403]},
  300:{B1:[458,394],B2:[394,339],C:[530,464]},
});

export function pvcCopperAmpacity({sectionMm2,method,loadedConductors=2}) {
  const row=PVC_CU_AIR[Number(sectionMm2)];
  if (!row) throw new RangeError('Unsupported copper PVC section in implemented B.52 tables');
  const methodRow=row[String(method).toUpperCase()];
  if (!methodRow) throw new RangeError('method must be B1, B2 or C');
  const index=loadedConductors===2?0:loadedConductors===3?1:-1;
  if (index<0) throw new RangeError('loadedConductors must be 2 or 3');
  return {
    ampacityA:methodRow[index],sectionMm2:Number(sectionMm2),method:String(method).toUpperCase(),loadedConductors,
    insulation:'PVC',conductor:'copper',level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 7447-5-52:2010',
      clause:loadedConductors===2?'Appendix B, Table B.52.2':'Appendix B, Table B.52.4',
      sourceUrl:TEXT,
      note:'Copper/PVC current-carrying capacity at the table reference ambient conditions for installation method B1/B2/C.',
    }),
  };
}

export function chooseMinimumPvcCopperSection({designCurrentA,method,loadedConductors=2,correctionFactors=[]}) {
  if (!(Number(designCurrentA)>0)) throw new RangeError('designCurrentA must be > 0');
  const sections=Object.keys(PVC_CU_AIR).map(Number).sort((a,b)=>a-b);
  for (const sectionMm2 of sections) {
    const base=pvcCopperAmpacity({sectionMm2,method,loadedConductors});
    const corrected=correctedAmpacity({baseAmpacityA:base.ampacityA,correctionFactors});
    if (corrected.ampacityA>=Number(designCurrentA)) {
      return {
        sectionMm2,baseAmpacityA:base.ampacityA,correctedAmpacityA:corrected.ampacityA,
        designCurrentA:Number(designCurrentA),method:base.method,loadedConductors,
        level:'engineering-review',reference:base.reference,
        inputs:{correctionFactors:[...correctionFactors]},
      };
    }
  }
  return {blocked:true,reason:'No implemented section satisfies design current; expand table/profile'};
}


const AIR_TEMP_FACTORS=Object.freeze({
  PVC:{10:1.22,15:1.17,20:1.12,25:1.06,30:1.00,35:0.94,40:0.87,45:0.79,50:0.61,55:0.50},
  XLPE:{10:1.15,15:1.12,20:1.08,25:1.04,30:1.00,35:0.96,40:0.91,45:0.87,50:0.82,55:0.76,60:0.71,65:0.65,70:0.58,75:0.50,80:0.41},
});

const SOIL_TEMP_FACTORS=Object.freeze({
  PVC:{10:1.10,15:1.05,20:1.00,25:0.95,30:0.89,35:0.84,40:0.77,45:0.71,50:0.63,55:0.55,60:0.45},
  XLPE:{10:1.07,15:1.04,20:1.00,25:0.96,30:0.93,35:0.89,40:0.85,45:0.80,50:0.76,55:0.71,60:0.65,65:0.60,70:0.53,75:0.46,80:0.38},
});

const SOIL_THERMAL_RESISTIVITY=Object.freeze({
  duct:{0.5:1.28,0.7:1.20,1:1.18,1.5:1.10,2:1.05,2.5:1.00,3:0.96},
  direct:{0.5:1.88,0.7:1.62,1:1.50,1.5:1.28,2:1.12,2.5:1.00,3:0.90},
});

export function ambientAirTemperatureFactor({temperatureC,insulation='PVC'}) {
  const table=AIR_TEMP_FACTORS[insulation];
  if (!table) throw new RangeError('insulation must be PVC or XLPE');
  const factor=table[Number(temperatureC)];
  if (factor==null) throw new RangeError('temperatureC must match an implemented Table B.52.14 row');
  return {
    factor,temperatureC:Number(temperatureC),insulation,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix B, Table B.52.14',sourceUrl:TEXT,note:'Ambient-air correction factor relative to 30 °C reference.'}),
  };
}

export function soilTemperatureFactor({temperatureC,insulation='PVC'}) {
  const table=SOIL_TEMP_FACTORS[insulation];
  if (!table) throw new RangeError('insulation must be PVC or XLPE');
  const factor=table[Number(temperatureC)];
  if (factor==null) throw new RangeError('temperatureC must match an implemented Table B.52.15 row');
  return {
    factor,temperatureC:Number(temperatureC),insulation,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix B, Table B.52.15',sourceUrl:TEXT,note:'Soil-temperature correction factor relative to 20 °C reference.'}),
  };
}

export function soilThermalResistivityFactor({thermalResistivityCmPerW,burial='duct'}) {
  const table=SOIL_THERMAL_RESISTIVITY[burial];
  if (!table) throw new RangeError('burial must be duct or direct');
  const factor=table[Number(thermalResistivityCmPerW)];
  if (factor==null) throw new RangeError('thermalResistivityCmPerW must match an implemented Table B.52.16 row');
  return {
    factor,thermalResistivityCmPerW:Number(thermalResistivityCmPerW),burial,level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-5-52:2010',clause:'Appendix B, Table B.52.16',sourceUrl:TEXT,note:'Correction factor for soil thermal resistivity relative to 2.5 °C·m/W.'}),
  };
}
