const NUMBER = '(\\d+(?:[.,]\\d+)?)';

export function interpretHomeownerText(text) {
  const source=String(text??'').trim();
  const normalized = source.toLowerCase();
  const updates = [];
  const notes = [];

  const size = normalized.match(new RegExp(`${NUMBER}\\s*[x×*]\\s*${NUMBER}`));
  if (size) {
    updates.push({ path: 'land.widthM', value: parseNumber(size[1]) });
    updates.push({ path: 'land.lengthM', value: parseNumber(size[2]) });
  }

  const budget = normalized.match(new RegExp(`${NUMBER}\\s*(tỷ|ty)`));
  if (budget) updates.push({ path: 'budget.totalVnd', value: Math.round(parseNumber(budget[1]) * 1_000_000_000) });

  const people = normalized.match(new RegExp(`${NUMBER}\\s*(người|nguoi)`));
  if (people) updates.push({ path: 'household.people', value: parseNumber(people[1]) });

  const bedrooms = normalized.match(new RegExp(`${NUMBER}\\s*(phòng ngủ|phong ngu)`));
  if (bedrooms) updates.push({ path: 'household.bedrooms', value: parseNumber(bedrooms[1]) });

  const storeys = normalized.match(new RegExp(`${NUMBER}\\s*(tầng|tang)`));
  if (storeys) updates.push({ path: 'design.storeys', value: parseNumber(storeys[1]) });

  const province=extractProvince(source);
  if (province) updates.push({ path:'location.province', value:province });

  if (/ô tô|oto|xe hơi|xe hoi/.test(normalized)) updates.push({ path: 'household.hasCar', value: true });
  if (/người già|nguoi gia|ông bà|ong ba/.test(normalized)) updates.push({ path: 'household.hasElderly', value: true });

  if (updates.length === 0) notes.push('Tôi chưa trích được trường dữ liệu chắc chắn. Hãy bổ sung kích thước đất, tỉnh/thành, số tầng, số người hoặc ngân sách.');
  return { updates, notes };
}

export function nextQuestion(project) {
  const checks = [
    ['location.province', 'Nhà dự kiến xây ở tỉnh/thành nào?'],
    ['land.widthM', 'Bạn biết chiều rộng khu đất khoảng bao nhiêu mét?'],
    ['land.lengthM', 'Chiều dài khu đất khoảng bao nhiêu mét?'],
    ['budget.totalVnd', 'Ngân sách tổng dự kiến của bạn khoảng bao nhiêu?'],
    ['household.people', 'Có bao nhiêu người sẽ ở thường xuyên?'],
  ];
  for (const [path, question] of checks) {
    const value = path.split('.').reduce((acc, key) => acc?.[key], project)?.value;
    if (value === null || value === undefined || value === '') return question;
  }
  return 'Thông tin cơ bản đã đủ để chạy phương án sơ bộ. Bạn có thể xem ước tính chi phí hoặc tinh chỉnh thêm thông tin.';
}

function extractProvince(text) {
  const normalized=normalizeVietnamese(text);
  const aliases=[
    [/(?:^|\\s)(?:tp\\.?\\s*hcm|tphcm|hcm|ho chi minh|sai gon)(?:$|[\\s,.;])/,'TP.HCM'],
    [/(?:^|\\s)(?:ha noi|hn)(?:$|[\\s,.;])/,'Hà Nội'],
  ];
  for (const [pattern,label] of aliases) if (pattern.test(normalized)) return label;

  const match=String(text).match(/(?:^|[\\s,;])(?:ở|tại|o|tai)\\s+([^,;]+)/i);
  if (!match) return null;
  const candidate=match[1]
    .replace(/\\b\\d+(?:[.,]\\d+)?\\s*(?:người|nguoi|tầng|tang|phòng ngủ|phong ngu).*$/i,'')
    .trim()
    .replace(/\\s+/g,' ');
  return candidate||null;
}

function normalizeVietnamese(value) {
  return String(value??'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
}


function parseNumber(value) {
  return Number(String(value).replace(',','.'));
}
