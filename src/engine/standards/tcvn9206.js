import { standardRef } from './common.js';
const SOURCE='https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9206%3A2012';
const FULL_TEXT='https://icci.vn/storage/uploads/document/11/tcvn92062012907331.pdf';

export function distributionBoardCoincidenceFactor(circuitCount,{mostlyLighting=false}={}) {
  if (!Number.isInteger(circuitCount)||circuitCount<2) throw new RangeError('circuitCount must be integer >= 2');
  if (mostlyLighting) return traced(1,'5.11, Table 8 note','Kđt may be taken near 1 when circuits are mainly lighting');
  const value=circuitCount<=3?0.9:circuitCount<=5?0.8:circuitCount<=9?0.7:0.6;
  return traced(value,'5.11, Table 8','Kđt by number of distribution-board circuits');
}

export function functionalCoincidenceFactor(type,{socketFactor=null,motorRank=null}={}) {
  if (type==='lighting'||type==='heating-cooling') return traced(1,'5.12, Table 9','Kđt by circuit function');
  if (type==='socket') {
    if (!(Number(socketFactor)>=0.5&&Number(socketFactor)<=0.8)) throw new RangeError('socketFactor must be selected in TCVN range 0.5..0.8 with project basis');
    return traced(Number(socketFactor),'5.12, Table 9','Socket Kđt range 0.5..0.8; selected value requires project basis');
  }
  if (type==='lift-crane') {
    const map={largest:1,second:0.75,other:0.6};
    if (!(motorRank in map)) throw new RangeError('motorRank must be largest, second or other');
    return traced(map[motorRank],'5.12, Table 9','Lift/crane motor coincidence factor');
  }
  throw new RangeError('Unsupported circuit function');
}

export function voltageDropLimit(loadType,mode='normal') {
  const key=`${loadType}:${mode}`;
  const limits={
    'working-lighting:normal':5,'evacuation-lighting:normal':5,'low-voltage-12-42:normal':10,
    'motor:normal':5,'motor:emergency':10,'motor:start':15,
  };
  if (!(key in limits)) throw new RangeError('Unsupported TCVN 9206 voltage-drop case');
  return {
    limitPercent:limits[key],level:'engineering-review',
    reference:standardRef({standard:'TCVN 9206:2012',clause:'4.5',sourceUrl:FULL_TEXT,note:'Maximum voltage loss at the farthest load terminal.'}),
  };
}

export function checkVoltageDropAgainstTcvn9206({dropPercent,loadType,mode='normal'}) {
  if (!(Number(dropPercent)>=0)) throw new RangeError('dropPercent must be >= 0');
  const limit=voltageDropLimit(loadType,mode);
  return {...limit,dropPercent:Number(dropPercent),pass:Number(dropPercent)<=limit.limitPercent};
}

function traced(value,clause,note){return {value,level:'engineering-review',reference:standardRef({standard:'TCVN 9206:2012',clause,sourceUrl:FULL_TEXT,note})};}
export const TCVN9206_METADATA={standard:'TCVN 9206:2012',statusSource:SOURCE,fullTextSource:FULL_TEXT};
