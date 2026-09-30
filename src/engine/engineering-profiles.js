import { conformanceForIssue } from './standards/conformance.js';
import { townhouseCoreScope } from './townhouse-scope.js';
import { createEngineeringProfile, assessProfileReadiness } from './profile-gate.js';
import { standardById } from './standards.js';
import { STANDARD_CLAUSE_COVERAGE } from './standards/coverage.js';

const DEFINITIONS=[
  ['loads','loads','TCVN 2737:2023','2023','Building load/action design for the applicable project and use',4],
  ['rc-design','rc-design','TCVN 5574:2018','2018','Reinforced-concrete member design',5],
  ['shallow-foundation','shallow-foundation','TCVN 9362:2012','2012','Shallow foundation checks with project geotechnical inputs',6],
  ['pile-foundation','pile-foundation','TCVN 10304:2025','2025','Pile foundation checks with project geotechnical inputs',6],
  ['electrical-building','electrical-building','QCVN 12:2014/BXD + TCVN 9206:2012 + TCVN 7447 series','2010-2015','Building electrical sizing, fault protection and installation context',7],
  ['earthing-pe','earthing-pe','TCVN 7447-5-54:2015','2015','Earthing and protective conductor checks',7],
  ['internal-water','internal-water','TCVN 4513:1988','1988','Internal domestic water design context',8],
  ['external-drainage','external-drainage','TCVN 7957:2023','2023','Drainage design context',8],
];



function evidenceForIssue(issue) {
  const coverage=STANDARD_CLAUSE_COVERAGE.find((item)=>item.issue===issue);
  return {
    clauseMap:(coverage?.implemented ?? []).map((entry,index)=>({
      clause:entry,
      formulaId:`coverage-${issue}-${index+1}`,
      units:'see implementation result',
    })),
    referenceCases:conformanceForIssue(issue).flatMap((group)=>group.testFiles.map((file)=>({id:file,expected:'assertions in automated Node test suite',conformanceGroup:group.id}))),
    pendingGaps:coverage?.pending ?? [],
    externalRequirements:coverage?.externalRequirements ?? [],
  };
}

export const ENGINEERING_PROFILES=Object.freeze(DEFINITIONS.map(([id,standardId,standard,version,applicability,issue])=>{
  const registry=standardById(standardId);
  const evidence=evidenceForIssue(issue);
  return createEngineeringProfile({
    id, standard, version, applicability,
    sourceUrl:registry?.sourceUrl ?? officialSourceFallback(issue),
    status:evidence.clauseMap.length ? 'formula-implemented' : (registry?.status ?? 'reference-confirmed'),
    clauseMap:evidence.clauseMap,
    referenceCases:evidence.referenceCases,
    pendingGaps:evidence.pendingGaps,
    independentReviews:[],
  });
}));

export function engineeringProfileStatus() {
  return ENGINEERING_PROFILES.map((profile)=>({
    id:profile.id,
    standard:profile.standard,
    status:profile.status,
    implementedClauseCount:profile.clauseMap.length,
    referenceCaseCount:profile.referenceCases.length,
    pendingGaps:structuredClone(profile.pendingGaps),
    externalRequirements:structuredClone(profile.externalRequirements ?? []),
    townhouseCore:townhouseCoreScope(issueForProfile(profile.id)),
    softwareReadyForIndependentReview:Boolean(profile.clauseMap.length && profile.referenceCases.length),
    ...assessProfileReadiness(profile),
  }));
}

function officialSourceFallback(issue) {
  return {
    4:'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023',
    5:'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018',
    6:'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012',
    7:'https://tieuchuan.vsqi.gov.vn/quychuan/view?sohieu=QCVN+12%3A2014%2FBXD',
    8:'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988',
  }[issue] ?? '';
}


function issueForProfile(id) {
  return {
    loads:4,
    'rc-design':5,
    'shallow-foundation':6,
    'pile-foundation':6,
    'electrical-building':7,
    'earthing-pe':7,
    'internal-water':8,
    'external-drainage':8,
  }[id] ?? null;
}
