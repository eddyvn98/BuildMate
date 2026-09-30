import { standardRef } from './common.js';

const SOURCE='https://thuvienphapluat.vn/van-ban/Xay-dung-Do-thi/Thong-tu-06-2022-TT-BXD-Quy-chuan-QCVN-06-2022-BXD-An-toan-chay-cho-nha-va-cong-trinh-544059.aspx';
const RATINGS=[240,180,120,90,60,30];

const BEAM=Object.freeze({
  silicaUnprotected:{cover:[65,55,45,35,25,15],width:[280,240,180,140,110,80]},
  silicaCementGypsum15:{cover:[50,40,30,20,15,15],width:[250,210,170,110,85,70]},
  silicaVermiculiteGypsum15:{cover:[25,15,15,15,15,15],width:[170,145,125,85,60,60]},
  lightweight:{cover:[50,45,35,30,20,15],width:[250,200,160,130,100,80]},
});

const COLUMN4=Object.freeze({
  silicaUnprotected:[450,400,300,250,200,150],
  silicaCementGypsum15:[300,275,225,150,150,150],
  silicaVermiculiteGypsum15:[275,225,200,150,120,120],
  limestoneOrSilicaGroup:[300,275,225,200,190,150],
  lightweight:[300,275,225,200,190,150],
});

const COLUMN1=Object.freeze({
  silicaUnprotected:[180,150,100,100,75,75],
  silicaVermiculiteGypsum15:[125,100,75,75,65,65],
});

const SLAB_SOLID=Object.freeze({
  cover:[25,25,20,20,15,15],
  totalDepth:[150,150,125,125,100,100],
});

export function qcvn06BeamFireRequirement({ratingMinutes,protection='silicaUnprotected'}) {
  const i=ratingIndex(ratingMinutes);
  const row=BEAM[protection];
  if (!row) throw new RangeError('unsupported QCVN 06 Table F.3 beam protection type');
  return traced('QCVN06-F3',{
    ratingMinutes:Number(ratingMinutes),protection,
    minimumAverageCoverMm:row.cover[i],
    minimumBeamWidthMm:row.width[i],
    simultaneous:true,
  },'Appendix F, Table F.3',[
    'Table values apply to statically determinate members. Statically indeterminate structures require fire calculation under the selected applicable standard.',
    'Cover and beam width requirements are simultaneous.',
  ]);
}

export function qcvn06ColumnFireRequirement({ratingMinutes,fireFaces=4,protection='silicaUnprotected'}) {
  const i=ratingIndex(ratingMinutes);
  const table=Number(fireFaces)===4?COLUMN4:Number(fireFaces)===1?COLUMN1:null;
  if (!table) throw new RangeError('fireFaces must be 1 or 4');
  const row=table[protection];
  if (!row) throw new RangeError('unsupported QCVN 06 column protection type for selected fireFaces');
  return traced('QCVN06-F5-F6',{
    ratingMinutes:Number(ratingMinutes),fireFaces:Number(fireFaces),protection,
    minimumSectionDimensionMm:row[i],
  },Number(fireFaces)===4?'Appendix F, Table F.5':'Appendix F, Table F.6',[
    'Nominal tabulated fire resistance; all stated section parameters must be considered simultaneously where the table provides more than one parameter.',
  ]);
}

export function qcvn06SolidSlabFireRequirement({ratingMinutes}) {
  const i=ratingIndex(ratingMinutes);
  return traced('QCVN06-F9',{
    ratingMinutes:Number(ratingMinutes),
    minimumAverageCoverMm:SLAB_SOLID.cover[i],
    minimumTotalDepthMm:SLAB_SOLID.totalDepth[i],
    aggregate:'silica-or-limestone',
    simultaneous:true,
  },'Appendix F, Table F.9',[
    'Solid reinforced-concrete slab with silica or limestone aggregate.',
    'Cover and total slab depth requirements are simultaneous.',
  ]);
}

export function combineDurabilityAndFireCover({tcvn5574MinimumCoverMm,fireRequirement}) {
  const durability=Number(tcvn5574MinimumCoverMm);
  if (!(durability>0)) throw new RangeError('tcvn5574MinimumCoverMm must be >0');
  const fire=Number(fireRequirement?.minimumAverageCoverMm ?? 0);
  if (!(fire>0)) throw new TypeError('fireRequirement with minimumAverageCoverMm is required');
  return {
    governingMinimumCoverMm:Math.max(durability,fire),
    durabilityMinimumCoverMm:durability,
    fireMinimumAverageCoverMm:fire,
    governingBasis:fire>durability?'QCVN 06 fire':'TCVN 5574 durability/detailing',
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 5574:2018',clause:'10.3.1.2, Table 19',sourceUrl:'https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf'}),
      fireRequirement.reference,
    ],
  };
}

export function checkBeamFireGeometry({beamWidthMm,averageCoverMm,requirement}) {
  const w=Number(beamWidthMm),c=Number(averageCoverMm);
  if (!(w>0)||!(c>0)) throw new RangeError('beamWidthMm and averageCoverMm must be >0');
  return {
    pass:w>=requirement.minimumBeamWidthMm&&c>=requirement.minimumAverageCoverMm,
    beamWidthMm:w,averageCoverMm:c,requirement,level:'engineering-review',
    reference:requirement.reference,
  };
}

export function checkColumnFireGeometry({minimumSectionDimensionMm,requirement}) {
  const d=Number(minimumSectionDimensionMm);
  if (!(d>0)) throw new RangeError('minimumSectionDimensionMm must be >0');
  return {pass:d>=requirement.minimumSectionDimensionMm,minimumSectionDimensionMm:d,requirement,level:'engineering-review',reference:requirement.reference};
}

export function checkSolidSlabFireGeometry({totalDepthMm,averageCoverMm,requirement}) {
  const h=Number(totalDepthMm),c=Number(averageCoverMm);
  if (!(h>0)||!(c>0)) throw new RangeError('totalDepthMm and averageCoverMm must be >0');
  return {pass:h>=requirement.minimumTotalDepthMm&&c>=requirement.minimumAverageCoverMm,totalDepthMm:h,averageCoverMm:c,requirement,level:'engineering-review',reference:requirement.reference};
}

function ratingIndex(ratingMinutes) {
  const i=RATINGS.indexOf(Number(ratingMinutes));
  if (i<0) throw new RangeError('ratingMinutes must be one of 30,60,90,120,180,240');
  return i;
}
function traced(formulaId,values,clause,warnings) {
  return {
    ...values,formulaId,level:'engineering-review',warnings,
    reference:standardRef({standard:'QCVN 06:2022/BXD',clause,sourceUrl:SOURCE,note:'Nominal fire-resistance table; use only within stated table applicability.'}),
  };
}
