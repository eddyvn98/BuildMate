import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngineeringProfile, assessProfileReadiness, addClauseMapping, addReferenceCase, recordIndependentReview } from '../src/engine/profile-gate.js';
import { combineLoadActions, sourcedNaturalCondition } from '../src/engine/engineering/load-profile.js';
import { checkMemberDemandCapacity, requireRcDesignInputs } from '../src/engine/engineering/rc.js';
import { checkFoundationBearing, checkFoundationEccentricity } from '../src/engine/engineering/foundation.js';
import { calculateVoltageDrop, checkProtectionDisconnection } from '../src/engine/engineering/electrical.js';
import { calculatePipeVelocity, calculateFullPipeManning } from '../src/engine/engineering/water.js';

test('engineering profile becomes standards-ready with source, clause map and reference cases',()=>{
  let p=createEngineeringProfile({id:'loads',standard:'TCVN 2737',version:'2023',applicability:'house',sourceUrl:'https://example.test'});
  assert.equal(assessProfileReadiness(p).constructionReady,false);
  p=addClauseMapping(p,{clause:'verified-clause-id',formulaId:'sum(action*factor)',units:'kN'});
  p=addReferenceCase(p,{id:'case-1',expected:10});
  assert.equal(assessProfileReadiness(p).constructionReady,true);
  p=recordIndependentReview(p,{reviewer:'qualified-reviewer',reviewedAt:'2026-09-29',outcome:'approved'});
  assert.equal(assessProfileReadiness(p).constructionReady,true);
});

test('load combinations require sourced explicit values and factors',()=>{
  const result=combineLoadActions({
    actions:[{id:'G',value:10,unit:'kN',source:'project model'},{id:'Q',value:5,unit:'kN',source:'project model'}],
    combination:[{actionId:'G',factor:1.2},{actionId:'Q',factor:1.5}]
  });
  assert.equal(result.value,19.5);
  assert.throws(()=>sourcedNaturalCondition({name:'wind',value:1,unit:'kPa'}));
});

test('RC workflow checks supplied verified capacities rather than inventing strengths',()=>{
  const r=checkMemberDemandCapacity({memberType:'beam',demandMomentKnM:80,demandShearKn:40,momentCapacityKnM:100,shearCapacityKn:60,capacitySource:'verified calculation'});
  assert.equal(r.moment.pass,true);
  assert.equal(requireRcDesignInputs({concreteStrengthMpa:20}).ready,false);
});

test('foundation, electrical and water primitives are deterministic',()=>{
  assert.equal(checkFoundationBearing({serviceLoadKn:1000,areaM2:5,allowableBearingKpa:250,source:'geotech'}).pass,true);
  assert.equal(checkFoundationEccentricity({resultantEccentricityM:0.2,foundationWidthM:2}).pass,true);
  const vd=calculateVoltageDrop({currentA:20,lengthM:30,resistanceOhmPerKm:4.61,voltageV:220,powerFactor:1});
  assert.ok(vd.dropPercent>2 && vd.dropPercent<3);
  assert.equal(checkProtectionDisconnection({faultCurrentA:1000,clearingTimeS:0.2,maxClearingTimeS:0.4,source:'breaker curve'}).pass,true);
  assert.ok(calculatePipeVelocity({flowLitersPerSecond:1,internalDiameterMm:25}).velocityMps>2);
  assert.ok(calculateFullPipeManning({internalDiameterMm:100,slope:0.01,manningN:0.013}).flowLitersPerSecond>0);
});
