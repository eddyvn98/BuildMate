import test from 'node:test';
import assert from 'node:assert/strict';
import { concreteMaterialProperties,concreteCreepFactor,longTermConcreteModulus,concreteWorkingConditionFactors,adjustedConcreteDesignStrengths } from '../src/engine/standards/tcvn5574-materials.js';

test('TCVN 5574 full heavy concrete registry covers normal and high-strength classes',()=>{
  assert.equal(concreteMaterialProperties({strengthClass:'B25'}).Rb,14.5);
  assert.equal(concreteMaterialProperties({strengthClass:'B25'}).RbSer,18.5);
  assert.equal(concreteMaterialProperties({strengthClass:'B100'}).Rb,47.5);
  assert.equal(concreteMaterialProperties({strengthClass:'B100'}).Eb,43000);
});

test('TCVN 5574 lightweight and aerated strength/Eb tables require density pairs',()=>{
  assert.equal(concreteMaterialProperties({strengthClass:'B20',type:'lightweight',densityKgM3:1400}).Eb,13500);
  assert.equal(concreteMaterialProperties({strengthClass:'B15',type:'aerated',densityKgM3:1200}).Eb,9300);
  assert.equal(concreteMaterialProperties({strengthClass:'B15',type:'aerated',densityKgM3:1200}).Rb,7.7);
});

test('TCVN 5574 Table 11 creep and Eq192 long-term modulus are deterministic',()=>{
  const phi=concreteCreepFactor({strengthClass:'B25',relativeHumidityPercent:80});
  assert.equal(phi.value,1.8);
  assert.equal(longTermConcreteModulus({EbMpa:30000,creepFactor:phi.value}).value,10714.286);
  const light=concreteCreepFactor({strengthClass:'B25',relativeHumidityPercent:80,type:'lightweight',densityKgM3:1400});
  assert.ok(light.value<1.8);
});

test('TCVN 5574 gamma_b conditions adjust only the strengths required by 6.1.2.3',()=>{
  const props=concreteMaterialProperties({strengthClass:'B25'});
  const factors=concreteWorkingConditionFactors({loadDuration:'longOnly',verticalCastHeightM:2});
  assert.equal(factors.gammaB1,0.9);
  assert.equal(factors.gammaB3,0.85);
  const adjusted=adjustedConcreteDesignStrengths({properties:props,workingConditions:factors});
  assert.equal(adjusted.RbMpa,11.0925);
  assert.equal(adjusted.RbtMpa,0.945);
  const aerated=concreteWorkingConditionFactors({concreteType:'aerated',loadDuration:'longOnly',aeratedHumidityPercent:20});
  assert.ok(aerated.gammaB4<1&&aerated.gammaB4>0.85);
});
