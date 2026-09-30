import { standardRef, standardResult } from './common.js';

const SOURCE='https://files.thuvienphapluat.vn/uploads/DOC2HTM/TC_917896.htm';

export function shortTermUncrackedConcreteModulus(EbMpa) {
  const Eb=Number(EbMpa);
  if (!(Eb>0)) throw new RangeError('EbMpa must be > 0');
  return standardResult({
    value:0.85*Eb,unit:'MPa',formulaId:'TCVN5574-2018-Eq191',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.3.3.4, equation (191)',
      formula:'Eb1 = 0.85 Eb for short-term loading on uncracked section',sourceUrl:SOURCE,
    }),
    inputs:{EbMpa:Eb,duration:'short-term',sectionState:'uncracked'},
  });
}

export function transformedSectionRigidity({Eb1Mpa,IredMm4,Eb1Source=null,IredSource}) {
  const E=Number(Eb1Mpa),I=Number(IredMm4);
  if (!(E>0)||!(I>0)) throw new RangeError('Eb1Mpa and IredMm4 must be > 0');
  if (!IredSource) throw new TypeError('IredSource is required');
  return standardResult({
    value:E*I,unit:'N·mm²',formulaId:'TCVN5574-2018-Eq188',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.3.3.3-8.2.3.3.5, equation (188)',
      formula:'D = Eb1 * Ired',sourceUrl:SOURCE,
    }),
    inputs:{Eb1Mpa:E,IredMm4:I,Eb1Source,IredSource},
  });
}

export function curvatureFromMoment({momentKnM,rigidityNmm2}) {
  const M=Number(momentKnM),D=Number(rigidityNmm2);
  if (!Number.isFinite(M)||!(D>0)) throw new RangeError('momentKnM must be finite and rigidityNmm2 > 0');
  const curvaturePerMm=M*1e6/D;
  return standardResult({
    value:curvaturePerMm*1000,unit:'1/m',formulaId:'TCVN5574-2018-Eq187',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.3.3.3, equation (187)',
      formula:'1/r = M / D',sourceUrl:SOURCE,
    }),
    inputs:{momentKnM:M,rigidityNmm2:D},
  });
}

export function totalCurvatureUncracked({shortTermVariablePerM,longTermPermanentAndLongVariablePerM}) {
  const k1=Number(shortTermVariablePerM),k2=Number(longTermPermanentAndLongVariablePerM);
  if (!Number.isFinite(k1)||!Number.isFinite(k2)) throw new RangeError('curvatures must be finite');
  return standardResult({
    value:k1+k2,unit:'1/m',formulaId:'TCVN5574-2018-Eq185',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.3.3.2, equation (185)',
      formula:'(1/r) = (1/r)1 + (1/r)2 for sections without tensile-zone cracks',sourceUrl:SOURCE,
    }),
    inputs:{shortTermVariablePerM:k1,longTermPermanentAndLongVariablePerM:k2},
  });
}

export function totalCurvatureCracked({shortTermTotalPerM,shortTermPermanentAndLongVariablePerM,longTermPermanentAndLongVariablePerM}) {
  const k1=Number(shortTermTotalPerM),k2=Number(shortTermPermanentAndLongVariablePerM),k3=Number(longTermPermanentAndLongVariablePerM);
  if (![k1,k2,k3].every(Number.isFinite)) throw new RangeError('curvatures must be finite');
  return standardResult({
    value:k1-k2+k3,unit:'1/m',formulaId:'TCVN5574-2018-Eq186',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.3.3.2, equation (186)',
      formula:'(1/r) = (1/r)1 - (1/r)2 + (1/r)3 for sections with tensile-zone cracks',sourceUrl:SOURCE,
    }),
    inputs:{shortTermTotalPerM:k1,shortTermPermanentAndLongVariablePerM:k2,longTermPermanentAndLongVariablePerM:k3},
  });
}

export function shearStrain({
  shearKn,Gmpa,bMm,h0Mm,creepFactorPhiB=1,crackFactorPhiCrc=1
}) {
  for (const [name,value] of Object.entries({Gmpa,bMm,h0Mm,creepFactorPhiB,crackFactorPhiCrc})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  }
  if (!Number.isFinite(Number(shearKn))) throw new RangeError('shearKn must be finite');
  const gamma=1.2*Number(shearKn)*1000*Number(creepFactorPhiB)
    /(Number(Gmpa)*Number(bMm)*Number(h0Mm)*Number(crackFactorPhiCrc));
  return standardResult({
    value:gamma,unit:'rad',formulaId:'TCVN5574-2018-Eq182',
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.2.3.2.4, equation (182)',
      formula:'gamma_x = 1.2 Qx phi_b / (G b h0 phi_crc)',sourceUrl:SOURCE,
    }),
    inputs:{shearKn:Number(shearKn),Gmpa:Number(Gmpa),bMm:Number(bMm),h0Mm:Number(h0Mm),creepFactorPhiB:Number(creepFactorPhiB),crackFactorPhiCrc:Number(crackFactorPhiCrc)},
  });
}
