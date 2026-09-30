import { standardRef } from './common.js';

const SOURCE='https://luatminhkhue.vn/van-ban/tieu-chuan-quoc-gia-tcvn-7447-5-52-2010-iec-60364-5-52-2009-ve-he-thong-lap-dat-dien-ha-ap-%E2%80%93-phan-5-52-lua-chon-va-lap-dat-thiet-bi-dien-%E2%80%93-he-thong-di-day.aspx';

const PVC_CU_SECTIONS=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300,400,500,630];
const PVC_CU=[
[22,18.5,null,null,null,null,null],[30,25,null,null,null,null,null],[40,34,null,null,null,null,null],[51,43,null,null,null,null,null],
[70,60,null,null,null,null,null],[94,80,null,null,null,null,null],[119,101,131,110,114,146,130],[148,126,162,137,143,181,162],
[180,153,196,167,174,219,197],[232,196,251,216,225,281,254],[282,238,304,264,275,341,311],[328,276,352,308,321,396,362],
[379,319,406,356,372,456,419],[434,364,463,409,427,521,480],[514,430,546,485,507,615,569],[593,497,629,561,587,709,659],
[null,null,754,656,689,852,795],[null,null,868,749,789,982,920],[null,null,1005,855,905,1138,1070]
];

const PVC_AL_SECTIONS=[2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300,400,500,630];
const PVC_AL=[
[23,19.5,null,null,null,null,null],[31,26,null,null,null,null,null],[39,33,null,null,null,null,null],[54,46,null,null,null,null,null],
[73,61,null,null,null,null,null],[89,78,98,84,87,112,99],[111,96,122,105,109,139,124],[135,117,149,128,133,169,152],
[173,150,192,166,173,217,196],[210,183,235,203,212,265,241],[244,212,273,237,247,308,282],[282,245,316,274,287,356,327],
[322,280,363,315,330,407,376],[380,330,430,375,392,482,447],[439,381,497,434,455,557,519],
[null,null,600,526,552,671,629],[null,null,694,610,640,775,730],[null,null,808,711,746,900,852]
];

const XLPE_CU_SECTIONS=[1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300,400,500,630];
const XLPE_CU=[
[26,23,null,null,null,null,null],[36,32,null,null,null,null,null],[49,42,null,null,null,null,null],[63,54,null,null,null,null,null],
[86,75,null,null,null,null,null],[115,100,null,null,null,null,null],[149,127,161,135,141,182,161],[185,158,200,169,176,226,201],
[225,192,242,207,216,275,246],[289,246,310,268,279,353,318],[352,298,377,328,342,430,389],[410,346,437,383,400,500,454],
[473,399,504,444,464,577,527],[542,456,575,510,533,661,605],[641,538,679,607,634,781,719],[741,621,783,703,736,902,833],
[null,null,940,823,868,1085,1008],[null,null,1083,946,998,1253,1169],[null,null,1254,1088,1151,1454,1362]
];

const XLPE_AL_SECTIONS=[2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300,400,500,630];
const XLPE_AL=[
[28,24,null,null,null,null,null],[38,32,null,null,null,null,null],[49,42,null,null,null,null,null],[67,58,null,null,null,null,null],
[91,77,null,null,null,null,null],[108,97,121,103,107,138,122],[135,120,150,129,135,172,153],[164,146,184,159,165,210,188],
[211,187,237,206,215,271,244],[257,227,289,253,264,332,300],[300,263,337,296,308,387,351],[346,304,389,343,358,448,408],
[397,347,447,395,413,515,470],[470,409,530,471,492,611,561],[543,471,613,547,571,708,652],
[null,null,740,663,694,856,792],[null,null,856,770,806,991,921],[null,null,996,899,942,1154,1077]
];

const COLUMNS=['E-two-loaded-multicore','E-three-loaded-multicore','F-two-loaded-touching','F-three-loaded-trefoil','F-three-loaded-flat-touching','G-three-loaded-flat-spaced-horizontal','G-three-loaded-flat-spaced-vertical'];

export function freeAirAmpacity({insulation='PVC',conductor='copper',sectionMm2,arrangement}) {
  const column=COLUMNS.indexOf(String(arrangement));
  if (column<0) throw new RangeError('unsupported E/F/G arrangement');
  const selected=selectTable(insulation,conductor);
  const index=selected.sections.indexOf(Number(sectionMm2));
  if (index<0) throw new RangeError('section not tabulated for selected material');
  const value=selected.rows[index][column];
  if (value==null) throw new RangeError('TCVN table has no value for selected section/arrangement');
  return {
    ampacityA:value,insulation:selected.insulation,conductor:selected.conductor,
    sectionMm2:Number(sectionMm2),arrangement:String(arrangement),level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 7447-5-52:2010',
      clause:'Appendix B, Table '+selected.table,
      sourceUrl:SOURCE,
      note:'E/F/G current-carrying capacity at the reference ambient/conductor temperature of the selected table.'
    })
  };
}

function selectTable(insulation,conductor){
  const i=String(insulation).toUpperCase(),c=String(conductor).toLowerCase();
  if(i==='PVC'&&c==='copper')return{sections:PVC_CU_SECTIONS,rows:PVC_CU,table:'B.52.10',insulation:'PVC',conductor:'copper'};
  if(i==='PVC'&&c==='aluminium')return{sections:PVC_AL_SECTIONS,rows:PVC_AL,table:'B.52.11',insulation:'PVC',conductor:'aluminium'};
  if(['XLPE','EPR'].includes(i)&&c==='copper')return{sections:XLPE_CU_SECTIONS,rows:XLPE_CU,table:'B.52.12',insulation:'XLPE/EPR',conductor:'copper'};
  if(['XLPE','EPR'].includes(i)&&c==='aluminium')return{sections:XLPE_AL_SECTIONS,rows:XLPE_AL,table:'B.52.13',insulation:'XLPE/EPR',conductor:'aluminium'};
  throw new RangeError('supported combinations: PVC/XLPE-EPR x copper/aluminium');
}
