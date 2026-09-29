import { traceResult, inputTrace } from './trace.js';

export const DEFAULT_PRICE_BOOK = Object.freeze({
  id: 'vn-demo-2026-09',
  locality: 'Vietnam - demo only',
  effectiveDate: '2026-09-01',
  sourceLabel: 'BuildMate placeholder price profile - replace with sourced locality data',
  items: {
    concrete: 1450000,
    rebar: 17500,
    masonry: 280000,
    plaster: 175000,
    paint: 115000,
    electrical: 850000,
    plumbing: 950000,
  },
});

const SCENARIOS = Object.freeze({
  economy: { label: 'Tiết kiệm', factor: 0.9, finishAllowancePerM2: 2100000 },
  balanced: { label: 'Cân bằng', factor: 1, finishAllowancePerM2: 3000000 },
  comfort: { label: 'Thoải mái', factor: 1.12, finishAllowancePerM2: 4200000 },
});

export function calculateBudget({ floorAreaM2, quantities, priceBook = DEFAULT_PRICE_BOOK }) {
  const q = Object.fromEntries(quantities.items.map((item) => [item.id, item.value]));
  const base =
    q['qty.concrete'] * priceBook.items.concrete +
    q['qty.rebar'] * priceBook.items.rebar +
    q['qty.masonry'] * priceBook.items.masonry +
    q['qty.plaster'] * priceBook.items.plaster +
    q['qty.paint'] * priceBook.items.paint +
    q['qty.electrical'] * priceBook.items.electrical +
    q['qty.plumbing'] * priceBook.items.plumbing;

  return Object.entries(SCENARIOS).map(([key, scenario]) => {
    const finish = floorAreaM2 * scenario.finishAllowancePerM2;
    const subtotal = base * scenario.factor + finish;
    const contingency = subtotal * 0.08;
    const total = Math.round(subtotal + contingency);
    return {
      key,
      label: scenario.label,
      total,
      result: traceResult({
        id: `budget.${key}`,
        label: `Tổng ngân sách - ${scenario.label}`,
        value: total,
        unit: 'VND',
        level: 'indicative',
        formulaId: '(quantityCost*scenarioFactor + floorArea*finishAllowance)*1.08',
        inputs: [
          inputTrace('quantityBaseCost', Math.round(base), 'VND'),
          inputTrace('scenarioFactor', scenario.factor, 'ratio', 'assumed'),
          inputTrace('finishAllowance', scenario.finishAllowancePerM2, 'VND/m²', 'assumed'),
          inputTrace('contingency', 0.08, 'ratio', 'assumed'),
        ],
        references: [{ type: 'price-book', id: priceBook.id, effectiveDate: priceBook.effectiveDate, source: priceBook.sourceLabel }],
        warnings: ['Đơn giá V1 là profile minh họa. Phải thay bằng dữ liệu có nguồn theo địa phương trước khi dùng cho quyết định mua sắm/hợp đồng.'],
      }),
    };
  });
}
