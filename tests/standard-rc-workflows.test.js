import test from 'node:test';
import assert from 'node:assert/strict';
import { designDistributedLiveLoad } from '../src/engine/standards/tcvn2737.js';
import { columnFlexuralRigidity,columnCriticalLoad,secondOrderEta,rectangularEccentricCompressionCheck } from '../src/engine/standards/tcvn5574-column.js';
import { beamWorkflow,slabWorkflow,columnWorkflow } from '../src/engine/engineering/rc-workflows.js';

const loadTrace=designDistributedLiveLoad(1.5);

test('TCVN 5574 column second-order chain follows equations 44-46',()=>{
  const D=columnFlexuralRigidity({kb:0.2,EbMpa:30000,concreteInertiaMm4:1e9,EsMpa:200000,steelInertiaMm4:5e6,kbSource:'TCVN 5574 project kb basis'});
  const ncr=columnCriticalLoad({rigidityNmm2:D.value,effectiveLengthMm:3000});
  const eta=secondOrderEta({axialLoadKn:500,criticalLoadKn:ncr.value});
  assert.ok(eta.value>=1);
});

test('TCVN 5574 eccentric compression Eq.40-42 branch is testable',()=>{
  const r=rectangularEccentricCompressionCheck({
    axialLoadKn:300,firstOrderMomentKnM:20,eta:1.1,bMm:300,hMm:400,h0Mm:360,aPrimeMm:40,
    RbMpa:14.5,RsMpa:350,RscMpa:350,AsMm2:1200,AsCompressionMm2:1200,xiR:0.5,
  });
  assert.equal(r.blocked,false);
  assert.ok(r.capacityKnM>0);
});

test('beam slab and column workflows require TCVN 2737 load trace',()=>{
  const flexure={designMomentKnM:80,capacity:{bMm:200,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'TCVN 5574 tables'}};
  const beam=beamWorkflow({loadTrace,flexure,shear:{designShearKn:50,bMm:200,h0Mm:450,RbMpa:14.5,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150}});
  assert.equal(beam.memberType,'beam');
  assert.equal(slabWorkflow({loadTrace,flexure}).memberType,'slab');
  const column=columnWorkflow({loadTrace,column:{axialLoadKn:300,firstOrderMomentKnM:20,eta:1.1,bMm:300,hMm:400,h0Mm:360,aPrimeMm:40,RbMpa:14.5,RsMpa:350,RscMpa:350,AsMm2:1200,AsCompressionMm2:1200,xiR:0.5}});
  assert.equal(column.memberType,'column');
  assert.throws(()=>slabWorkflow({loadTrace:{},flexure}));
});
