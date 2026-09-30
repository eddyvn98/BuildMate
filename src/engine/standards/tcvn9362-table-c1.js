import { standardRef, standardResult } from './common.js';

const SOURCE='https://tcvn.info/data/2017/08/285481_tcvn9362-2012.pdf';
const M=[0,0.4,0.8,1.2,1.6,2,2.4,2.8,3.2,3.6,4,4.4,4.8,5.2,5.6,6,6.4,6.8,7.2,7.6,8,8.4,8.8,9.2,9.6,10,11,12];
const N=[1,1.4,1.8,2.4,3.2,5,10];

const ROWS=[
[1,1,1,1,1,1,1,1],
[.949,.960,.972,.975,.976,.977,.977,.977],
[.756,.800,.848,.866,.875,.879,.881,.881],
[.547,.606,.682,.717,.740,.749,.754,.755],
[.390,.449,.532,.578,.612,.630,.639,.642],
[.285,.336,.414,.463,.505,.529,.545,.550],
[.214,.257,.325,.374,.419,.449,.470,.477],
[.165,.201,.260,.304,.350,.383,.410,.420],
[.130,.160,.210,.251,.294,.329,.360,.374],
[.106,.130,.173,.209,.250,.283,.320,.337],
[.087,.108,.145,.176,.214,.248,.285,.306],
[.073,.091,.122,.150,.185,.218,.256,.280],
[.067,.077,.105,.130,.161,.192,.230,.258],
[.053,.066,.091,.112,.141,.170,.208,.239],
[.046,.058,.079,.099,.124,.152,.189,.223],
[.040,.051,.070,.087,.110,.136,.172,.208],
[.036,.045,.062,.077,.098,.122,.158,.196],
[.032,.040,.055,.069,.088,.110,.144,.184],
[.028,.036,.049,.062,.080,.100,.133,.175],
[.024,.032,.044,.056,.072,.091,.123,.166],
[.022,.029,.040,.051,.066,.084,.113,.158],
[.021,.026,.037,.046,.060,.077,.105,.150],
[.019,.024,.034,.042,.055,.070,.098,.144],
[.018,.022,.031,.039,.051,.065,.091,.137],
[.016,.020,.028,.036,.047,.060,.085,.132],
[.015,.019,.026,.033,.044,.056,.079,.126],
[.011,.017,.023,.029,.040,.050,.071,.114],
[.009,.015,.020,.026,.031,.044,.060,.104]
];

export function tableC1Alpha({m,shape='rectangle',n=null}) {
  const mm=Number(m);
  if (!(mm>=0&&mm<=12)) throw new RangeError('Table C.1 interpolation is limited to 0 <= m <= 12');
  const [i0,i1,t]=bracket(M,mm);
  let value,shapeInput;

  if (shape==='circle') {
    value=lerp(ROWS[i0][0],ROWS[i1][0],t);
    shapeInput={shape:'circle'};
  } else if (shape==='strip') {
    value=lerp(ROWS[i0][7],ROWS[i1][7],t);
    shapeInput={shape:'strip',n:'>=10'};
  } else if (shape==='rectangle') {
    const nn=Number(n);
    if (!(nn>=1)) throw new RangeError('rectangle n=l/b must be >=1');
    if (nn>=10) {
      value=lerp(ROWS[i0][7],ROWS[i1][7],t);
      shapeInput={shape:'rectangle',n:nn,treatedAs:'strip n>=10'};
    } else {
      const [j0,j1,u]=bracket(N,nn);
      const a0=lerp(rectValue(i0,j0),rectValue(i0,j1),u);
      const a1=lerp(rectValue(i1,j0),rectValue(i1,j1),u);
      value=lerp(a0,a1,t);
      shapeInput={shape:'rectangle',n:nn};
    }
  } else {
    throw new RangeError('shape must be circle, rectangle or strip');
  }

  return standardResult({
    value:round(value,6),unit:'ratio',formulaId:'TCVN9362-2012-TableC1',
    reference:standardRef({
      standard:'TCVN 9362:2012',clause:'Appendix C, Table C.1 and note',
      sourceUrl:SOURCE,note:'Intermediate m and n values are determined by interpolation; n>=10 uses strip-foundation column.'
    }),
    inputs:{m:mm,...shapeInput}
  });
}

export function circularAdditionalPressure({radiusM,depthBelowBaseM,baseAdditionalPressureKpa}) {
  for (const [name,value] of Object.entries({radiusM,baseAdditionalPressureKpa})) if (!(Number(value)>0)) throw new RangeError(name+' must be >0');
  if (!(Number(depthBelowBaseM)>=0)) throw new RangeError('depthBelowBaseM must be >=0');
  const m=Number(depthBelowBaseM)/Number(radiusM);
  const alpha=tableC1Alpha({m,shape:'circle'});
  return pressure(alpha,{shape:'circle',radiusM:Number(radiusM),depthBelowBaseM:Number(depthBelowBaseM),baseAdditionalPressureKpa:Number(baseAdditionalPressureKpa),m});
}

export function rectangularAdditionalPressureFull({widthM,lengthM,depthBelowBaseM,baseAdditionalPressureKpa}) {
  for (const [name,value] of Object.entries({widthM,lengthM,baseAdditionalPressureKpa})) if (!(Number(value)>0)) throw new RangeError(name+' must be >0');
  if (!(Number(depthBelowBaseM)>=0)) throw new RangeError('depthBelowBaseM must be >=0');
  const b=Math.min(Number(widthM),Number(lengthM)),l=Math.max(Number(widthM),Number(lengthM));
  const m=2*Number(depthBelowBaseM)/b,n=l/b;
  const alpha=tableC1Alpha({m,shape:'rectangle',n});
  return pressure(alpha,{shape:'rectangle',widthM:b,lengthM:l,depthBelowBaseM:Number(depthBelowBaseM),baseAdditionalPressureKpa:Number(baseAdditionalPressureKpa),m:round(m,6),n:round(n,6)});
}

export function regularPolygonEquivalentRadius(areaM2) {
  const F=Number(areaM2);
  if (!(F>0)) throw new RangeError('areaM2 must be >0');
  return {
    radiusM:round(Math.sqrt(F/Math.PI),6),areaM2:F,level:'engineering-review',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'Appendix C, C.1.2 note 2',formula:'r=sqrt(F/pi) for regular polygon using circular alpha',sourceUrl:SOURCE})
  };
}

function pressure(alpha,inputs){
  return standardResult({
    value:round(alpha.value*inputs.baseAdditionalPressureKpa,4),unit:'kPa',
    formulaId:'TCVN9362-2012-C1',
    reference:standardRef({standard:'TCVN 9362:2012',clause:'Appendix C, C.1.2',formula:'p0z=alpha*p0',sourceUrl:SOURCE}),
    inputs:{...inputs,alpha:alpha.value}
  });
}
function rectValue(row,nIndex){return nIndex===6?ROWS[row][7]:ROWS[row][nIndex+1];}
function bracket(axis,x){
  if(x<=axis[0]) return [0,0,0];
  if(x>=axis.at(-1)) return [axis.length-1,axis.length-1,0];
  for(let i=1;i<axis.length;i++){
    if(x===axis[i]) return [i,i,0];
    if(x<axis[i]) return [i-1,i,(x-axis[i-1])/(axis[i]-axis[i-1])];
  }
  return [0,0,0];
}
function lerp(a,b,t){return a+(b-a)*t;}
function round(v,d=6){const f=10**d;return Math.round(v*f)/f;}
