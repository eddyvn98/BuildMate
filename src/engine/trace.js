export const ENGINE_VERSION = '0.1.0';

export function traceResult({
  id,
  label,
  value,
  unit,
  level = 'planning',
  formulaId,
  inputs = [],
  references = [],
  warnings = [],
}) {
  return {
    id,
    label,
    value,
    unit,
    level,
    formulaId,
    engineVersion: ENGINE_VERSION,
    inputs,
    references,
    warnings,
  };
}

export function inputTrace(key, value, unit = null, state = 'confirmed') {
  return { key, value, unit, state };
}
