import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretHomeownerText } from '../src/ai/intake.js';

test('intake extracts common homeowner facts', () => {
  const parsed = interpretHomeownerText('Đất 4x16, nhà 5 người, ngân sách 3 tỷ, có ô tô');
  const map = Object.fromEntries(parsed.updates.map((item) => [item.path, item.value]));
  assert.equal(map['land.widthM'], 4);
  assert.equal(map['land.lengthM'], 16);
  assert.equal(map['household.people'], 5);
  assert.equal(map['budget.totalVnd'], 3_000_000_000);
  assert.equal(map['household.hasCar'], true);
});
