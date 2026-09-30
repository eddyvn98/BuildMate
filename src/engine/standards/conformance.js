export const STANDARD_CONFORMANCE_MATRIX=Object.freeze([
  {issue:4,id:'loads-combinations',source:'TCVN 2737:2023 6.3-6.5',tests:['standard-derived','standard-load-foundation']},
  {issue:4,id:'wind-rigid-dynamic-aero',source:'TCVN 2737:2023 10.2 + Appendix F; QCVN 02:2022/BXD',tests:['standard-wind-permanent','standard-wind-terrain','standard-wind-aerodynamic','standard-wind-dynamic','standard-qcvn02-locality']},
  {issue:5,id:'rc-material-uls-sls',source:'TCVN 5574:2018 6.1-8.2',tests:['standard-rc-materials','standard-rc-material-deformation','standard-flanged-shear-shortpile','standard-rc-workflows']},
  {issue:5,id:'rc-detailing-fire',source:'TCVN 5574:2018 10.3 + QCVN 06:2022/BXD Appendix F',tests:['standard-rc-detailing','standard-rc-anchorage','standard-rc-cover','standard-rc-local-fire']},
  {issue:6,id:'shallow-foundation',source:'TCVN 9362:2012 4.6 + Appendix C/D',tests:['standard-load-foundation','standard-foundation-settlement','standard-foundation-alpha','standard-foundation-freeair']},
  {issue:6,id:'pile-foundation',source:'TCVN 10304:2025 5,7 + Appendices D/G',tests:['standard-pile-field-tests','standard-single-pile-column-eq43','standard-curvature-pile-settlement','standard-flanged-shear-shortpile']},
  {issue:7,id:'electrical',source:'QCVN 12 + TCVN 9206 + TCVN 7447-4-41/-5-52/-5-54/-6',tests:['standard-electrical','standard-electrical-ampacity','standard-electrical-corrections','standard-electrical-fault-loop','standard-electrical-verification','standard-foundation-freeair']},
  {issue:8,id:'water-drainage-pump',source:'TCVN 4513:1988 + TCVN 7957:2023 + TCVN 9222:2012',tests:['standard-water-drainage','standard-water-hydraulics','standard-water-pump','standard-cpt-pump-acceptance']},
]);

export function conformanceForIssue(issue) {
  return structuredClone(STANDARD_CONFORMANCE_MATRIX.filter(x=>x.issue===Number(issue)));
}
