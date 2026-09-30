export function createSourcedCurve({id,source,points,xUnit,yUnit,interpolation='linear'}) {
  if (!id||!source) throw new TypeError('curve id and source are required');
  if (!Array.isArray(points)||points.length<2) throw new TypeError('at least two curve points are required');
  const normalized=points.map((p,i)=>{
    const x=Number(p.x),y=Number(p.y);
    if (!Number.isFinite(x)||!Number.isFinite(y)) throw new RangeError('curve point '+i+' must be finite');
    return {x,y};
  }).sort((a,b)=>a.x-b.x);
  for (let i=1;i<normalized.length;i+=1) if (normalized[i].x===normalized[i-1].x) throw new RangeError('duplicate curve x values are not allowed');
  if (interpolation!=='linear') throw new RangeError('only linear interpolation is implemented');
  return {id:String(id),source:String(source),points:normalized,xUnit:xUnit??null,yUnit:yUnit??null,interpolation};
}

export function interpolateSourcedCurve(curve,x,{allowExtrapolation=false}={}) {
  const value=Number(x);
  if (!Number.isFinite(value)) throw new RangeError('x must be finite');
  const points=curve?.points;
  if (!Array.isArray(points)||points.length<2||!curve.source) throw new TypeError('valid sourced curve is required');
  if (!allowExtrapolation&&(value<points[0].x||value>points.at(-1).x)) {
    return {blocked:true,reason:'outside-sourced-curve-range',x:value,range:[points[0].x,points.at(-1).x],source:curve.source};
  }
  let a=points[0],b=points[1];
  if (value>=points.at(-1).x) { a=points.at(-2); b=points.at(-1); }
  else {
    for (let i=1;i<points.length;i+=1) {
      if (value<=points[i].x) { a=points[i-1]; b=points[i]; break; }
    }
  }
  const y=a.y+(b.y-a.y)*(value-a.x)/(b.x-a.x);
  return {
    value:round(y),x:value,xUnit:curve.xUnit,yUnit:curve.yUnit,
    source:curve.source,curveId:curve.id,interpolation:'linear',
    evidence:{point1:a,point2:b},
  };
}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
