export function overridePriceBook(baseBook, overrides, metadata = {}) {
  const items = { ...baseBook.items };
  const provenance = {};
  for (const [code, value] of Object.entries(overrides)) {
    if (!(Number(value) >= 0) || !(code in items)) continue;
    items[code] = Number(value);
    provenance[code] = {
      source: metadata.sourceLabel ?? 'user override',
      effectiveDate: metadata.effectiveDate ?? new Date().toISOString().slice(0, 10),
      note: metadata.note ?? '',
    };
  }
  return {
    ...baseBook,
    id: `${baseBook.id}-override`,
    sourceLabel: metadata.sourceLabel ?? baseBook.sourceLabel,
    effectiveDate: metadata.effectiveDate ?? baseBook.effectiveDate,
    items,
    overrides: provenance,
  };
}
