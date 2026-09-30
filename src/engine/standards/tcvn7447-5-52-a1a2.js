import { standardRef } from './common.js';

const SOURCE='https://vanbanphapluat.co/tcvn-7447-5-52-2010-he-thong-lap-dat-dien-ha-ap-he-thong-di-day';

const PVC_CU=Object.freeze({
  1.5:{A1:[14.5,13.5],A2:[14,13]},
  2.5:{A1:[19.5,18],A2:[18.5,17.5]},
  4:{A1:[26,24],A2:[25,23]},
  6:{A1:[34,31],A2:[32,29]},
  10:{A1:[46,42],A2:[43,39]},
  16:{A1:[61,56],A2:[57,52]},
  25:{A1:[80,73],A2:[75,68]},
  35:{A1:[99,89],A2:[92,83]},
  50:{A1:[119,108],A2:[110,99]},
  70:{A1:[151,136],A2:[139,125]},
  95:{A1:[182,164],A2:[167,150]},
  120:{A1:[210,188],A2:[192,172]},
  150:{A1:[240,216],A2:[219,196]},
  185:{A1:[273,245],A2:[248,223]},
  240:{A1:[321,286],A2:[291,261]},
  300:{A1:[367,328],A2:[334,298]},
});

export function pvcCopperA1A2Ampacity({sectionMm2,method,loadedConductors=2}) {
  const row=PVC_CU[Number(sectionMm2)];
  if (!row) throw new RangeError('Unsupported PVC copper section');
  const m=String(method).toUpperCase();
  if (!['A1','A2'].includes(m)) throw new RangeError('method must be A1 or A2');
  const index=loadedConductors===2?0:loadedConductors===3?1:-1;
  if (index<0) throw new RangeError('loadedConductors must be 2 or 3');
  return {
    ampacityA:row[m][index],
    sectionMm2:Number(sectionMm2),method:m,loadedConductors,
    conductor:'copper',insulation:'PVC',level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 7447-5-52:2010',
      clause:loadedConductors===2?'Appendix B, Table B.52.2':'Appendix B, Table B.52.4',
      sourceUrl:SOURCE,
      note:'A1/A2 installation method, copper conductor, PVC insulation, reference ambient conditions.',
    }),
  };
}
