export const MODULE_STATUS = Object.freeze({
  PLANNING_ONLY: 'planning-only',
  REFERENCE_CONFIRMED: 'reference-confirmed',
  FORMULA_IMPLEMENTED: 'formula-implemented',
  REVIEWED: 'reviewed',
  VERIFIED: 'verified',
});

export const STANDARD_MODULES = Object.freeze([
  {
    id: 'planning-local',
    domain: 'planning',
    standard: 'QCVN 01:2021/BXD',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    activeFrom: '2021-07-05',
    activeTo: '2026-12-31',
    successor: 'QCVN 01:2026/BXD (effective 2027-01-01)',
    sourceUrl: 'https://www.moc.gov.vn/vn/tin-tuc/1196/95350/thong-tu-ban-hanh-quy-chuan-ky-thuat-quoc-gia-ve-quy-hoach-do-thi-va-nong-thon.aspx',
    note: 'Local approved planning documents and construction-permit rules still govern the specific parcel.',
  },
  {
    id: 'natural-data',
    domain: 'site',
    standard: 'QCVN 02:2022/BXD',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    activeFrom: '2022-09-26',
    sourceUrl: 'https://moc.gov.vn/vn/Pages/chitiettin.aspx?ChuyenmucID=1268&IDNews=86372',
    note: 'A 2026 amendment was still in draft/review during the V2 implementation date.',
  },
  {
    id: 'fire-safety',
    domain: 'fire',
    standard: 'QCVN 06:2022/BXD + Sửa đổi 1:2023',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://moc.gov.vn/Images/editor/files/Quy%20Chu%E1%BA%A9n/QCVN%2006-2022.pdf',
  },
  {
    id: 'loads',
    domain: 'structure',
    standard: 'TCVN 2737:2023',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023',
  },
  {
    id: 'rc-design',
    domain: 'structure',
    standard: 'TCVN 5574:2018',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018',
    note: 'TCVN 2737:2023 replaces the referenced loading provisions identified by VSQI.',
  },
  {
    id: 'shallow-foundation',
    domain: 'geotechnical',
    standard: 'TCVN 9362:2012',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012',
  },
  {
    id: 'pile-foundation',
    domain: 'geotechnical',
    standard: 'TCVN 10304:2025',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+10304%3A2025',
    replaces: 'TCVN 10304:2014',
  },
  {
    id: 'electrical-building',
    domain: 'mep',
    standard: 'QCVN 12:2014/BXD',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/quychuan/view?sohieu=QCVN+12%3A2014%2FBXD',
  },
  {
    id: 'electrical-equipment',
    domain: 'mep',
    standard: 'TCVN 9206:2012',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9206%3A2012',
  },
  {
    id: 'earthing-pe',
    domain: 'mep',
    standard: 'TCVN 7447-5-54:2015',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-54%3A2015',
  },
  {
    id: 'internal-water',
    domain: 'mep',
    standard: 'TCVN 4513:1988',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988',
  },
  {
    id: 'external-drainage',
    domain: 'mep',
    standard: 'TCVN 7957:2023',
    status: MODULE_STATUS.REFERENCE_CONFIRMED,
    sourceUrl: 'https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7957%3A2023',
  },
]);

export function canIssueConstructionReady(moduleId) {
  return STANDARD_MODULES.find((item) => item.id === moduleId)?.status === MODULE_STATUS.VERIFIED;
}

export function standardById(moduleId) {
  return STANDARD_MODULES.find((item) => item.id === moduleId) ?? null;
}

export function applicableStandards(dateIso = new Date().toISOString().slice(0, 10)) {
  return STANDARD_MODULES.filter((item) => {
    if (item.activeFrom && dateIso < item.activeFrom) return false;
    if (item.activeTo && dateIso > item.activeTo) return false;
    return true;
  });
}
