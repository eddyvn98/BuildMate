import { MODULE_STATUS } from './standards.js';

export const NATIONAL_PLANNING_BASELINES = Object.freeze([
  {
    id: 'qcvn-01-2021',
    standard: 'QCVN 01:2021/BXD',
    effectiveFrom: '2021-07-05',
    effectiveTo: '2026-12-31',
    locality: 'VN',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    source: 'Ministry of Construction',
    sourceUrl: 'https://www.moc.gov.vn/vn/tin-tuc/1196/95350/thong-tu-ban-hanh-quy-chuan-ky-thuat-quoc-gia-ve-quy-hoach-do-thi-va-nong-thon.aspx',
  },
  {
    id: 'qcvn-01-2026',
    standard: 'QCVN 01:2026/BXD',
    effectiveFrom: '2027-01-01',
    effectiveTo: null,
    locality: 'VN',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    source: 'Ministry of Construction',
    sourceUrl: 'https://moc.gov.vn/',
  },
]);

export function planningBaselineForDate(projectDate) {
  const date = normalizeDate(projectDate);
  const baseline = NATIONAL_PLANNING_BASELINES.find((item) =>
    date >= item.effectiveFrom && (!item.effectiveTo || date <= item.effectiveTo));
  if (!baseline) throw new RangeError(`No planning baseline registered for ${date}`);
  return structuredClone(baseline);
}

export function createPlanningRule(input) {
  if (!input?.id) throw new TypeError('rule id is required');
  if (!input?.source || !input?.sourceUrl) throw new TypeError('rule source and sourceUrl are required');
  if (!input?.effectiveFrom) throw new TypeError('effectiveFrom is required');
  if (!input?.locality) throw new TypeError('locality is required');
  if (!input?.applicability) throw new TypeError('applicability is required');
  if (!input?.field) throw new TypeError('field is required');
  return {
    id: String(input.id),
    field: String(input.field),
    value: input.value ?? null,
    locality: String(input.locality),
    applicability: String(input.applicability),
    effectiveFrom: normalizeDate(input.effectiveFrom),
    effectiveTo: input.effectiveTo ? normalizeDate(input.effectiveTo) : null,
    source: String(input.source),
    sourceUrl: String(input.sourceUrl),
    documentId: input.documentId ? String(input.documentId) : null,
    parcelSpecific: Boolean(input.parcelSpecific),
    confirmed: Boolean(input.confirmed),
    note: input.note ? String(input.note) : '',
  };
}

export function resolvePlanningRules({ projectDate, locality = {}, rules = [] }) {
  const baseline = planningBaselineForDate(projectDate);
  const date = normalizeDate(projectDate);
  const applicable = rules
    .map(createPlanningRule)
    .filter((rule) => applies(rule, date, locality));

  const resolved = {};
  const blocked = [];
  for (const rule of applicable) {
    if (rule.parcelSpecific && !rule.confirmed) {
      blocked.push({
        ruleId: rule.id,
        field: rule.field,
        reason: 'parcel-specific-rule-requires-confirmed-source',
        source: rule.source,
      });
      continue;
    }
    const current = resolved[rule.field];
    if (!current || specificity(rule.locality, locality) >= specificity(current.locality, locality)) {
      resolved[rule.field] = rule;
    }
  }

  return {
    baseline,
    projectDate: date,
    locality: { ...locality },
    resolved,
    blocked,
    constructionReady: blocked.length === 0 && Object.values(resolved).every((rule) => !rule.parcelSpecific || rule.confirmed),
  };
}

function applies(rule, date, locality) {
  if (date < rule.effectiveFrom || (rule.effectiveTo && date > rule.effectiveTo)) return false;
  const target = normalizeLocality(locality);
  const ruleLocality = rule.locality.toLowerCase();
  if (ruleLocality === 'vn') return true;
  return [target.province, target.district, target.ward, target.parcel].filter(Boolean).some((v) => v === ruleLocality);
}

function specificity(ruleLocality, locality) {
  const target = normalizeLocality(locality);
  const value = ruleLocality.toLowerCase();
  if (value === target.parcel) return 4;
  if (value === target.ward) return 3;
  if (value === target.district) return 2;
  if (value === target.province) return 1;
  return 0;
}

function normalizeLocality(locality) {
  return Object.fromEntries(Object.entries(locality).map(([k, v]) => [k, String(v ?? '').trim().toLowerCase()]));
}

function normalizeDate(value) {
  const text = String(value ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new RangeError('projectDate must be YYYY-MM-DD');
  return text;
}
