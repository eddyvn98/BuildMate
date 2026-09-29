import { standardRef } from './common.js';
const STATUS='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-4-41%3A2010';
const TEXT='https://vanbanphapluat.co/tcvn-7447-4-41-2010-he-thong-lap-dat-dien-ha-ap-bao-ve-chong-dien-giat';

const AC_LIMITS={
  TN:[[120,0.8],[230,0.4],[400,0.2],[Infinity,0.1]],
  TT:[[120,0.3],[230,0.2],[400,0.07],[Infinity,0.04]],
};

export function maximumFinalCircuitDisconnectionTime({system,uoV,currentA}) {
  if (!['TN','TT'].includes(system)) throw new RangeError('system must be TN or TT');
  if (!(Number(uoV)>50)) throw new RangeError('Table 41.1 lookup implemented for Uo > 50 V');
  if (!(Number(currentA)>0&&Number(currentA)<=32)) throw new RangeError('Table 41.1 maximum time applies to final circuits <= 32 A');
  const maxTimeS=AC_LIMITS[system].find(([limit])=>Number(uoV)<=limit)[1];
  return {
    maxTimeS,system,uoV:Number(uoV),currentA:Number(currentA),level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-4-41:2010',clause:'411.3.2.2, Table 41.1',sourceUrl:TEXT,note:'Maximum automatic disconnection time for final circuits not exceeding 32 A.'}),
  };
}

export function checkDisconnectionTime(input) {
  const limit=maximumFinalCircuitDisconnectionTime(input);
  const actual=Number(input.actualTimeS);
  if (!(actual>0)) throw new RangeError('actualTimeS must be > 0');
  return {...limit,actualTimeS:actual,pass:actual<=limit.maxTimeS};
}

export const TCVN7447_4_41_METADATA={standard:'TCVN 7447-4-41:2010',statusSource:STATUS,textSource:TEXT};
