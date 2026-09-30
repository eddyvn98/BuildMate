import { auditEngineeringEvidence } from '../evidence-audit.js';
import { assessEngineeringEvidence,engineeringEvidenceDigest } from '../engineering-evidence.js';
import { permanentLayerAreaLoad,standardWindPressure } from '../standards/tcvn2737.js';
import { flexibleStructureGustFactor } from '../standards/tcvn2737-dynamic.js';
import { beamWorkflow,slabWorkflow,columnWorkflow } from './rc-workflows.js';
import { flangedFlexuralCapacity } from '../standards/tcvn5574-sections.js';
import { checkInclinedShear } from '../standards/tcvn5574-shear.js';
import { layerSummationSettlement } from '../standards/tcvn9362.js';
import { drivenPressedSptPoint,drivenCptPoint } from '../standards/tcvn10304-field-tests.js';
import { longFrictionPileSettlement } from '../standards/tcvn10304-single-settlement.js';
import { shortPileSettlement } from '../standards/tcvn10304-short-settlement.js';
import { pileGroupSettlementAtPile } from '../standards/tcvn10304-settlement.js';
import { chooseMinimumXlpeSection } from '../standards/tcvn7447-5-52-xlpe.js';
import { quickMeasuredTnLoopCheck } from '../standards/tcvn7447-6.js';
import { protectiveConductorAdiabaticArea } from '../standards/tcvn7447-5-54.js';
import { housingDesignFlow } from '../standards/tcvn4513.js';
import { checkGuaranteedPumpPoint,checkPumpNpshAcceptance } from '../standards/tcvn9222-pump.js';
import {
  residentialComfortCondition,outdoorDesignClass,residentialOutdoorAir,
  mechanicalVentilationByAch,airflowBySensibleHeat,componentCoolingLoad,selectCoolingEquipment,energyEfficiencyRegulation
} from './hvac.js';

const ACTIONS=Object.freeze({
  'loads.permanent':def(4,'TCVN 2737:2023 7.1-7.2',[],input=>permanentLayerAreaLoad(input)),
  'loads.wind-rigid':def(4,'TCVN 2737:2023 Eq.(10) + QCVN 02:2022/BXD',[],input=>standardWindPressure(input)),
  'loads.wind-flexible':def(4,'TCVN 2737:2023 Eq.(10), Eq.(13)-(24)',[],input=>{
    const gust=flexibleStructureGustFactor(input.gust);
    const coefficientSources={...(input.wind?.coefficientSources ?? {}),gustFactor:gust.reference?.sourceUrl ?? 'TCVN 2737:2023 10.2.7.3'};
    const pressure=standardWindPressure({...input.wind,gustFactor:gust.value,coefficientSources});
    return {gustFactor:gust,pressure,level:'engineering-review'};
  }),
  'rc.beam':def(5,'TCVN 5574:2018 beam ULS/SLS workflow',[],input=>beamWorkflow(input)),
  'rc.slab':def(5,'TCVN 5574:2018 slab ULS/SLS workflow',[],input=>slabWorkflow(input)),
  'rc.column':def(5,'TCVN 5574:2018 column eccentric-compression workflow',[],input=>columnWorkflow(input)),
  'rc.flanged-flexure':def(5,'TCVN 5574:2018 Eq.(36)-(38)',[],input=>flangedFlexuralCapacity(input)),
  'rc.inclined-shear':def(5,'TCVN 5574:2018 Eq.(89)-(96)',[],input=>checkInclinedShear(input)),
  'foundation.shallow-settlement':def(6,'TCVN 9362:2012 Appendix C C.1.6',[],input=>layerSummationSettlement(input)),
  'foundation.pile-spt-capacity':def(6,'TCVN 10304:2025 Appendix D',['borehole-log','laboratory-soil-tests','SPT'],input=>drivenPressedSptPoint(input)),
  'foundation.pile-cpt-capacity':def(6,'TCVN 10304:2025 7.3.4.2',['borehole-log','laboratory-soil-tests','CPT'],input=>drivenCptPoint(input)),
  'foundation.pile-long-settlement':def(6,'TCVN 10304:2025 Eq.(30)-(33)',['borehole-log','laboratory-soil-tests'],input=>longFrictionPileSettlement(input)),
  'foundation.pile-short-settlement':def(6,'TCVN 10304:2025 Eq.(34)',['borehole-log','laboratory-soil-tests'],input=>shortPileSettlement(input)),
  'foundation.pile-group-settlement':def(6,'TCVN 10304:2025 Eq.(36)-(38)',['borehole-log','laboratory-soil-tests'],input=>pileGroupSettlementAtPile(input)),
  'electrical.xlpe-cable':def(7,'TCVN 7447-5-52:2010 B.52.3/B.52.5',[],input=>chooseMinimumXlpeSection(input)),
  'electrical.tn-loop-measured':def(7,'TCVN 7447-6:2011 C.61.3.6.2',['commissioning-loop-test','protective-device-curve'],input=>quickMeasuredTnLoopCheck(input)),
  'electrical.pe-adiabatic':def(7,'TCVN 7447-5-54:2015 543.1.2',[],input=>protectiveConductorAdiabaticArea(input)),
  'water.design-flow':def(8,'TCVN 4513:1988 Eq.(2)',[],input=>housingDesignFlow(input)),
  'water.pump-acceptance':def(8,'TCVN 9222:2012 Table 10',['pump-test-report'],input=>checkGuaranteedPumpPoint(input)),
  'water.pump-npsh':def(8,'TCVN 9222:2012 6.4.3/11',['pump-test-report'],input=>checkPumpNpshAcceptance(input)),
  'hvac.energy-regulation':def(12,'QCVN 09:2017/BXD -> QCVN 04-3:2026/BXD applicability/transition',[],input=>energyEfficiencyRegulation(input)),
  'hvac.comfort':def(12,'TCVN 5687:2024 5.1.1 + Appendix A.1',[],input=>residentialComfortCondition(input)),
  'hvac.outdoor-design':def(12,'TCVN 5687:2024 5.2.2 + Appendix B',['hvac-outdoor-design-condition'],input=>outdoorDesignClass(input)),
  'hvac.outdoor-air':def(12,'TCVN 5687:2024 6.1.5 + Appendix E/G',[],input=>residentialOutdoorAir(input)),
  'hvac.ach':def(12,'TCVN 5687:2024 6.1.6 + Appendix F/G',[],input=>mechanicalVentilationByAch(input)),
  'hvac.airflow-sensible':def(12,'TCVN 5687:2024 Appendix G Eq.(G.1)',[],input=>airflowBySensibleHeat(input)),
  'hvac.cooling-load':def(12,'TCVN 5687:2024 5.1, 5.2, 6.1.7 source-backed component load',[],input=>componentCoolingLoad(input)),
  'hvac.equipment-selection':def(12,'TCVN 5687:2024 source-backed equipment acceptance',['hvac-equipment-performance'],input=>selectCoolingEquipment(input)),
});

export function standardCalculatorCapabilities() {
  return Object.entries(ACTIONS).map(([id,x])=>({
    id,issue:x.issue,standard:x.standard,requiredEvidenceTypes:[...x.requiredEvidenceTypes]
  }));
}

export function runStandardCalculation(project,{action,input={}}={}) {
  const selected=ACTIONS[action];
  if (!selected) throw new RangeError('unknown standard calculation action: '+action);
  const required=selected.requiredEvidenceTypes;
  const evidence=assessEngineeringEvidence(project?.engineeringEvidence ?? [],selected.issue,{requiredTypes:required});
  if (required.length&&!evidence.ready) {
    return {status:'blocked',action,issue:selected.issue,standard:selected.standard,reason:'required-project-evidence-missing-or-invalid',evidence};
  }
  const result=selected.run(structuredClone(input));
  return {
    status:'ready',action,issue:selected.issue,standard:selected.standard,
    projectEvidenceDigest:engineeringEvidenceDigest(project?.engineeringEvidence ?? [],selected.issue),
    result,evidenceAudit:auditEngineeringEvidence(result),
  };
}

function def(issue,standard,requiredEvidenceTypes,run) {
  return {issue,standard,requiredEvidenceTypes,run};
}
