import { standardRef } from './common.js';

const SOURCE='https://vanbanphapluat.co/tcvn-9222-2012-bom-canh-quay-thu-nghiem-chap-nhan-tinh-nang-thuy-luc';

export function pumpAcceptanceTolerances(grade=2) {
  if (![1,2].includes(Number(grade))) throw new RangeError('grade must be 1 or 2');
  const row=Number(grade)===1
    ? {flowPercent:4.5,headPercent:3,efficiencyMinusPercent:3}
    : {flowPercent:8,headPercent:5,efficiencyMinusPercent:5};
  return {
    grade:Number(grade),...row,level:'engineering-review',
    reference:standardRef({standard:'TCVN 9222:2012',clause:'6.3, Table 10',sourceUrl:SOURCE,note:'Default permissible deviation coefficients when no other agreement is specified.'}),
  };
}

export function checkGuaranteedPumpPoint({
  guaranteedFlow,guaranteedHeadM,guaranteedEfficiencyPercent,
  testedFlow,testedHeadM,testedEfficiencyPercent,grade=2,testReportSource
}) {
  for (const [name,value] of Object.entries({guaranteedFlow,guaranteedHeadM,guaranteedEfficiencyPercent,testedFlow,testedHeadM,testedEfficiencyPercent})) {
    if (!(Number(value)>0)) throw new RangeError(name+' must be >0');
  }
  if (!testReportSource) throw new TypeError('testReportSource is required');
  const t=pumpAcceptanceTolerances(grade);
  const flowMin=Number(guaranteedFlow)*(1-t.flowPercent/100),flowMax=Number(guaranteedFlow)*(1+t.flowPercent/100);
  const headMin=Number(guaranteedHeadM)*(1-t.headPercent/100),headMax=Number(guaranteedHeadM)*(1+t.headPercent/100);
  const efficiencyMin=Number(guaranteedEfficiencyPercent)*(1-t.efficiencyMinusPercent/100);
  return {
    pass:Number(testedFlow)>=flowMin&&Number(testedFlow)<=flowMax
      &&Number(testedHeadM)>=headMin&&Number(testedHeadM)<=headMax
      &&Number(testedEfficiencyPercent)>=efficiencyMin,
    guaranteed:{flow:Number(guaranteedFlow),headM:Number(guaranteedHeadM),efficiencyPercent:Number(guaranteedEfficiencyPercent)},
    tested:{flow:Number(testedFlow),headM:Number(testedHeadM),efficiencyPercent:Number(testedEfficiencyPercent),testReportSource:String(testReportSource)},
    acceptance:{flowMin:round(flowMin),flowMax:round(flowMax),headMinM:round(headMin),headMaxM:round(headMax),efficiencyMinPercent:round(efficiencyMin)},
    grade:Number(grade),level:'engineering-review',
    reference:standardRef({standard:'TCVN 9222:2012',clause:'6.3 Table 10; 6.4.1-6.4.2',formula:'Q/H within Table 10 tolerance; eta_test >= eta_G(1-t_eta)',sourceUrl:SOURCE}),
  };
}

export function checkPumpNpshAcceptance({npshAvailableM,npshRequiredM,requiredNpshSource,operatingFlow,testFlow=null}) {
  const A=Number(npshAvailableM),R=Number(npshRequiredM);
  if (!(A>0)||!(R>0)) throw new RangeError('npshAvailableM and npshRequiredM must be >0');
  if (!requiredNpshSource) throw new TypeError('requiredNpshSource is required');
  if (!(Number(operatingFlow)>0)) throw new RangeError('operatingFlow must be >0');
  return {
    pass:A>=R,
    npshAvailableM:A,npshRequiredM:R,marginM:round(A-R),
    operatingFlow:Number(operatingFlow),testFlow:testFlow==null?null:Number(testFlow),
    requiredNpshSource:String(requiredNpshSource),
    level:'engineering-review',
    references:[
      standardRef({standard:'TCVN 9222:2012',clause:'3.27-3.29; 6.4.3; 11.1-11.3',formula:'NPSHA must be sufficient for the guaranteed/tested NPSHR condition without unacceptable cavitation effect',sourceUrl:SOURCE}),
      standardRef({standard:'TCVN 4513:1988',clause:'7.1-7.7',sourceUrl:'https://vnpccc.com/vi/van-ban/tcvn-4513-1988',note:'TCVN 4513 defines the building water duty/operating arrangement; TCVN 9222 verifies pump hydraulic/NPSH performance.'}),
    ],
  };
}

export function pumpHydraulicEfficiency({densityKgM3,flowM3s,headM,inputPowerKw}) {
  for (const [name,value] of Object.entries({densityKgM3,flowM3s,headM,inputPowerKw})) if (!(Number(value)>0)) throw new RangeError(name+' must be >0');
  const outputKw=Number(densityKgM3)*9.80665*Number(flowM3s)*Number(headM)/1000;
  const efficiency=outputKw/Number(inputPowerKw)*100;
  return {
    outputPowerKw:round(outputKw,4),efficiencyPercent:round(efficiency,3),
    level:'engineering-review',
    reference:standardRef({standard:'TCVN 9222:2012',clause:'3.32-3.34, equations (20)-(21)',formula:'Po=rho Q g H; eta=Po/Pi',sourceUrl:SOURCE}),
  };
}
function round(v,d=4){const f=10**d;return Math.round(v*f)/f;}
