export const FIELD_STATES = Object.freeze({
  CONFIRMED: 'confirmed',
  SUGGESTED: 'suggested',
  ASSUMED: 'assumed',
  MISSING: 'missing',
  BLOCKED: 'blocked',
});

export function field(value, state = FIELD_STATES.MISSING, source = 'user', note = '') {
  return { value, state, source, note };
}

export function createProject(overrides = {}) {
  const now = new Date().toISOString();
  const base = {
    id: crypto.randomUUID(),
    name: 'Nhà mới',
    context: {
      projectDate: field(now.slice(0, 10), FIELD_STATES.SUGGESTED, 'buildmate', 'Ngày cơ sở để chọn phiên bản quy chuẩn; xác nhận trước khi dùng hồ sơ pháp lý.'),
    },
    location: {
      province: field('', FIELD_STATES.MISSING),
      district: field('', FIELD_STATES.MISSING),
      ward: field('', FIELD_STATES.MISSING),
      parcel: field('', FIELD_STATES.MISSING),
    },
    land: {
      widthM: field(null, FIELD_STATES.MISSING),
      lengthM: field(null, FIELD_STATES.MISSING),
      roadWidthM: field(null, FIELD_STATES.MISSING),
    },
    household: {
      people: field(4, FIELD_STATES.ASSUMED, 'buildmate', 'Giả định khởi đầu'),
      bedrooms: field(3, FIELD_STATES.ASSUMED, 'buildmate', 'Giả định khởi đầu'),
      hasElderly: field(false, FIELD_STATES.MISSING),
      hasCar: field(false, FIELD_STATES.MISSING),
    },
    design: {
      storeys: field(3, FIELD_STATES.SUGGESTED, 'buildmate', 'Có thể thay đổi sau khi làm rõ nhu cầu'),
      footprintRatio: field(0.85, FIELD_STATES.SUGGESTED, 'buildmate'),
      finishLevel: field('balanced', FIELD_STATES.SUGGESTED, 'buildmate'),
    },
    budget: {
      totalVnd: field(null, FIELD_STATES.MISSING),
      includesInterior: field(true, FIELD_STATES.SUGGESTED, 'buildmate'),
    },
    technical: {
      geotechnicalAvailable: field(false, FIELD_STATES.MISSING),
      planningInfoVerified: field(false, FIELD_STATES.MISSING),
    },
    engineering: {
      deadLoadKnM2: field(null, FIELD_STATES.MISSING, 'user', 'Phải lấy từ cấu tạo/vật liệu có nguồn; BuildMate không dùng placeholder kỹ thuật.'),
      deadLoadSource: field('', FIELD_STATES.MISSING),
      liveLoadClass: field('A1-floor', FIELD_STATES.SUGGESTED, 'TCVN 2737:2023 8.3.1 Table 4', 'Nhà ở thông thường; phải đổi theo đúng công năng khu vực.'),
      allowableBearingKpa: field(null, FIELD_STATES.BLOCKED, 'user', 'Cần cơ sở địa kỹ thuật và điều khoản tính áp lực nền áp dụng.'),
      allowableBearingSource: field('', FIELD_STATES.MISSING),
      pileWorkingCapacityKn: field(null, FIELD_STATES.MISSING, 'user', 'Cần sức chịu tải thiết kế từ TCVN 10304/hồ sơ địa kỹ thuật/thử tải.'),
      pileCapacitySource: field('', FIELD_STATES.MISSING),
    },
    mep: {
      connectedPowerW: field(null, FIELD_STATES.MISSING),
      demandFactor: field(null, FIELD_STATES.MISSING, 'user', 'Chọn theo schedule tải và TCVN 9206 phù hợp.'),
      demandFactorSource: field('', FIELD_STATES.MISSING),
      voltageV: field(220, FIELD_STATES.SUGGESTED, 'project-system', 'Xác nhận điện áp hệ thống dự án.'),
      phase: field('single', FIELD_STATES.SUGGESTED, 'project-system'),
      powerFactor: field(null, FIELD_STATES.MISSING, 'user', 'Nhà ở: TCVN 9206:2012 mục 5.8 nêu khoảng 0,80-0,85; phải chọn và lưu cơ sở.'),
      fixtureEquivalentUnits: field(null, FIELD_STATES.MISSING, 'user', 'Tổng đương lượng thiết bị vệ sinh theo TCVN 4513.'),
      waterLitersPerPersonDay: field(null, FIELD_STATES.MISSING, 'user', 'Chọn giá trị thuộc Bảng 9 TCVN 4513:1988 theo cơ sở dự án.'),
      conditionedAreaRatio: field(null, FIELD_STATES.MISSING),
      coolingWPerM2: field(null, FIELD_STATES.BLOCKED, 'buildmate', 'Không dùng suất lạnh placeholder cho thiết kế kỹ thuật.'),
    },
    pricing: {
      sourceLabel: field('', FIELD_STATES.MISSING),
      effectiveDate: field('', FIELD_STATES.MISSING),
      items: {
        concrete: field(null, FIELD_STATES.MISSING),
        rebar: field(null, FIELD_STATES.MISSING),
        masonry: field(null, FIELD_STATES.MISSING),
        plaster: field(null, FIELD_STATES.MISSING),
        paint: field(null, FIELD_STATES.MISSING),
        electrical: field(null, FIELD_STATES.MISSING),
        plumbing: field(null, FIELD_STATES.MISSING),
      },
    },
    planningRules: [],
    alternatives: [],
    designVersions: [],
    actuals: { entries: [] },
    engineeringReviews: [],
    createdAt: now,
    updatedAt: now,
  };
  return deepMerge(base, overrides);
}

export function hydrateProject(raw) {
  if (!raw) return createProject();
  return createProject(raw);
}

export function setField(project, path, value, state = FIELD_STATES.CONFIRMED, source = 'user') {
  const clone = structuredClone(project);
  const parts = path.split('.');
  let cursor = clone;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cursor[parts[i]] ??= {};
    cursor = cursor[parts[i]];
  }
  const key = parts.at(-1);
  cursor[key] = { ...(cursor[key] ?? {}), value, state, source };
  clone.updatedAt = new Date().toISOString();
  return clone;
}

export function renameProject(project, name) {
  return { ...project, name: name.trim() || 'Nhà mới', updatedAt: new Date().toISOString() };
}

export function readValue(project, path, fallback = null) {
  const result = path.split('.').reduce((acc, key) => acc?.[key], project);
  return result?.value ?? fallback;
}

function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return incoming ?? base;
  const output = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      output[key] = deepMerge(base[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}
