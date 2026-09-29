import { createEngineeringProfile, assessProfileReadiness } from './profile-gate.js';
import { standardById } from './standards.js';

const DEFINITIONS=[
  ['loads','loads','TCVN 2737:2023','2023','Building load/action design for the applicable project and use'],
  ['rc-design','rc-design','TCVN 5574:2018','2018','Reinforced-concrete member design'],
  ['shallow-foundation','shallow-foundation','TCVN 9362:2012','2012','Shallow foundation checks with project geotechnical inputs'],
  ['pile-foundation','pile-foundation','TCVN 10304:2025','2025','Pile foundation checks with project geotechnical inputs'],
  ['electrical-building','electrical-building','QCVN 12:2014/BXD','2014','Building electrical safety and installation context'],
  ['earthing-pe','earthing-pe','TCVN 7447-5-54:2015','2015','Earthing and protective conductor checks'],
  ['internal-water','internal-water','TCVN 4513:1988','1988','Internal domestic water design context'],
  ['external-drainage','external-drainage','TCVN 7957:2023','2023','Drainage design context'],
];

export const ENGINEERING_PROFILES=Object.freeze(DEFINITIONS.map(([id,standardId,standard,version,applicability])=>{
  const registry=standardById(standardId);
  return createEngineeringProfile({
    id, standard, version, applicability,
    sourceUrl:registry?.sourceUrl ?? '',
    status:registry?.status ?? 'reference-confirmed',
    clauseMap:[], referenceCases:[], independentReviews:[],
  });
}));

export function engineeringProfileStatus() {
  return ENGINEERING_PROFILES.map((profile)=>({
    id:profile.id,
    standard:profile.standard,
    status:profile.status,
    ...assessProfileReadiness(profile),
  }));
}
