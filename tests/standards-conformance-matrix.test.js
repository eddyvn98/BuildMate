import test from 'node:test';
import assert from 'node:assert/strict';
import { QCVN02_WIND_ZONES,validateQcvn02WindRow,createQcvn02WindRegistry,resolveQcvn02WindLocality,authorityWindInput,QCVN02_BUILTIN_ROWS } from '../src/engine/standards/qcvn02-wind-locality.js';
import { STANDARD_CLAUSE_COVERAGE } from '../src/engine/standards/coverage.js';
import { STANDARD_CONFORMANCE_MATRIX,conformanceForIssue } from '../src/engine/standards/conformance.js';

test('QCVN 02 zones have exact W0 V3s50 V10m50 metrics',()=>{
  assert.deepEqual(QCVN02_WIND_ZONES.I,{w0DaNm2:65,v3s50Mps:36,v10m50Mps:26});
  assert.deepEqual(QCVN02_WIND_ZONES.III,{w0DaNm2:125,v3s50Mps:50,v10m50Mps:36});
  assert.deepEqual(QCVN02_WIND_ZONES.V,{w0DaNm2:185,v3s50Mps:61,v10m50Mps:43});
  assert.throws(()=>validateQcvn02WindRow({province:'X',zone:'II',w0DaNm2:125,sourceRow:'bad'}));
});

test('generic sourced QCVN 02 registry resolves most-specific locality without guessing',()=>{
  const registry=createQcvn02WindRegistry([
    {province:'Test Province',district:'*',excludeDistricts:['Special'],zone:'II',sourceRow:'all except Special'},
    {province:'Test Province',district:'Special',zone:'III',sourceRow:'Special'},
  ]);
  assert.equal(resolveQcvn02WindLocality({registry,province:'Test Province',district:'Normal'}).zone,'II');
  assert.equal(resolveQcvn02WindLocality({registry,province:'Test Province',district:'Special'}).zone,'III');
  assert.equal(resolveQcvn02WindLocality({registry,province:'Unknown'}).blocked,true);
});

test('built-in official QCVN 02 rows reproduce HCMC and islands',()=>{
  assert.equal(resolveQcvn02WindLocality({registry:QCVN02_BUILTIN_ROWS,province:'TP. Hồ Chí Minh',district:'Củ Chi'}).zone,'I');
  assert.equal(resolveQcvn02WindLocality({registry:QCVN02_BUILTIN_ROWS,province:'Thành phố Hồ Chí Minh',district:'Quận 3'}).zone,'II');
  assert.equal(resolveQcvn02WindLocality({registry:QCVN02_BUILTIN_ROWS,province:'Đà Nẵng',district:'Hoàng Sa'}).zone,'V');
  assert.equal(resolveQcvn02WindLocality({registry:QCVN02_BUILTIN_ROWS,province:'Khánh Hòa',district:'Trường Sa'}).zone,'IV');
});

test('QCVN 02 authority V0 input converts by equation 5.1 with provenance',()=>{
  const r=authorityWindInput({v3s20Mps:40,sourceAuthority:'IMHEN',sourceDocument:'signed wind data'});
  assert.ok(Math.abs(r.w0DaNm2-98.08)<0.001);
});

test('engineering profiles have no remaining software calculation gap',()=>{
  for (const issue of [4,5,6,7,8]) {
    const c=STANDARD_CLAUSE_COVERAGE.find(x=>x.issue===issue);
    assert.deepEqual(c.pending,[]);
    assert.ok(Array.isArray(c.externalRequirements)&&c.externalRequirements.length>0);
    assert.ok(conformanceForIssue(issue).length>0);
  }
  assert.ok(STANDARD_CONFORMANCE_MATRIX.length>=8);
});
