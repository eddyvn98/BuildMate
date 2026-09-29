import test from 'node:test';
import assert from 'node:assert/strict';
import { d1d2CopperAmpacity,bundledGroupingFactor,correctedAmpacity } from '../src/engine/standards/tcvn7447-5-52.js';
import { maximumFinalCircuitDisconnectionTime,checkDisconnectionTime } from '../src/engine/standards/tcvn7447-4-41.js';
import { checkOverloadProtection,requireProspectiveShortCircuitCurrent } from '../src/engine/standards/qcvn12.js';

test('TCVN 7447-5-52 D1/D2 copper ampacity and grouping factors are table-backed',()=>{
  assert.equal(d1d2CopperAmpacity({sectionMm2:6,insulation:'PVC',loadedConductors:2}).ampacityA,47);
  assert.equal(d1d2CopperAmpacity({sectionMm2:6,insulation:'XLPE',loadedConductors:3}).ampacityA,46);
  const factor=bundledGroupingFactor(3).factor;
  assert.equal(factor,0.7);
  assert.equal(correctedAmpacity({baseAmpacityA:47,correctionFactors:[factor]}).ampacityA,32.9);
});

test('TCVN 7447-4-41 Table 41.1 checks final-circuit disconnection time',()=>{
  assert.equal(maximumFinalCircuitDisconnectionTime({system:'TN',uoV:230,currentA:20}).maxTimeS,0.4);
  assert.equal(maximumFinalCircuitDisconnectionTime({system:'TT',uoV:230,currentA:20}).maxTimeS,0.2);
  assert.equal(checkDisconnectionTime({system:'TN',uoV:230,currentA:20,actualTimeS:0.3}).pass,true);
});

test('QCVN 12 overload protection equations are enforced',()=>{
  const ok=checkOverloadProtection({designCurrentA:20,protectiveRatingA:25,cableAmpacityA:29,deviceConventionalOperatingCurrentA:36});
  assert.equal(ok.pass,true);
  const bad=checkOverloadProtection({designCurrentA:30,protectiveRatingA:32,cableAmpacityA:29,deviceConventionalOperatingCurrentA:40});
  assert.equal(bad.pass,false);
  assert.equal(requireProspectiveShortCircuitCurrent({valueA:5000,method:'calculation'}).ready,true);
  assert.equal(requireProspectiveShortCircuitCurrent({}).ready,false);
});
