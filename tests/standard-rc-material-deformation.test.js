import test from 'node:test';
import assert from 'node:assert/strict';
import { concreteDesignProperties } from '../src/engine/standards/tcvn5574.js';
import { concreteWorkingConditionFactors,applyConcreteWorkingConditions,creepCoefficient,longTermConcreteStrains,longTermConcreteModulus,equivalentConcreteModulus } from '../src/engine/standards/tcvn5574-material.js';
import { crackTensionSteelFactor,crackedRectangularSection,crackedSectionCurvature } from '../src/engine/standards/tcvn5574-cracked.js';

test('TCVN 5574 heavy concrete Tables 6 7 10 now cover B3.5 through B100',()=>{
  assert.equal(concreteDesignProperties('B3.5').Rb,2.1);
  assert.equal(concreteDesignProperties('B25').RbSer,18.5);
  assert.equal(concreteDesignProperties('B100').Eb,43000);
  assert.equal(concreteDesignProperties('B100').RbtSer,3.8);
});

test('TCVN 5574 6.1.2.3 working-condition factors are explicit',()=>{
  const all=concreteWorkingConditionFactors({loadDuration:'all',concreteKind:'reinforcedConcrete'});
  assert.equal(all.compressionFactor,1);
  const longVertical=concreteWorkingConditionFactors({loadDuration:'permanent-long',concreteKind:'reinforcedConcrete',verticalPourLayerHeightM:2});
  assert.equal(longVertical.compressionFactor,0.765);
  const cellular=concreteWorkingConditionFactors({loadDuration:'permanent-long',concreteKind:'cellular',cellularMoisturePercent:20});
  assert.ok(cellular.gammaB4<1&&cellular.gammaB4>0.85);
  assert.equal(applyConcreteWorkingConditions({RbMpa:20,RbtMpa:1.5,loadDuration:'permanent-long',concreteKind:'reinforcedConcrete'}).RbMpa,18);
});

test('TCVN 5574 Table 11 creep and Eq192 long-term modulus are exact',()=>{
  assert.equal(creepCoefficient({strengthClass:'B25',relativeHumidityPercent:80}).value,1.8);
  assert.equal(creepCoefficient({strengthClass:'B60',relativeHumidityPercent:60}).value,1.4);
  assert.equal(creepCoefficient({strengthClass:'B100',relativeHumidityPercent:30}).value,2);
  const E=longTermConcreteModulus({EbMpa:30000,strengthClass:'B25',relativeHumidityPercent:80});
  assert.ok(Math.abs(E.value-10714.2857)<0.01);
});

test('TCVN 5574 Table 9 high-strength strain factor and Eq13 are automatic',()=>{
  assert.equal(longTermConcreteStrains({strengthClass:'B25',relativeHumidityPercent:80}).eb1red,0.0024);
  const b100=longTermConcreteStrains({strengthClass:'B100',relativeHumidityPercent:80});
  assert.ok(b100.eb1red<0.0024);
  assert.equal(equivalentConcreteModulus({RbSerMpa:18.5,duration:'short-term',concreteType:'heavy'}).value,12333.3333);
});

test('TCVN 5574 Eq176 and Eq193-196 close cracked rectangular stiffness workflow',()=>{
  const psi=crackTensionSteelFactor({momentKnM:40,crackingMomentKnM:20});
  assert.equal(psi.value,0.6);
  const section=crackedRectangularSection({
    bMm:300,h0Mm:550,aPrimeMm:40,AsMm2:1800,AsCompressionMm2:600,
    EsMpa:200000,RbSerMpa:18.5,duration:'short-term',psiS:psi.value,
  });
  assert.ok(section.neutralAxisMm>0&&section.neutralAxisMm<550);
  assert.ok(section.IredMm4>0);
  assert.ok(section.rigidityNmm2>0);
  const k=crackedSectionCurvature({momentKnM:100,section});
  assert.ok(k.value>0);
});
