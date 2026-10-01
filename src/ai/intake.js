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
  const original=String(text??'');
  const normalized=normalizeVietnamese(original);
  const padded=' '+normalized.replaceAll(',',' ').replaceAll(';',' ').replaceAll(':',' ')+' ';

  if (
    padded.includes(' tp.hcm ')||padded.includes(' tp hcm ')||padded.includes(' tphcm ')||
    padded.includes(' hcm ')||padded.includes(' ho chi minh ')||padded.includes(' sai gon ')
  ) return 'TP.HCM';
  if (padded.includes(' ha noi ')||padded.includes(' hn ')) return 'Hà Nội';

  const markers=[' o ',' tai '];
  for (const marker of markers) {
    const index=normalized.indexOf(marker);
    if (index<0) continue;
    let candidate=original.slice(index+marker.length).trim();
    const cuts=[candidate.indexOf(','),candidate.indexOf(';')].filter(value=>value>=0);
    if (cuts.length) candidate=candidate.slice(0,Math.min(...cuts));
    return candidate.trim()||null;
  }
  if (normalized.startsWith('o ')||normalized.startsWith('tai ')) {
    const offset=normalized.startsWith('o ')?2:4;
    let candidate=original.slice(offset).trim();
    const cuts=[candidate.indexOf(','),candidate.indexOf(';')].filter(value=>value>=0);
    if (cuts.length) candidate=candidate.slice(0,Math.min(...cuts));
    return candidate.trim()||null;
  }
  return null;
}

function normalizeVietnamese(value) {
  return [...String(value??'').normalize('NFD')]
    .filter(char=>{
      const code=char.codePointAt(0);
      return !(code>=0x0300&&code<=0x036f);
    })
    .join('')
    .replaceAll('đ','d')
    .replaceAll('Đ','D')
    .toLowerCase();
}


function parseNumber(value) {
  return Number(String(value).replace(',','.'));
}
