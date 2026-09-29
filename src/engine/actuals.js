export function createLedger(entries = []) {
  return { entries: entries.map(normalizeEntry) };
}

export function addActual(ledger, entry) {
  return { entries: [...ledger.entries, normalizeEntry(entry)] };
}

export function summarizeActuals(ledger, budgetVnd) {
  const actualVnd = ledger.entries.reduce((sum, entry) => sum + entry.amountVnd, 0);
  const committedVnd = ledger.entries.filter((entry) => entry.status === 'committed').reduce((sum, entry) => sum + entry.amountVnd, 0);
  const paidVnd = ledger.entries.filter((entry) => entry.status === 'paid').reduce((sum, entry) => sum + entry.amountVnd, 0);
  return {
    budgetVnd,
    actualVnd,
    committedVnd,
    paidVnd,
    remainingVnd: budgetVnd - actualVnd,
    varianceRatio: budgetVnd > 0 ? (actualVnd - budgetVnd) / budgetVnd : null,
  };
}

function normalizeEntry(entry) {
  return {
    id: entry.id ?? crypto.randomUUID(),
    stage: entry.stage ?? 'unassigned',
    category: entry.category ?? 'other',
    description: entry.description ?? '',
    amountVnd: Number(entry.amountVnd ?? 0),
    status: entry.status ?? 'paid',
    date: entry.date ?? new Date().toISOString().slice(0, 10),
    source: entry.source ?? 'manual',
  };
}
