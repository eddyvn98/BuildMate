export function estimateWorkDuration({
  quantity,
  productivityPerCrewDay,
  crews = 1,
  bufferRatio = 0.15,
}) {
  if (!(Number(quantity) > 0)) throw new RangeError('quantity must be > 0');
  if (!(Number(productivityPerCrewDay) > 0)) throw new RangeError('productivityPerCrewDay must be > 0');
  if (!(Number(crews) > 0)) throw new RangeError('crews must be > 0');
  if (!(Number(bufferRatio) >= 0)) throw new RangeError('bufferRatio must be >= 0');

  const productiveDays = quantity / (productivityPerCrewDay * crews);
  const calendarDays = Math.ceil(productiveDays * (1 + bufferRatio));
  return {
    productiveDays: round(productiveDays),
    calendarDays,
    level: 'planning',
    formulaId: 'quantity/(productivity*crews)*(1+buffer)',
  };
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
