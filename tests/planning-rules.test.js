import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlanningRule, planningBaselineForDate, resolvePlanningRules } from '../src/engine/planning-rules.js';

test('planning baseline transitions on 2027-01-01', () => {
  assert.equal(planningBaselineForDate('2026-12-31').standard, 'QCVN 01:2021/BXD');
  assert.equal(planningBaselineForDate('2027-01-01').standard, 'QCVN 01:2026/BXD');
});

test('local sourced rule overrides broader rule by locality specificity', () => {
  const rules = [
    createPlanningRule({ id:'p', field:'maxStoreys', value:4, locality:'hồ chí minh', applicability:'urban housing', effectiveFrom:'2026-01-01', source:'approved plan', sourceUrl:'https://example.test/p' }),
    createPlanningRule({ id:'d', field:'maxStoreys', value:3, locality:'quận 3', applicability:'urban housing', effectiveFrom:'2026-01-01', source:'district plan', sourceUrl:'https://example.test/d' }),
  ];
  const result = resolvePlanningRules({ projectDate:'2026-09-29', locality:{province:'Hồ Chí Minh', district:'Quận 3'}, rules });
  assert.equal(result.resolved.maxStoreys.value, 3);
  assert.equal(result.baseline.standard, 'QCVN 01:2021/BXD');
});

test('unconfirmed parcel-specific rule is blocked', () => {
  const result = resolvePlanningRules({
    projectDate:'2026-09-29',
    locality:{province:'Hồ Chí Minh', parcel:'12-34'},
    rules:[{ id:'parcel', field:'setbackM', value:2, locality:'12-34', applicability:'parcel', effectiveFrom:'2026-01-01', source:'user note', sourceUrl:'https://example.test/doc', parcelSpecific:true, confirmed:false }],
  });
  assert.equal(result.resolved.setbackM, undefined);
  assert.equal(result.blocked.length, 1);
  assert.equal(result.constructionReady, false);
});
