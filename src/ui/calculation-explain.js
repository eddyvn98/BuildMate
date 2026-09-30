export function explainCalculation(record) {
  if (!record) return null;
  const action=String(record.action??'');
  const result=record.result??{};
  const base={
    action,
    standard:record.standard??'',
    digest:record.calculationDigest??'',
    status:record.status??'unknown',
    formula:null,
    summary:[],
    steps:[],
    references:collectReferences(result),
  };

  switch(action){
    case 'loads.permanent':
      return {...base,
        formula:'gk = sum(t x gamma); gd = sum(gk x gammaF)',
        summary:[
          row('Tai dac trung',result.characteristicKnM2,'kN/m2'),
          row('Tai thiet ke',result.designKnM2,'kN/m2'),
        ],
        steps:(result.layers??[]).map(x=>x.name+': '+x.thicknessM+' m x '+x.unitWeightKnM3+' kN/m3 x gammaF '+x.gammaF+' -> '+x.designKnM2+' kN/m2'),
      };
    case 'rc.beam':
      return {...base,
        formula:'Kiem tra ULS moment + luc cat theo workflow TCVN 5574:2018',
        summary:[
          row('Moment',result.moment?.pass?'PASS':'FAIL',''),
          row('Kha nang moment',result.capacity?.designMomentCapacityKnM??result.capacity?.momentCapacityKnM??null,'kN.m'),
          row('Luc cat',result.shear?.pass?'PASS':'FAIL',''),
        ],
        steps:['Noi luc phai co trace tu to hop tai TCVN 2737:2023.','Tinh suc khang uon tu tiet dien/vat lieu/cot thep.','So sanh noi luc thiet ke voi suc khang va kiem tra cat.'],
      };
    case 'foundation.shallow-settlement':
      return {...base,
        formula:'S = beta x sum(pi x hi / Ei), beta = 0.8',
        summary:[row('Do lun tinh toan',result.value,'mm')],
        steps:(result.inputs?.layers??[]).map((x,i)=>'Lop '+(i+1)+': p='+x.averageAdditionalPressureKpa+' kPa · h='+x.thicknessM+' m · E='+x.deformationModulusKpa+' kPa'),
      };
    case 'electrical.xlpe-cable':
      return {...base,
        formula:'Chon tiet dien nho nhat sao cho Iz x product(k) >= Ib',
        summary:[
          row('Tiet dien chon',result.sectionMm2,'mm2'),
          row('Ampacity sau hieu chinh',result.correctedAmpacityA,'A'),
          row('Dong thiet ke',result.designCurrentA,'A'),
        ],
        steps:['Cap '+(result.conductor??'')+' · phuong phap '+(result.method??'')+' · '+(result.loadedConductors??'')+' day mang tai.','He so hieu chinh: '+((result.correctionFactors??[]).join(' x ')||'1')+'.'],
      };
    case 'water.design-flow':
      return {...base,
        formula:'TCVN 4513:1988 Eq.(2) — luu luong thiet ke tu duong luong thiet bi va muc dung nuoc',
        summary:[row('Luu luong thiet ke',result.value,result.unit??'L/s')],
        steps:[
          'Duong luong thiet bi: '+(record.input?.fixtureEquivalentUnits??'—')+'.',
          'Muc dung nuoc: '+(record.input?.litersPerPersonDay??'—')+' L/nguoi.ngay.',
        ],
      };
    case 'hvac.outdoor-air':
      return {...base,
        formula:'L = max(N x IN, A x IF)',
        summary:[row('Gio tuoi yeu cau',result.value,result.unit??'m3/h')],
        steps:[
          'Phong: '+(record.input?.spaceType??'—')+' · '+(record.input?.people??'—')+' nguoi · '+(record.input?.areaM2??'—')+' m2.',
          'Chon nhanh yeu cau lon hon giua luu luong theo nguoi va theo dien tich.',
        ],
      };
    default:
      return {...base,
        formula:result.formulaId??null,
        summary:genericSummary(result),
        steps:['Xem input, result, evidence audit va standard reference trong che do chuyen gia.'],
      };
  }
}

function row(label,value,unit='') {
  return {label,value:value??'—',unit};
}

function genericSummary(result) {
  if (result?.value!==undefined) return [row('Ket qua',result.value,result.unit??'')];
  if (result?.pass!==undefined) return [row('Ket qua',result.pass?'PASS':'FAIL','')];
  return [];
}

function collectReferences(value,out=[]) {
  if (!value||typeof value!=='object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectReferences(item,out);
    return unique(out);
  }
  if (value.standard||value.clause||value.sourceUrl) {
    out.push({standard:value.standard??'',clause:value.clause??'',sourceUrl:value.sourceUrl??''});
  }
  for (const nested of Object.values(value)) collectReferences(nested,out);
  return unique(out);
}

function unique(rows) {
  const seen=new Set();
  return rows.filter(row=>{
    const key=JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
