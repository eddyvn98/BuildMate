import test from 'node:test';
import assert from 'node:assert/strict';
import {
  residentialComfortCondition,outdoorDesignClass,residentialOutdoorAir,
  mechanicalVentilationByAch,airflowBySensibleHeat,componentCoolingLoad,selectCoolingEquipment
} from '../src/engine/engineering/hvac.js';

test('TCVN 5687 residential comfort registry exposes Appendix A hot-season values',()=>{
  const r=residentialComfortCondition({spaceType:'living',season:'hot'});
  assert.equal(r.comfortC,26.2);
  assert.deepEqual(r.allowedC,[25,27]);
  assert.equal(r.airSpeedMaxMps,0.3);
});

test('TCVN 5687 design class keeps sourced outdoor conditions and class reliability',()=>{
  const r=outdoorDesignClass({classId:'II',dryBulbC:35,wetBulbC:28,source:'Appendix B project row'});
  assert.deepEqual(r.hoursNotAssured,[150,200]);
  assert.deepEqual(r.assuranceProbability,[0.977,0.983]);
  assert.equal(r.dryBulbC,35);
});

test('Appendix E residential outdoor air uses person rate without hidden assumptions',()=>{
  const r=residentialOutdoorAir({spaceType:'bedroom',people:2,areaM2:18});
  assert.equal(r.value,70);
  assert.equal(r.formulaId,'TCVN5687-G7-N*IN');
});

test('Appendix F and G ACH workflow is deterministic',()=>{
  const bedroom=mechanicalVentilationByAch({spaceType:'bedroom',areaM2:20,heightM:3,ach:2.5});
  assert.equal(bedroom.value,150);
  const bath=mechanicalVentilationByAch({spaceType:'bathroom',areaM2:5,heightM:2.8});
  assert.equal(bath.value,140);
  assert.throws(()=>mechanicalVentilationByAch({spaceType:'garage',areaM2:20,heightM:3}));
});

test('Appendix G sensible heat airflow implements Eq G.1',()=>{
  const r=airflowBySensibleHeat({
    sensibleExcessHeatW:1000,localExhaustM3h:0,
    localExhaustTempC:26,supplyTempC:18,roomExhaustTempC:26,
  });
  assert.equal(r.value,375);
});

test('cooling load is component based and each component must be sourced',()=>{
  const r=componentCoolingLoad({components:[
    {category:'envelope',watts:2000,source:'envelope calc',methodRef:'worksheet E1'},
    {category:'ventilation',watts:500,source:'airflow calc',methodRef:'worksheet V1'},
  ]});
  assert.equal(r.value,2.5);
  assert.throws(()=>componentCoolingLoad({components:[{category:'x',watts:100}]}));
});

test('equipment selection uses explicit rated capacity and conditions',()=>{
  const r=selectCoolingEquipment({designLoadKw:3.1,equipment:[
    {id:'a',ratedCapacityKw:2.8,source:'sheet A',ratedConditions:'rated condition A'},
    {id:'b',ratedCapacityKw:3.5,source:'sheet B',ratedConditions:'rated condition B'},
  ]});
  assert.equal(r.pass,true);
  assert.equal(r.selected.id,'b');
});
