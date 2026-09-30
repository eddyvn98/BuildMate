import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex,canonicalJson } from '../src/engine/hash.js';
import { engineeringEvidenceDigest } from '../src/engine/engineering-evidence.js';

test('pure JS SHA-256 matches standard known vectors',()=>{
  assert.equal(sha256Hex(''),'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256Hex('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('canonical JSON makes object key order irrelevant',()=>{
  assert.equal(canonicalJson({b:2,a:{d:4,c:3}}),canonicalJson({a:{c:3,d:4},b:2}));
  assert.equal(engineeringEvidenceDigest([],7).length,64);
});
