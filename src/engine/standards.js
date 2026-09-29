export const MODULE_STATUS = Object.freeze({
  PLANNING_ONLY: 'planning-only',
  UNVERIFIED: 'unverified',
  REVIEWED: 'reviewed',
  VERIFIED: 'verified',
});

export const STANDARD_MODULES = Object.freeze([
  { id: 'planning-local', domain: 'planning', status: MODULE_STATUS.UNVERIFIED, requiredEvidence: ['local planning source', 'effective date', 'applicability check'] },
  { id: 'loads', domain: 'structure', status: MODULE_STATUS.UNVERIFIED, requiredEvidence: ['standard/version', 'clause mapping', 'reference cases', 'reviewer'] },
  { id: 'rc-design', domain: 'structure', status: MODULE_STATUS.UNVERIFIED, requiredEvidence: ['standard/version', 'formula mapping', 'reference cases', 'reviewer'] },
  { id: 'foundation', domain: 'geotechnical', status: MODULE_STATUS.UNVERIFIED, requiredEvidence: ['soil investigation', 'standard/version', 'reference cases', 'reviewer'] },
  { id: 'electrical', domain: 'mep', status: MODULE_STATUS.UNVERIFIED, requiredEvidence: ['load profile', 'installation assumptions', 'standard/version', 'reviewer'] },
  { id: 'water-drainage', domain: 'mep', status: MODULE_STATUS.UNVERIFIED, requiredEvidence: ['fixture schedule', 'standard/version', 'reference cases', 'reviewer'] },
]);

export function canIssueConstructionReady(moduleId) {
  return STANDARD_MODULES.find((item) => item.id === moduleId)?.status === MODULE_STATUS.VERIFIED;
}
