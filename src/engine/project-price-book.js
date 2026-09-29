import { DEFAULT_PRICE_BOOK } from './budget.js';
import { readValue } from './project.js';
import { overridePriceBook } from './price-book.js';

const CODES = ['concrete', 'rebar', 'masonry', 'plaster', 'paint', 'electrical', 'plumbing'];

export function buildProjectPriceBook(project) {
  const overrides = {};
  for (const code of CODES) {
    const value = Number(readValue(project, `pricing.items.${code}`, 0));
    if (value > 0) overrides[code] = value;
  }
  if (Object.keys(overrides).length === 0) return DEFAULT_PRICE_BOOK;

  return overridePriceBook(DEFAULT_PRICE_BOOK, overrides, {
    sourceLabel: readValue(project, 'pricing.sourceLabel', 'user quote') || 'user quote',
    effectiveDate: readValue(project, 'pricing.effectiveDate', new Date().toISOString().slice(0, 10)),
    note: 'Project-specific price override',
  });
}
