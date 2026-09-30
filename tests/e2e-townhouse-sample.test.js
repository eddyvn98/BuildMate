import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject,setField } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { runStandardCalculation } from '../src/engine/engineering/standards-calculator.js';
import { createEngineeringCalculationRecord } from '../src/engine/engineering-calculation-record.js';
import { projectAtoZStatus } from '../src/engine/a2z-status.js';

function sampleProject() {
  let p=createProject({id:'sample-hcm-4x16',name:'Smoke test - nha pho HCM 4x16'});
  for (const [path,value] of [
    ['location.province','TP.HCM'],
    ['location.district','Bình Thạnh'],
    ['land.widthM',4],
    ['land.lengthM',16],
    ['design.storeys',3],
    ['design.footprintRatio',0.85],
    ['household.people',5],
    ['household.bedrooms',4],
    ['budget.totalVnd',3000000000],
    ['context.projectDate','2026-09-30'],
  ]) p=setField(p,path,value);
    return p;
}

function calculationRecord(project,action,input) {
  const output=runStandardCalculation(project,{action,input});
  assert.equal(output.status,'ready',action+' should be ready');
  return {
    output,
    record:createEngineeringCalculationRecord({
      id:'sample-'+action,action,issue:output.issue,standard:output.standard,input,output,createdAt:'2026-09-30T00:00:00.000Z',
    }),
  };
}

test('sample HCMC 4x16 townhouse runs end-to-end through all six engineering domains',()=>{
  const p=sampleProject();

  const planningBefore=runPlanningWorkflow(p);
  assert.equal(planningBefore.status,'ready');
  assert.equal(planningBefore.results.areas.landArea.value,64);
  assert.equal(planningBefore.results.areas.footprint.value,54.4);
  assert.equal(planningBefore.results.areas.floorArea.value,163.2);
  assert.equal(planningBefore.results.marketPricing.quickEstimate.status,'ready');
  assert.equal(planningBefore.results.marketPricing.snapshot.turnkeyM2.confidence,'medium');
  assert.equal(planningBefore.results.marketPricing.quickEstimate.centerVnd,1_251_744_000);

  const runs=[
    calculationRecord(p,'loads.permanent',{layers:[
      {name:'RC slab',thicknessM:0.12,unitWeightKnM3:25,materialClass:'reinforcedConcrete',source:'Sample structural build-up'},
      {name:'finish',thicknessM:0.05,unitWeightKnM3:20,materialClass:'finishSite',source:'Sample finish build-up'},
    ]}),
    calculationRecord(p,'rc.beam',{
      loadTrace:{reference:{standard:'TCVN 2737:2023',clause:'sample load combination',sourceUrl:'project://sample-load-case'}},
      flexure:{designMomentKnM:80,capacity:{bMm:200,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'TCVN 5574 material registry'}},
      shear:{designShearKn:50,bMm:200,h0Mm:450,RbMpa:14.5,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150},
    }),
    calculationRecord(p,'foundation.shallow-settlement',{layers:[
      {averageAdditionalPressureKpa:180,thicknessM:0.5,deformationModulusKpa:15000,pressureSource:'Sample geotechnical stress calculation',modulusSource:'Sample geotechnical test'},
      {averageAdditionalPressureKpa:120,thicknessM:0.5,deformationModulusKpa:12000,pressureSource:'Sample geotechnical stress calculation',modulusSource:'Sample geotechnical test'},
    ]}),
    calculationRecord(p,'electrical.xlpe-cable',{conductor:'copper',designCurrentA:30,method:'B1',loadedConductors:2,correctionFactors:[0.87,0.8]}),
    calculationRecord(p,'water.design-flow',{fixtureEquivalentUnits:20,litersPerPersonDay:150}),
    calculationRecord(p,'hvac.outdoor-air',{spaceType:'bedroom',people:2,areaM2:18}),
  ];

  p.engineeringCalculations=runs.map(x=>x.record);

  assert.equal(runs[0].output.result.characteristicKnM2,4);
  assert.equal(runs[0].output.result.designKnM2,4.6);
  assert.equal(runs[1].output.result.moment.pass,true);
  assert.equal(runs[2].output.result.value,8.8);
  assert.equal(runs[3].output.result.sectionMm2,6);
  assert.equal(runs[4].output.result.value,1.963);
  assert.equal(runs[5].output.result.value,70);

  const planningAfter=runPlanningWorkflow(p);
  assert.equal(planningAfter.results.engineering.modules.hvac.status,'standards-backed');

  const a2z=projectAtoZStatus(p);
  assert.equal(a2z.ready,true);
  assert.equal(a2z.progressPercent,100);

  console.log('SAMPLE_A2Z_RESULT '+JSON.stringify({
    project:{province:'TP.HCM',district:'Bình Thạnh',land:'4x16 m',storeys:3,people:5,targetBudgetVnd:3000000000},
    planning:{
      landAreaM2:planningAfter.results.areas.landArea.value,
      footprintM2:planningAfter.results.areas.footprint.value,
      floorAreaM2:planningAfter.results.areas.floorArea.value,
      preferredScenario:planningAfter.results.preferredScenario,
      preferredBudgetVnd:planningAfter.results.budgets.find(x=>x.key===planningAfter.results.preferredScenario)?.total,
      quickMarketEstimateVnd:planningAfter.results.marketPricing.quickEstimate.centerVnd,
      marketSnapshotRefreshedAt:planningAfter.results.marketPricing.snapshot.refreshedAt,
      quickMarketRangeVnd:[planningAfter.results.marketPricing.quickEstimate.lowVnd,planningAfter.results.marketPricing.quickEstimate.highVnd],
      marketConfidence:planningAfter.results.marketPricing.quickEstimate.confidence,
    },
    calculations:{
      permanentLoadDesignKnM2:runs[0].output.result.designKnM2,
      rcBeamMomentPass:runs[1].output.result.moment.pass,
      shallowSettlementMm:runs[2].output.result.value,
      electricalCableMm2:runs[3].output.result.sectionMm2,
      waterDesignFlowLs:runs[4].output.result.value,
      bedroomOutdoorAirM3h:runs[5].output.result.value,
    },
    a2z:{ready:a2z.ready,progressPercent:a2z.progressPercent,stages:a2z.stages.map(x=>({id:x.id,status:x.status}))},
  }));
});
