import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_REFERENCE_BENCHMARKS } from '../src/engine/standards/reference-benchmarks.js';
import { standardWindPressure } from '../src/engine/standards/tcvn2737.js';
import { rectangularFlexuralCapacity } from '../src/engine/standards/tcvn5574.js';
import { layerSummationSettlement } from '../src/engine/standards/tcvn9362.js';
import { protectiveConductorAdiabaticArea } from '../src/engine/standards/tcvn7447-5-54.js';
import { housingDesignFlow } from '../src/engine/standards/tcvn4513.js';
import { residentialOutdoorAir } from '../src/engine/engineering/hvac.js';

const runners={
  'loads-wind-zone-II-rigid':(x)=>standardWindPressure({...x,coefficientSources:{kZe:'benchmark clause',aerodynamicCoefficient:'benchmark clause',gustFactor:'benchmark clause'}}),
  'rc-b25-rectangular-flexure':(x)=>rectangularFlexuralCapacity(x),
  'foundation-layer-summation':(x)=>layerSummationSettlement(x),
  'electrical-pe-adiabatic':(x)=>protectiveConductorAdiabaticArea(x),
  'water-housing-design-flow':(x)=>housingDesignFlow(x),
  'hvac-bedroom-outdoor-air':(x)=>residentialOutdoorAir(x),
};

test('golden standard benchmarks reproduce hand-derived expected values',()=>{
  assert.deepEqual(STANDARD_REFERENCE_BENCHMARKS.map(x=>x.issue),[4,5,6,7,8,12]);
  for (const benchmark of STANDARD_REFERENCE_BENCHMARKS) {
    const result=runners[benchmark.id](structuredClone(benchmark.inputs));
    assert.ok(
      Math.abs(result.value-benchmark.expected.value)<=benchmark.expected.tolerance,
      benchmark.id+' expected '+benchmark.expected.value+' got '+result.value
    );
    assert.equal(result.unit,benchmark.expected.unit);
  }
});
