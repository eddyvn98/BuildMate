import { standardRef, standardResult } from './common.js';

const SOURCE='https://www.rds.com.vn/TCXD1/TCVN5574-2018.pdf';

export function flangedFlexuralCapacity({
  webWidthMm,compressionFlangeWidthMm,compressionFlangeThicknessMm,h0Mm,
  RbMpa,RsMpa,AsMm2,RscMpa=0,AsCompressionMm2=0,aPrimeMm=0,xiR,
  effectiveFlangeWidthSource
}) {
  for (const [name,value] of Object.entries({
    webWidthMm,compressionFlangeWidthMm,compressionFlangeThicknessMm,h0Mm,
    RbMpa,RsMpa,AsMm2
  })) if (!(Number(value)>0)) throw new RangeError(name+' must be > 0');
  if (!(Number(compressionFlangeWidthMm)>=Number(webWidthMm))) throw new RangeError('compressionFlangeWidthMm must be >= webWidthMm');
  if (!(Number(xiR)>0&&Number(xiR)<1)) throw new RangeError('xiR must be between 0 and 1');
  if (!(Number(RscMpa)>=0)&&Number(RscMpa)!==0) throw new RangeError('RscMpa must be >= 0');
  if (!(Number(AsCompressionMm2)>=0)) throw new RangeError('AsCompressionMm2 must be >= 0');
  if (!(Number(aPrimeMm)>=0)) throw new RangeError('aPrimeMm must be >= 0');
  if (!effectiveFlangeWidthSource) throw new TypeError('effectiveFlangeWidthSource is required');

  const b=Number(webWidthMm),bf=Number(compressionFlangeWidthMm),hf=Number(compressionFlangeThicknessMm);
  const h0=Number(h0Mm),Rb=Number(RbMpa),Rs=Number(RsMpa),As=Number(AsMm2);
  const Rsc=Number(RscMpa),Asp=Number(AsCompressionMm2),ap=Number(aPrimeMm);
  const steelTension=Rs*As;
  const flangeCompression=Rb*bf*hf+Rsc*Asp;
  let x,capacityNmm,branch;

  if (steelTension<=flangeCompression) {
    branch='neutral-axis-in-flange';
    x=(steelTension-Rsc*Asp)/(Rb*bf);
    capacityNmm=Rb*bf*x*(h0-0.5*x)+Rsc*Asp*(h0-ap);
  } else {
    branch='neutral-axis-in-web';
    x=(steelTension-Rsc*Asp-Rb*(bf-b)*hf)/(Rb*b);
    capacityNmm=Rb*b*x*(h0-0.5*x)
      +Rb*(bf-b)*hf*(h0-0.5*hf)
      +Rsc*Asp*(h0-ap);
  }

  if (!(x>0)) throw new RangeError('calculated compression-zone depth must be > 0');
  const xi=x/h0;
  const xiPass=xi<=Number(xiR);

  return standardResult({
    value:round(capacityNmm/1e6,4),unit:'kN·m',formulaId:'TCVN5574-2018-Eq36-38',
    reference:standardRef({
      standard:'TCVN 5574:2018',
      clause:'8.1.2.3.3, equations (36)-(38)',
      formula:'Eq.(36) selects flange/web branch; Eq.(37)-(38) give Mu and x for neutral axis in web; flange branch uses rectangular Eq.(34)-(35) with b=bf',
      sourceUrl:SOURCE,
      note:'Effective compression-flange width must be established under 8.1.2.3.4.',
    }),
    inputs:{
      webWidthMm:b,compressionFlangeWidthMm:bf,compressionFlangeThicknessMm:hf,h0Mm:h0,
      RbMpa:Rb,RsMpa:Rs,AsMm2:As,RscMpa:Rsc,AsCompressionMm2:Asp,aPrimeMm:ap,
      xiR:Number(xiR),effectiveFlangeWidthSource,
    },
    checks:{branch,xMm:round(x,3),xi:round(xi,5),xiR:Number(xiR),xiPass},
    warnings:xiPass?[]:['Clause 8.1.2.3.5 requires x <= xiR*h0; if excess reinforcement is intentional, capacity may be evaluated with x=xiR*h0 only under that clause.'],
  });
}

export function limitFlangedCapacityAtXiR(input) {
  const result=flangedFlexuralCapacity(input);
  if (result.checks.xiPass) return {...result,limitedAtXiR:false};
  const b=Number(input.webWidthMm),bf=Number(input.compressionFlangeWidthMm);
  const hf=Number(input.compressionFlangeThicknessMm),h0=Number(input.h0Mm);
  const Rb=Number(input.RbMpa),Rsc=Number(input.RscMpa??0),Asp=Number(input.AsCompressionMm2??0),ap=Number(input.aPrimeMm??0);
  const x=Number(input.xiR)*h0;
  let capacityNmm;
  if (x<=hf) {
    capacityNmm=Rb*bf*x*(h0-0.5*x)+Rsc*Asp*(h0-ap);
  } else {
    capacityNmm=Rb*b*x*(h0-0.5*x)+Rb*(bf-b)*hf*(h0-0.5*hf)+Rsc*Asp*(h0-ap);
  }
  return {
    ...result,value:round(capacityNmm/1e6,4),limitedAtXiR:true,
    checks:{...result.checks,xMm:round(x,3),xi:Number(input.xiR),xiPass:true},
    reference:standardRef({
      standard:'TCVN 5574:2018',clause:'8.1.2.3.5',
      formula:'For excess reinforcement provided by detailing/SLS, Mu may use Eq.(34) or Eq.(37) with x=xiR*h0',
      sourceUrl:SOURCE,
    }),
  };
}

function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
