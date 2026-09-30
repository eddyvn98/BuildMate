import { standardRef } from './common.js';

const SOURCE='https://vanbanphapluat.co/tcvn-7447-5-52-2010-he-thong-lap-dat-dien-ha-ap-he-thong-di-day';
const METHODS=['A1','A2','B1','B2','C','D1','D2'];

const CU_SECTIONS=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300];
const AL_SECTIONS=[2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300];

const XLPE_CU_2={
 A1:[19,26,35,45,61,81,106,131,158,200,241,278,318,362,424,486],
 A2:[18.5,25,33,42,57,76,99,121,145,183,220,253,290,329,386,442],
 B1:[23,31,42,54,75,100,133,164,198,253,306,354,393,449,528,603],
 B2:[22,30,40,51,69,91,119,146,175,221,265,305,334,384,459,532],
 C:[24,33,45,58,80,107,138,171,209,269,328,382,441,506,599,693],
 D1:[25,33,43,53,71,91,116,139,164,203,239,271,306,343,395,446],
 D2:[27,35,46,58,77,100,129,155,183,225,270,306,343,387,448,502],
};
const XLPE_CU_3={
 A1:[17,23,31,40,54,73,95,117,141,179,216,249,285,324,380,435],
 A2:[16.5,22,30,38,51,68,89,109,130,164,197,227,259,295,346,396],
 B1:[20,28,37,48,66,88,117,144,175,222,269,312,342,384,450,514],
 B2:[19.5,26,35,44,60,80,105,128,154,194,233,268,300,340,398,455],
 C:[22,30,40,52,71,96,119,147,179,229,278,322,371,424,500,576],
 D1:[21,28,36,44,58,75,96,115,135,167,197,223,251,281,324,365],
 D2:[23,30,39,49,65,84,107,129,153,188,226,257,287,324,375,419],
};
const XLPE_AL_2={
 A1:[20,27,35,48,64,84,103,125,158,191,220,253,288,338,387],
 A2:[19.5,26,33,45,60,78,96,115,145,175,201,230,262,307,352],
 B1:[25,33,43,59,79,105,130,157,200,242,281,307,351,412,471],
 B2:[23,31,40,54,72,94,115,138,175,210,242,261,300,358,415],
 C:[26,35,45,62,84,101,126,154,198,241,280,324,371,439,508],
 D1:[26,33,42,55,71,90,108,128,158,186,211,238,267,307,346],
 D2:[null,null,null,null,76,98,117,139,170,204,233,261,296,343,386],
};
const XLPE_AL_3={
 A1:[19,25,32,44,58,76,94,113,142,171,197,226,256,300,344],
 A2:[18,24,31,41,55,71,87,104,131,157,180,206,233,273,313],
 B1:[22,29,38,52,71,93,116,140,179,217,251,267,300,351,402],
 B2:[21,28,35,48,64,84,103,124,156,188,216,240,272,318,364],
 C:[24,32,41,57,76,90,112,136,174,211,245,283,323,382,440],
 D1:[22,28,35,46,59,75,90,106,130,154,174,197,220,253,286],
 D2:[null,null,null,null,64,82,98,117,144,172,197,220,250,290,326],
};

export function xlpeAmpacity({conductor='copper',sectionMm2,method,loadedConductors=2}) {
  const material=String(conductor).toLowerCase();
  const sections=material==='copper'?CU_SECTIONS:material==='aluminium'?AL_SECTIONS:null;
  if (!sections) throw new RangeError('conductor must be copper or aluminium');
  const m=String(method).toUpperCase();
  if (!METHODS.includes(m)) throw new RangeError('method must be A1, A2, B1, B2, C, D1 or D2');
  if (![2,3].includes(Number(loadedConductors))) throw new RangeError('loadedConductors must be 2 or 3');
  const index=sections.indexOf(Number(sectionMm2));
  if (index<0) throw new RangeError('section is not tabulated for selected conductor material');
  const table=material==='copper'
    ? (Number(loadedConductors)===2?XLPE_CU_2:XLPE_CU_3)
    : (Number(loadedConductors)===2?XLPE_AL_2:XLPE_AL_3);
  const value=table[m][index];
  if (value==null) throw new RangeError('selected table cell is not provided by TCVN 7447-5-52 for this section/method');
  return {
    ampacityA:value,conductor:material,sectionMm2:Number(sectionMm2),method:m,
    insulation:'XLPE/EPR',loadedConductors:Number(loadedConductors),level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 7447-5-52:2010',
      clause:Number(loadedConductors)===2?'Appendix B, Table B.52.3':'Appendix B, Table B.52.5',
      sourceUrl:SOURCE,
      note:'XLPE/EPR current-carrying capacity at 90 C conductor temperature and reference ambient conditions.',
    }),
  };
}

export function chooseMinimumXlpeSection({conductor='copper',designCurrentA,method,loadedConductors=2,correctionFactors=[]}) {
  if (!(Number(designCurrentA)>0)) throw new RangeError('designCurrentA must be > 0');
  const sections=conductor==='copper'?CU_SECTIONS:conductor==='aluminium'?AL_SECTIONS:null;
  if (!sections) throw new RangeError('conductor must be copper or aluminium');
  for (const sectionMm2 of sections) {
    let base;
    try { base=xlpeAmpacity({conductor,sectionMm2,method,loadedConductors}); } catch { continue; }
    const factor=correctionFactors.reduce((p,x)=>{
      const v=Number(x); if (!(v>0&&v<=1)) throw new RangeError('correction factors must be >0 and <=1'); return p*v;
    },1);
    const corrected=base.ampacityA*factor;
    if (corrected>=Number(designCurrentA)) {
      return {...base,designCurrentA:Number(designCurrentA),correctionFactors:[...correctionFactors],correctedAmpacityA:round(corrected)};
    }
  }
  return {blocked:true,reason:'No tabulated XLPE/EPR section satisfies design current'};
}

function round(v,d=3){const f=10**d;return Math.round(v*f)/f;}
