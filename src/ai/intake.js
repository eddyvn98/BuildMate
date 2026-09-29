const NUMBER = '(\\d+(?:[.,]\\d+)?)';

export function interpretHomeownerText(text) {
  const normalized = text.toLowerCase().replace(',', '.');
  const updates = [];
  const notes = [];

  const size = normalized.match(new RegExp(`${NUMBER}\\s*[x×*]\\s*${NUMBER}`));
  if (size) {
    updates.push({ path: 'land.widthM', value: Number(size[1]) });
    updates.push({ path: 'land.lengthM', value: Number(size[2]) });
  }

  const budget = normalized.match(new RegExp(`${NUMBER}\\s*(tỷ|ty)`));
  if (budget) updates.push({ path: 'budget.totalVnd', value: Math.round(Number(budget[1]) * 1_000_000_000) });

  const people = normalized.match(new RegExp(`${NUMBER}\\s*(người|nguoi)`));
  if (people) updates.push({ path: 'household.people', value: Number(people[1]) });

  const bedrooms = normalized.match(new RegExp(`${NUMBER}\\s*(phòng ngủ|phong ngu)`));
  if (bedrooms) updates.push({ path: 'household.bedrooms', value: Number(bedrooms[1]) });

  if (/ô tô|oto|xe hơi|xe hoi/.test(normalized)) updates.push({ path: 'household.hasCar', value: true });
  if (/người già|nguoi gia|ông bà|ong ba/.test(normalized)) updates.push({ path: 'household.hasElderly', value: true });

  if (updates.length === 0) notes.push('Tôi chưa trích được trường dữ liệu chắc chắn. Hãy bổ sung kích thước đất, tỉnh/thành, số người hoặc ngân sách.');
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
  return 'Thông tin cơ bản đã đủ để chạy phương án sơ bộ. Bạn có thể tinh chỉnh số tầng, mức hoàn thiện và các giả định.';
}
