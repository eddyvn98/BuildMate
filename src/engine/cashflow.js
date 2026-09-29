const STAGES = Object.freeze([
  ['Chuẩn bị & nền móng', 0.16],
  ['Khung kết cấu', 0.29],
  ['Xây tô & chống thấm', 0.14],
  ['MEP âm', 0.09],
  ['Hoàn thiện', 0.22],
  ['Thiết bị, nghiệm thu & dự phòng cuối', 0.10],
]);

export function buildCashflow(totalVnd) {
  let accumulated = 0;
  return STAGES.map(([name, ratio], index) => {
    const amount = index === STAGES.length - 1 ? totalVnd - accumulated : Math.round(totalVnd * ratio);
    accumulated += amount;
    return { order: index + 1, name, ratio, amount, accumulated };
  });
}
