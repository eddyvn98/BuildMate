import { standardRef } from './common.js';

const SOURCE='https://thuvienphapluat.vn/TCVN/Dien-dien-tu/TCVN-7447-6-2011-He-thong-lap-dat-dien-ha-ap-Kiem-tra-xac-nhan-907724.aspx';

export function quickMeasuredTnLoopCheck({measuredLoopImpedanceOhm,uoV,tripCurrentA}) {
  const Z=Number(measuredLoopImpedanceOhm),U=Number(uoV),Ia=Number(tripCurrentA);
  if (!(Z>=0)||!(U>0)||!(Ia>0)) throw new RangeError('measuredLoopImpedanceOhm>=0, uoV>0 and tripCurrentA>0 are required');
  const limit=(2/3)*U/Ia;
  return {
    pass:Z<=limit,
    measuredLoopImpedanceOhm:Z,
    maximumMeasuredOhm:round(limit,6),
    uoV:U,tripCurrentA:Ia,
    level:'engineering-review',
    reference:standardRef({
      standard:'TCVN 7447-6:2011',
      clause:'C.61.3.6.2',
      formula:'Zs(m) <= (2/3) Uo/Ia',
      sourceUrl:SOURCE,
      note:'Conservative verification using room-temperature loop-impedance measurement.',
    }),
  };
}

export function evaluatedTnLoopFromMeasurements({
  sourceLoopImpedanceOhm,
  segments,
  uoV,
  tripCurrentA
}) {
  const Ze=Number(sourceLoopImpedanceOhm),U=Number(uoV),Ia=Number(tripCurrentA);
  if (!(Ze>=0)||!(U>0)||!(Ia>0)) throw new RangeError('sourceLoopImpedanceOhm>=0, uoV>0 and tripCurrentA>0 are required');
  if (!Array.isArray(segments)||segments.length===0) throw new TypeError('measured circuit segments are required');

  let circuitResistance=0;
  const detail=segments.map((segment,i)=>{
    const rp=Number(segment.phaseResistanceOhm),rpe=Number(segment.peResistanceOhm),k=Number(segment.temperatureCorrectionFactor);
    if (!(rp>=0)||!(rpe>=0)||!(k>=1)) throw new RangeError('segment '+i+' requires measured phase/PE resistance >=0 and sourced correction factor >=1');
    if (!segment.measurementSource||!segment.correctionSource) throw new TypeError('segment '+i+' measurementSource and correctionSource are required');
    const corrected=(rp+rpe)*k;
    circuitResistance+=corrected;
    return {...segment,phaseResistanceOhm:rp,peResistanceOhm:rpe,temperatureCorrectionFactor:k,correctedLoopResistanceOhm:round(corrected,6)};
  });
  const evaluatedZs=Ze+circuitResistance;
  const limit=U/Ia;

  return {
    pass:evaluatedZs<=limit,
    evaluatedLoopImpedanceOhm:round(evaluatedZs,6),
    maximumLoopImpedanceOhm:round(limit,6),
    sourceLoopImpedanceOhm:Ze,
    correctedCircuitResistanceOhm:round(circuitResistance,6),
    segments:detail,uoV:U,tripCurrentA:Ia,
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 7447-6:2011',clause:'C.61.3.6.2 items a-d',formula:'evaluate Ze then measured phase/PE resistances with temperature increase correction',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 7447-4-41:2010',clause:'411.4.4',formula:'Zs Ia <= Uo',sourceUrl:'https://cdn.ahit.vn/tanbinhres/wp-content/uploads/2020/08/27225051/TCVN-7447-4-41-2010.pdf'}),
    ],
  };
}

export function earthElectrodeMeasurement({measuredResistanceOhm,measurementMethod,source}) {
  const R=Number(measuredResistanceOhm);
  if (!(R>0)) throw new RangeError('measuredResistanceOhm must be >0');
  if (!measurementMethod||!source) throw new TypeError('measurementMethod and source are required');
  return {
    measuredResistanceOhm:R,measurementMethod:String(measurementMethod),source:String(source),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 7447-6:2011',clause:'61.3.6.2 / earth-electrode resistance verification',sourceUrl:SOURCE,note:'Earth-electrode resistance must be measured by an appropriate method where required.'}),
  };
}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
