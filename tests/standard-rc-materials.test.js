import test from 'node:test';
import assert from 'node:assert/strict';
import { concreteDesignProperties,rebarDesignProperties,rectangularFlexuralCapacity,rectangularShearCheck } from '../src/engine/standards/tcvn5574.js';

test('TCVN 5574 material lookups feed deterministic flexure and shear checks',()=>{
  const concrete=concreteDesignProperties('B25');
  const steel=rebarDesignProperties('CB400-V');
  assert.equal(concrete.Rb,14.5);
  assert.equal(concrete.Rbt,1.05);
  assert.equal(steel.Rs,350);
  assert.equal(steel.Rsw,280);

  const flex=rectangularFlexuralCapacity({
    bMm:200,h0Mm:450,RbMpa:concrete.Rb,RsMpa:steel.Rs,AsMm2:1000,xiR:0.5,
    materialSource:'TCVN 5574:2018 Tables 7,13',
  });
  assert.ok(flex.value>0);

  const shear=rectangularShearCheck({
    designShearKn:100,bMm:300,h0Mm:500,RbMpa:concrete.Rb,RbtMpa:concrete.Rbt,
    RswMpa:steel.Rsw,AswMm2:157,stirrupSpacingMm:150,
  });
  assert.equal(shear.concreteStrip.pass,true);
});
