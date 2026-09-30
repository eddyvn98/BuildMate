import { inputTrace, traceResult } from '../trace.js';

const BTU_PER_HOUR_PER_KW=3412.142;
const AIR_VOLUME_HEAT_CAPACITY_KJ_M3K=1.2;

const COMFORT=Object.freeze({
  hot:{
    living:{comfortC:26.2,allowedC:[25,27],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
    bedroom:{comfortC:26.2,allowedC:[25,27],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
    study:{comfortC:26.2,allowedC:[25,27],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
    common:{comfortC:26.2,allowedC:[25,27],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
    dining:{comfortC:26.2,allowedC:[25,27],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
    kitchen:{comfortC:27,allowedC:[26,28],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
    toilet:{comfortC:27,allowedC:[26,28],airSpeedComfortMps:[0.1,0.2],airSpeedMaxMps:0.3,rhPercent:[60,70]},
  },
  cold:{
    living:{comfortC:24.5,allowedC:[22,25],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
    bedroom:{comfortC:24.5,allowedC:[22,25],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
    study:{comfortC:24.5,allowedC:[22,25],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
    common:{comfortC:24.5,allowedC:[22,25],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
    dining:{comfortC:24.5,allowedC:[22,25],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
    kitchen:{comfortC:23.5,allowedC:[21,24],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
    toilet:{comfortC:23.5,allowedC:[21,24],airSpeedComfortMps:[0.05,0.1],airSpeedMaxMps:0.2,rhPercent:[60,70]},
  },
});

const DESIGN_CLASSES=Object.freeze({
  I:{hoursNotAssured:[35,35],assuranceProbability:[0.996,0.996],use:'special-important'},
  II:{hoursNotAssured:[150,200],assuranceProbability:[0.977,0.983],use:'normal-comfort-or-process'},
  III:{hoursNotAssured:[350,400],assuranceProbability:[0.954,0.960],use:'lower-thermal-humidity-demand'},
});

const RESIDENTIAL_OUTDOOR_AIR=Object.freeze({
  bedroom:{perPersonM3h:35},
  living:{perPersonM3h:30},
});

const F1_ACH=Object.freeze({
  bedroom:{range:[2,3]},
  corridor:{exact:4},
  bathroom:{exact:10},
  garage:{exact:6,maxDefaultHeightM:2.5},
});

export function residentialComfortCondition({spaceType='living',season='hot'}={}) {
  const row=COMFORT[season]?.[spaceType];
  if (!row) throw new RangeError('unsupported residential comfort condition');
  return {
    ...structuredClone(row),spaceType,season,
    standard:'TCVN 5687:2024',clause:'5.1.1 + Appendix A Table A.1',
  };
}

export function outdoorDesignClass({classId,dryBulbC,wetBulbC,source}) {
  const row=DESIGN_CLASSES[classId];
  if (!row) throw new RangeError('classId must be I, II or III');
  if (!Number.isFinite(Number(dryBulbC))||!Number.isFinite(Number(wetBulbC))) throw new TypeError('dryBulbC and wetBulbC are required');
  requireSource(source,'source');
  return {
    classId,dryBulbC:Number(dryBulbC),wetBulbC:Number(wetBulbC),source:String(source),
    ...structuredClone(row),standard:'TCVN 5687:2024',clause:'5.2.2 + Appendix B',
  };
}

export function residentialOutdoorAir({spaceType,people=0,areaM2=0,perPersonM3h=null,perAreaM3h=null,source=null}) {
  const builtIn=RESIDENTIAL_OUTDOOR_AIR[spaceType] ?? {};
  const personRate=perPersonM3h==null?builtIn.perPersonM3h:Number(perPersonM3h);
  const areaRate=perAreaM3h==null?null:Number(perAreaM3h);
  if (!(Number(people)>=0)||!(Number(areaM2)>=0)) throw new RangeError('people and areaM2 must be >= 0');
  if (!(Number(personRate)>0)&&!(Number(areaRate)>0)) throw new RangeError('a valid outdoor-air rate is required');
  if (!builtIn.perPersonM3h) requireSource(source,'source');
  const byPeople=Number(personRate)>0?Number(people)*Number(personRate):0;
  const byArea=Number(areaRate)>0?Number(areaM2)*Number(areaRate):0;
  const value=Math.max(byPeople,byArea);
  return traceResult({
    id:'engineering.hvac.outdoor-air',
    label:'Lưu lượng gió tươi yêu cầu',
    value:round(value),unit:'m³/h',level:'standards-backed',
    formulaId:byPeople>=byArea?'TCVN5687-G7-N*IN':'TCVN5687-G6-A*IF',
    inputs:[
      inputTrace('people',Number(people),'person'),
      inputTrace('area',Number(areaM2),'m²'),
      inputTrace('perPersonOutdoorAir',personRate,'m³/(h·person)'),
      inputTrace('perAreaOutdoorAir',areaRate,'m³/(h·m²)'),
    ],
    references:[{standard:'TCVN 5687:2024',clause:'6.1.5 + Appendix E Table E.1 + Appendix G Eq.(G.6)-(G.7)',source:source??'TCVN 5687:2024 residential row'}],
  });
}

export function mechanicalVentilationByAch({spaceType,areaM2,heightM,ach=null,basementIncreaseRatio=0}) {
  const row=F1_ACH[spaceType];
  if (!row) throw new RangeError('unsupported Appendix F room type');
  if (!(Number(areaM2)>0)||!(Number(heightM)>0)) throw new RangeError('areaM2 and heightM must be > 0');
  if (!(Number(basementIncreaseRatio)>=0&&Number(basementIncreaseRatio)<=0.5)) throw new RangeError('basementIncreaseRatio must be 0..0.5');
  let selectedAch;
  if (row.range) {
    if (ach==null) throw new TypeError('ach must be selected inside the Appendix F range');
    selectedAch=Number(ach);
    if (selectedAch<row.range[0]||selectedAch>row.range[1]) throw new RangeError('ach is outside the Appendix F range');
  } else {
    selectedAch=ach==null?row.exact:Number(ach);
    if (selectedAch!==row.exact) throw new RangeError('ach must match the Appendix F value');
  }
  if (spaceType==='garage'&&Number(heightM)>row.maxDefaultHeightM) {
    throw new RangeError('garage height above 2.5 m requires an explicitly sourced adjusted ventilation rate');
  }
  const finalAch=selectedAch*(1+Number(basementIncreaseRatio));
  const volume=Number(areaM2)*Number(heightM);
  return traceResult({
    id:'engineering.hvac.ach',
    label:'Lưu lượng thông gió cơ khí',
    value:round(finalAch*volume),unit:'m³/h',level:'standards-backed',
    formulaId:'TCVN5687-G5-L=m*Vp',
    inputs:[
      inputTrace('area',Number(areaM2),'m²'),inputTrace('height',Number(heightM),'m'),
      inputTrace('airChanges',selectedAch,'1/h'),inputTrace('basementIncreaseRatio',Number(basementIncreaseRatio),null),
    ],
    references:[{standard:'TCVN 5687:2024',clause:'6.1.6 + Appendix F Table F.1 + Appendix G Eq.(G.5)'}],
  });
}

export function airflowBySensibleHeat({sensibleExcessHeatW,localExhaustM3h=0,localExhaustTempC,supplyTempC,roomExhaustTempC}) {
  const q=Number(sensibleExcessHeatW),lh=Number(localExhaustM3h);
  const th=Number(localExhaustTempC),tv=Number(supplyTempC),tr=Number(roomExhaustTempC);
  if (!(q>=0)||!(lh>=0)||![th,tv,tr].every(Number.isFinite)) throw new TypeError('valid heat, airflow and temperatures are required');
  if (!(tr>tv)) throw new RangeError('roomExhaustTempC must be greater than supplyTempC');
  const numerator=3.6*q-AIR_VOLUME_HEAT_CAPACITY_KJ_M3K*lh*(th-tv);
  const value=lh+numerator/(AIR_VOLUME_HEAT_CAPACITY_KJ_M3K*(tr-tv));
  if (!(value>=0)) throw new RangeError('calculated airflow is negative; verify inputs');
  return traceResult({
    id:'engineering.hvac.sensible-airflow',label:'Lưu lượng theo nhiệt hiện thừa',
    value:round(value),unit:'m³/h',level:'standards-backed',formulaId:'TCVN5687-G1',
    inputs:[
      inputTrace('sensibleExcessHeat',q,'W'),inputTrace('localExhaust',lh,'m³/h'),
      inputTrace('localExhaustTemp',th,'°C'),inputTrace('supplyTemp',tv,'°C'),inputTrace('roomExhaustTemp',tr,'°C'),
    ],
    references:[{standard:'TCVN 5687:2024',clause:'Appendix G Eq.(G.1)',constant:'c=1.2 kJ/(m³·K)'}],
  });
}

export function componentCoolingLoad({components}) {
  if (!Array.isArray(components)||components.length===0) throw new TypeError('components are required');
  const normalized=components.map((item,index)=>{
    if (!String(item?.category??'').trim()) throw new TypeError('component category is required at '+index);
    if (!(Number(item?.watts)>=0)) throw new RangeError('component watts must be >= 0 at '+index);
    requireSource(item?.source,'component source');
    requireSource(item?.methodRef,'component methodRef');
    return {category:String(item.category),watts:Number(item.watts),source:String(item.source),methodRef:String(item.methodRef)};
  });
  const totalW=normalized.reduce((sum,item)=>sum+item.watts,0);
  return {
    value:round(totalW/1000),unit:'kW',level:'standards-backed',
    formulaId:'sum(source-backed cooling-load components)',
    components:normalized,
    standard:'TCVN 5687:2024',
    designBasis:'Indoor/outdoor conditions and ventilation must follow 5.1, 5.2 and Section 6; component methods remain explicitly sourced.',
  };
}

export function selectCoolingEquipment({designLoadKw,equipment}) {
  if (!(Number(designLoadKw)>0)) throw new RangeError('designLoadKw must be > 0');
  if (!Array.isArray(equipment)||equipment.length===0) throw new TypeError('equipment is required');
  const rows=equipment.map((item,index)=>{
    if (!(Number(item?.ratedCapacityKw)>0)) throw new RangeError('ratedCapacityKw must be > 0 at '+index);
    requireSource(item?.source,'equipment source');
    requireSource(item?.ratedConditions,'ratedConditions');
    return {
      id:String(item.id??item.model??('equipment-'+index)),model:String(item.model??''),
      ratedCapacityKw:Number(item.ratedCapacityKw),source:String(item.source),ratedConditions:String(item.ratedConditions),
    };
  }).sort((a,b)=>a.ratedCapacityKw-b.ratedCapacityKw);
  const selected=rows.find(x=>x.ratedCapacityKw>=Number(designLoadKw))??null;
  return {
    pass:Boolean(selected),designLoadKw:Number(designLoadKw),selected,
    shortfallKw:selected?0:round(Number(designLoadKw)-rows.at(-1).ratedCapacityKw),
    evaluated:rows,standard:'TCVN 5687:2024',requirement:'source-backed rated performance at stated design conditions',
  };
}

export function estimateCoolingCapacity({conditionedAreaM2,wattsPerM2}) {
  if (!(Number(conditionedAreaM2)>0)) throw new RangeError('conditionedAreaM2 must be > 0');
  if (!(Number(wattsPerM2)>0)) throw new RangeError('wattsPerM2 must be > 0');
  const kw=Number(conditionedAreaM2)*Number(wattsPerM2)/1000;
  return {...traceResult({
    id:'engineering.cooling-load',label:'Công suất lạnh sơ bộ',value:round(kw),unit:'kW',
    level:'indicative',formulaId:'conditionedArea*wattsPerM2/1000',
    inputs:[inputTrace('conditionedArea',conditionedAreaM2,'m²'),inputTrace('planningLoadDensity',wattsPerM2,'W/m²','assumed')],
    warnings:['Legacy planning-only estimator. Standard-backed HVAC uses componentCoolingLoad().'],references:[],
  }),deprecated:true};
}

export function kwToBtuPerHour(kw) {
  if (!(Number(kw)>=0)) throw new RangeError('kw must be >= 0');
  return Math.round(Number(kw)*BTU_PER_HOUR_PER_KW);
}

function requireSource(value,label) {
  if (!String(value??'').trim()) throw new TypeError(label+' is required');
}

function round(value,digits=2) {
  const factor=10**digits;
  return Math.round(value*factor)/factor;
}
