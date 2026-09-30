import { standardRef } from './common.js';
const OFFICIAL='https://vbpl.vn/FileData/TW/Lists/vbpq/Attachments/111843/VanBanGoc_QC%2012-2014-BXD.pdf';

export function checkOverloadProtection({designCurrentA,protectiveRatingA,cableAmpacityA,deviceConventionalOperatingCurrentA}) {
  const IB=Number(designCurrentA),In=Number(protectiveRatingA),Iz=Number(cableAmpacityA),I2=Number(deviceConventionalOperatingCurrentA);
  for (const [name,value] of Object.entries({designCurrentA:IB,protectiveRatingA:In,cableAmpacityA:Iz,deviceConventionalOperatingCurrentA:I2})) {
    if (!(value>0)) throw new RangeError(`${name} must be > 0`);
  }
  const ratingPass=IB<=In&&In<=Iz;
  const operatingPass=I2<=1.45*Iz;
  return {
    pass:ratingPass&&operatingPass,ratingPass,operatingPass,
    values:{IB,In,Iz,I2,limitI2:round(1.45*Iz)},
    level:'engineering-review',
    reference:standardRef({standard:'QCVN 12:2014/BXD',clause:'2.6.3.1, equations (3)-(4)',formula:'IB ≤ In ≤ Iz; I2 ≤ 1.45 Iz',sourceUrl:OFFICIAL}),
  };
}

export function requireProspectiveShortCircuitCurrent(source) {
  if (!source?.valueA||!(Number(source.valueA)>0)||!source.method) {
    return {ready:false,reason:'QCVN 12:2014/BXD 2.6.5.1 requires prospective short-circuit current determined by calculation or measurement'};
  }
  return {
    ready:true,valueA:Number(source.valueA),method:String(source.method),
    reference:standardRef({standard:'QCVN 12:2014/BXD',clause:'2.6.5.1',sourceUrl:OFFICIAL,note:'Prospective short-circuit current at relevant points must be determined by calculation or measurement.'}),
  };
}

export const QCVN12_METADATA={standard:'QCVN 12:2014/BXD',officialSource:OFFICIAL};
function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}


export function checkShortCircuitBreakingCapacity({
  prospectiveShortCircuitCurrentA,deviceBreakingCapacityA,deviceSource
}) {
  const Ik=Number(prospectiveShortCircuitCurrentA),Icn=Number(deviceBreakingCapacityA);
  if (!(Ik>0)||!(Icn>0)) throw new RangeError('prospectiveShortCircuitCurrentA and deviceBreakingCapacityA must be > 0');
  if (!deviceSource) throw new TypeError('deviceSource is required');
  return {
    pass:Icn>=Ik,
    prospectiveShortCircuitCurrentA:Ik,
    deviceBreakingCapacityA:Icn,
    marginA:Icn-Ik,
    deviceSource:String(deviceSource),
    level:'engineering-review',
    reference:standardRef({
      standard:'QCVN 12:2014/BXD',
      clause:'2.3.4.1-2.3.4.2',
      formula:'protective device rated current >= maximum continuous operating current; breaking capacity >= maximum short-circuit current',
      sourceUrl:OFFICIAL,
    }),
  };
}
