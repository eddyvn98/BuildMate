import test from 'node:test';
import assert from 'node:assert/strict';
import { terrainPressureFactor,rigidStructureGustFactor,hcmWindZone,standardWindPressure } from '../src/engine/standards/tcvn2737.js';

test('TCVN 2737 Table 9 k(ze) lookup interpolates intermediate heights',()=>{
  assert.equal(terrainPressureFactor({terrain:'B',zeM:10}).value,1);
  const mid=terrainPressureFactor({terrain:'B',zeM:12.5}).value;
  assert.ok(mid>1&&mid<1.09);
});

test('TCVN 2737 rigid structure Gf is 0.85 only for T1 <= 1s',()=>{
  assert.equal(rigidStructureGustFactor(0.5).value,0.85);
  assert.throws(()=>rigidStructureGustFactor(1.1));
});

test('QCVN 02 official HCMC rows distinguish Cu Chi from remaining HCMC districts',()=>{
  assert.equal(hcmWindZone({district:'Quận 3'}).zone,'II');
  assert.equal(hcmWindZone({district:'Thành phố Thủ Đức'}).valueDaNm2,95);
  assert.equal(hcmWindZone({district:'Huyện Củ Chi'}).zone,'I');
});

test('verified wind coefficients can feed equation 10 without arbitrary defaults',()=>{
  const zone=hcmWindZone({district:'Quận 3'});
  const k=terrainPressureFactor({terrain:'C',zeM:20});
  const gf=rigidStructureGustFactor(0.6);
  const result=standardWindPressure({
    windZone:zone.zone,kZe:k.value,aerodynamicCoefficient:0.8,gustFactor:gf.value,
    coefficientSources:{kZe:k.reference.sourceUrl,aerodynamicCoefficient:'TCVN 2737 aerodynamic case selected for project geometry',gustFactor:gf.reference.sourceUrl},
  });
  assert.ok(result.value>0);
});
