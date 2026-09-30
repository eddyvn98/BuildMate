export const STANDARD_CONFORMANCE_MATRIX=Object.freeze([
  entry(4,'loads-combinations','TCVN 2737:2023 6.3-8.3',[
    'standard-derived.test.js','standard-load-foundation.test.js','standard-wind-permanent.test.js'
  ]),
  entry(4,'wind-rigid-dynamic-aero','TCVN 2737:2023 10.2 + Appendix F; QCVN 02:2022/BXD',[
    'standard-wind-terrain.test.js','standard-wind-aerodynamic.test.js','standard-wind-dynamic.test.js',
    'standard-ampacity-roof-interpolation.test.js','standards-conformance-matrix.test.js'
  ]),
  entry(5,'rc-material-uls-sls','TCVN 5574:2018 6.1-8.2',[
    'standard-rc-materials.test.js','standard-rc-materials-full.test.js','standard-rc-material-deformation.test.js',
    'standard-rc-cracked.test.js','standard-rc-sls-pile.test.js','standard-curvature-pile-settlement.test.js'
  ]),
  entry(5,'rc-strength-sections','TCVN 5574:2018 8.1',[
    'standard-gap-closure.test.js','standard-flanged-shear-shortpile.test.js','standard-single-pile-column-eq43.test.js',
    'standard-rc-workflows.test.js','standard-rc-local-fire.test.js'
  ]),
  entry(5,'rc-detailing-fire','TCVN 5574:2018 10.3 + QCVN 06:2022/BXD + Amendment 1:2023',[
    'standard-rc-detailing.test.js','standard-rc-anchorage.test.js','standard-rc-lap.test.js',
    'standard-rc-cover.test.js','standard-rc-local-fire.test.js'
  ]),
  entry(6,'shallow-foundation','TCVN 9362:2012 4.6 + Appendix C/D',[
    'standard-load-foundation.test.js','standard-foundation-settlement.test.js','standard-foundation-alpha.test.js',
    'standard-foundation-freeair.test.js'
  ]),
  entry(6,'pile-foundation','TCVN 10304:2025 5,7 + Appendices D/G',[
    'standard-pile-field-tests.test.js','standard-single-pile-column-eq43.test.js',
    'standard-curvature-pile-settlement.test.js','standard-flanged-shear-shortpile.test.js',
    'standard-cpt-pump-acceptance.test.js','standard-gates-curves.test.js'
  ]),
  entry(7,'electrical','QCVN 12 + TCVN 9206 + TCVN 7447-4-41/-5-52/-5-54/-6',[
    'standard-electrical.test.js','standard-electrical-ampacity.test.js','standard-electrical-corrections.test.js',
    'standard-electrical-fault-loop.test.js','standard-electrical-verification.test.js',
    'standard-foundation-freeair.test.js','standard-xlpe-largewater.test.js','standard-provenance.test.js'
  ]),
  entry(8,'water-drainage-pump','TCVN 4513:1988 + TCVN 7957:2023 + TCVN 9222:2012',[
    'standard-water-drainage.test.js','standard-water-hydraulics.test.js','standard-water-pump.test.js',
    'standard-cpt-pump-acceptance.test.js','standard-xlpe-largewater.test.js'
  ]),
]);

export function conformanceForIssue(issue) {
  return structuredClone(STANDARD_CONFORMANCE_MATRIX.filter(x=>x.issue===Number(issue)));
}

function entry(issue,id,source,testFiles) {
  return {issue,id,source,testFiles:[...testFiles],tests:testFiles.map(x=>x.replace(/\.test\.js$/,''))};
}
