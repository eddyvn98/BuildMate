import test from 'node:test';
import assert from 'node:assert/strict';
import { flangedFlexuralCapacity,limitFlangedCapacityAtXiR } from '../src/engine/standards/tcvn5574-sections.js';
import { inclinedShearCapacity,checkInclinedShear } from '../src/engine/standards/tcvn5574-shear.js';
import { shortPileTableRow,shortPileSettlement } from '../src/engine/standards/tcvn10304-short-settlement.js';

test('TCVN 5574 Eq36 selects flange branch and Eq37-38 web branch',()=>{
  const flange=flangedFlexuralCapacity({
    webWidthMm:200,compressionFlangeWidthMm:1000,compressionFlangeThicknessMm:100,h0Mm:450,
    RbMpa:14.5,RsMpa:350,AsMm2:1500,xiR:0.5,effectiveFlangeWidthSource:'8.1.2.3.4 geometry check',
  });
  assert.equal(flange.checks.branch,'neutral-axis-in-flange');
  const web=flangedFlexuralCapacity({
    webWidthMm:200,compressionFlangeWidthMm:600,compressionFlangeThicknessMm:80,h0Mm:450,
    RbMpa:14.5,RsMpa:350,AsMm2:4000,xiR:0.5,effectiveFlangeWidthSource:'8.1.2.3.4 geometry check',
  });
  assert.equal(web.checks.branch,'neutral-axis-in-web');
  assert.ok(web.value>0);
});

test('TCVN 5574 inclined shear searches C from h0 to 2h0',()=>{
  const c=inclinedShearCapacity({bMm:250,h0Mm:450,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150});
  assert.ok(c.governingProjectionMm>=450&&c.governingProjectionMm<=900);
  assert.ok(c.capacityKn>0);
  assert.equal(checkInclinedShear({designShearKn:50,bMm:250,h0Mm:450,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150}).pass,true);
});

test('TCVN 10304 current Table 17 short-pile coefficients and Eq34 are exact',()=>{
  assert.equal(shortPileTableRow(0.3).mv,1.607);
  assert.equal(shortPileTableRow(0.15).kv,2.302);
  const r=shortPileSettlement({loadMN:0.4,G1Mpa:5,G2Mpa:10,poissonRatio:0.3,pileLengthM:10,pileDiameterM:0.8});
  assert.ok(r.inputs.k>1&&r.inputs.k<=7.5);
  assert.ok(r.value>0);
});
