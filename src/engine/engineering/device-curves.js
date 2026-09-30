import { createSourcedCurve,interpolateSourcedCurve } from '../sourced-curve.js';

export function createBreakerTripCurve(input) {
  return createSourcedCurve({...input,xUnit:input.xUnit??'A',yUnit:input.yUnit??'s'});
}

export function tripTimeAtCurrent({curve,currentA}) {
  return interpolateSourcedCurve(curve,Number(currentA));
}

export function createPumpQhCurve(input) {
  return createSourcedCurve({...input,xUnit:input.xUnit??'m3/h',yUnit:input.yUnit??'m'});
}

export function pumpHeadAtFlow({curve,flow}) {
  return interpolateSourcedCurve(curve,Number(flow));
}
