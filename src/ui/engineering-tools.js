export const ENGINEERING_EVIDENCE_TYPES=Object.freeze([
  ['qcvn02-locality','QCVN 02 - dữ liệu địa phương/vùng gió'],
  ['specialist-wind','Gió chuyên sâu / wind tunnel'],
  ['fire-calculation-test','Tính/thử nghiệm chịu lửa'],
  ['borehole-log','Nhật ký khoan'],
  ['laboratory-soil-tests','Thí nghiệm đất phòng'],
  ['SPT','SPT'],
  ['CPT','CPT'],
  ['static-pile-test','Thử tải tĩnh cọc'],
  ['protective-device-curve','Đường đặc tính CB/RCD'],
  ['commissioning-loop-test','Đo vòng sự cố hiện trường'],
  ['pump-test-report','Biên bản thử bơm'],
  ['hvac-outdoor-design-condition','HVAC - điều kiện thiết kế ngoài trời'],
  ['hvac-equipment-performance','HVAC - dữ liệu hiệu suất thiết bị'],
]);

const EXAMPLES=Object.freeze({
  'loads.permanent':{layers:[
    {name:'RC slab',thicknessM:0.12,unitWeightKnM3:25,materialClass:'reinforcedConcrete',source:'Bản vẽ/cấu tạo + hồ sơ vật liệu'},
    {name:'finish',thicknessM:0.05,unitWeightKnM3:20,materialClass:'finishSite',source:'Specification hoàn thiện'}
  ]},
  'loads.wind-rigid':{windZone:'II',kZe:1,aerodynamicCoefficient:0.8,gustFactor:0.85,coefficientSources:{kZe:'TCVN 2737 Table 9',aerodynamicCoefficient:'TCVN 2737 Appendix F case',gustFactor:'TCVN 2737 10.2.7.2'}},
  'loads.wind-flexible':{gust:{heightM:120,widthM:30,depthM:20,firstNaturalFrequencyHz:0.25,v3s50Mps:44,terrain:'C',structuralType:'reinforcedConcrete'},wind:{windZone:'II',kZe:1,aerodynamicCoefficient:0.8,coefficientSources:{kZe:'TCVN 2737 Table 9',aerodynamicCoefficient:'TCVN 2737 Appendix F case'}}},
  'rc.beam':{loadTrace:{reference:{standard:'TCVN 2737:2023',clause:'project load combination',sourceUrl:'project://load-case'}},flexure:{designMomentKnM:80,capacity:{bMm:200,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:1000,xiR:0.5,materialSource:'TCVN 5574 material registry'}},shear:{designShearKn:50,bMm:200,h0Mm:450,RbMpa:14.5,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150}},
  'rc.slab':{loadTrace:{reference:{standard:'TCVN 2737:2023',clause:'project load combination',sourceUrl:'project://load-case'}},flexure:{designMomentKnM:30,capacity:{bMm:1000,h0Mm:110,RbMpa:14.5,RsMpa:350,AsMm2:785,xiR:0.5,materialSource:'TCVN 5574 material registry'}}},
  'rc.column':{loadTrace:{reference:{standard:'TCVN 2737:2023',clause:'project load combination',sourceUrl:'project://load-case'}},column:{axialLoadKn:300,firstOrderMomentKnM:20,eta:1.1,bMm:300,hMm:400,h0Mm:360,aPrimeMm:40,RbMpa:14.5,RsMpa:350,RscMpa:350,AsMm2:1200,AsCompressionMm2:1200,xiR:0.5}},
  'rc.flanged-flexure':{webWidthMm:200,compressionFlangeWidthMm:600,compressionFlangeThicknessMm:80,h0Mm:450,RbMpa:14.5,RsMpa:350,AsMm2:2500,xiR:0.5,effectiveFlangeWidthSource:'TCVN 5574 8.1.2.3.4 geometry check'},
  'rc.inclined-shear':{designShearKn:50,bMm:250,h0Mm:450,RbtMpa:1.05,RswMpa:280,AswMm2:100,stirrupSpacingMm:150},
  'foundation.shallow-settlement':{layers:[{averageAdditionalPressureKpa:180,thicknessM:0.5,deformationModulusKpa:15000,pressureSource:'Appendix C stress calculation',modulusSource:'Geotechnical test'}]},
  'foundation.pile-spt-capacity':{toeSoil:'granular',toeN:20,eta:1,toeAreaM2:0.09,perimeterM:1.2,layers:[{soil:'granular',Ns:15,thicknessM:5}]},
  'foundation.pile-cpt-capacity':{toeAreaM2:0.09,perimeterM:1.2,embedmentM:20,qsKpa:5000,beta1Driven:0.5,probeType:'I',fsKpa:50,beta2:0.8},
  'foundation.pile-long-settlement':{loadMN:0.5,G1Mpa:12,G2Mpa:8,nu1:0.3,nu2:0.3,pileLengthM:25,pileDiameterM:0.35,pileElasticModulusMpa:30000,pileAreaM2:0.096},
  'foundation.pile-short-settlement':{loadMN:0.4,G1Mpa:5,G2Mpa:10,poissonRatio:0.3,pileLengthM:10,pileDiameterM:0.8},
  'foundation.pile-group-settlement':{singlePileSettlementMm:5,pileIndex:0,pileLoadsMN:[0.5,0.5],pileCoordinatesM:[[0,0],[1.5,0]],kv:5,G1Mpa:20,G2Mpa:10,pileLengthM:20},
  'electrical.xlpe-cable':{conductor:'copper',designCurrentA:30,method:'B1',loadedConductors:2,correctionFactors:[0.87,0.8]},
  'electrical.tn-loop-measured':{measuredLoopImpedanceOhm:0.5,uoV:230,tripCurrentA:200},
  'electrical.pe-adiabatic':{faultCurrentA:5000,disconnectTimeS:0.2,k:115},
  'water.design-flow':{fixtureEquivalentUnits:20,litersPerPersonDay:150},
  'water.pump-acceptance':{guaranteedFlow:10,guaranteedHeadM:25,guaranteedEfficiencyPercent:70,testedFlow:10.2,testedHeadM:24.8,testedEfficiencyPercent:69,grade:2,testReportSource:'Pump test report'},
  'water.pump-npsh':{npshAvailableM:5,npshRequiredM:3,requiredNpshSource:'Manufacturer test report',operatingFlow:10},
  'hvac.comfort':{spaceType:'living',season:'hot'},
  'hvac.outdoor-design':{classId:'II',dryBulbC:35,wetBulbC:28,source:'TCVN 5687:2024 Appendix B / project climate row'},
  'hvac.outdoor-air':{spaceType:'bedroom',people:2,areaM2:18},
  'hvac.ach':{spaceType:'bedroom',areaM2:18,heightM:3,ach:2.5},
  'hvac.airflow-sensible':{sensibleExcessHeatW:1200,localExhaustM3h:0,localExhaustTempC:26,supplyTempC:18,roomExhaustTempC:26},
  'hvac.cooling-load':{components:[
    {category:'envelope',watts:1800,source:'Project envelope calculation',methodRef:'Envelope heat-gain worksheet'},
    {category:'solar',watts:900,source:'Project glazing/orientation calculation',methodRef:'Solar heat-gain worksheet'},
    {category:'people-lighting-equipment',watts:700,source:'Project room schedule',methodRef:'Internal gain schedule'},
    {category:'ventilation',watts:600,source:'TCVN 5687 airflow result + psychrometric calculation',methodRef:'Ventilation load worksheet'}
  ]},
  'hvac.equipment-selection':{designLoadKw:4,equipment:[
    {id:'AC-01',model:'Demo 4.5 kW',ratedCapacityKw:4.5,source:'Manufacturer performance sheet',ratedConditions:'rated cooling condition stated by manufacturer'}
  ]},
});

export function calculatorExample(action) {
  return structuredClone(EXAMPLES[action] ?? {});
}

export function evidenceDataExample(type) {
  return structuredClone({
    'qcvn02-locality':{zone:'II',sourceRow:'QCVN 02 Table 5.1 locality row'},
    'specialist-wind':{geometryCase:'special geometry',method:'wind tunnel / specialist literature per TCVN 2737'},
    'fire-calculation-test':{requiredFireResistanceMinutes:60,result:'pass'},
    'borehole-log':{depthM:30},
    'laboratory-soil-tests':{tests:['shear','compression']},
    SPT:{measurements:[{depthM:10,N:20}]},
    CPT:{measurements:[{depthM:10,qcMpa:8,fsKpa:60}]},
    'static-pile-test':{loadSettlementPoints:[{loadKn:0,settlementMm:0},{loadKn:500,settlementMm:8}]},
    'protective-device-curve':{points:[{x:100,y:1},{x:200,y:0.2}]},
    'commissioning-loop-test':{loopImpedanceOhm:0.8},
    'pump-test-report':{points:[{flow:8,headM:28,efficiencyPercent:68},{flow:10,headM:25,efficiencyPercent:70}]},
    'hvac-outdoor-design-condition':{classId:'II',location:'TP.HCM',dryBulbC:35,wetBulbC:28},
    'hvac-equipment-performance':{ratedCapacityKw:4.5,ratedConditions:'manufacturer rated cooling condition'},
  }[type] ?? {});
}
