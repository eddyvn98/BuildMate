export const STANDARD_STATUS_SNAPSHOT=Object.freeze([
  active('TCVN 2737:2023','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023'),
  active('TCVN 5574:2018','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5574%3A2018'),
  active('TCVN 9362:2012','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9362%3A2012'),
  active('TCVN 10304:2025','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+10304%3A2025'),
  active('TCVN 9206:2012','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9206%3A2012'),
  active('TCVN 7447-4-41:2010','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-4-41%3A2010'),
  active('TCVN 7447-5-52:2010','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-52%3A2010'),
  active('TCVN 7447-5-54:2015','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-5-54%3A2015'),
  active('TCVN 7447-6:2011','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7447-6%3A2011'),
  active('TCVN 4513:1988','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+4513%3A1988'),
  active('TCVN 7957:2023','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+7957%3A2023'),
  active('TCVN 9222:2012','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+9222%3A2012'),
  active('TCVN 5687:2024','https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5687%3A2024'),
  active('QCVN 12:2014/BXD','https://tieuchuan.vsqi.gov.vn/quychuan/view?sohieu=QCVN+12%3A2014%2FBXD'),
  {
    id:'QCVN 02:2022/BXD',status:'active',verifiedAt:'2026-09-30',
    sourceUrl:'https://moc.gov.vn/Images/editor/files/Quy%20Chu%E1%BA%A9n/BXD_02-2022-TT-BXD_26092022.pdf',
    note:'Issued with Circular 02/2022/TT-BXD and replaces QCVN 02:2009/BXD.',
  },
  {
    id:'QCVN 06:2022/BXD + Amendment 1:2023',status:'active',verifiedAt:'2026-09-30',
    sourceUrl:'https://moc.gov.vn/Images/editor/files/Quy%20Chu%E1%BA%A9n/QCVN%2006-2022.pdf',
    note:'Use QCVN 06:2022/BXD together with Amendment 1:2023; unchanged provisions of the base regulation continue to apply.',
  },
]);

export function standardStatus(id) {
  return structuredClone(STANDARD_STATUS_SNAPSHOT.find(x=>x.id===id) ?? null);
}

export function standardsSnapshotHealth({asOfDate=new Date().toISOString().slice(0,10),maxAgeDays=120}={}) {
  const now=Date.parse(asOfDate+'T00:00:00Z');
  if (!Number.isFinite(now)) throw new RangeError('asOfDate must be YYYY-MM-DD');
  if (!(Number(maxAgeDays)>0)) throw new RangeError('maxAgeDays must be > 0');
  const rows=STANDARD_STATUS_SNAPSHOT.map(row=>{
    const checked=Date.parse(row.verifiedAt+'T00:00:00Z');
    const ageDays=Math.floor((now-checked)/86400000);
    return {...row,ageDays,verificationFresh:ageDays>=0&&ageDays<=Number(maxAgeDays)};
  });
  return {
    healthy:rows.every(x=>x.status==='active'&&x.verificationFresh),
    asOfDate,maxAgeDays:Number(maxAgeDays),rows,
    blockers:rows.filter(x=>x.status!=='active'||!x.verificationFresh).map(x=>({
      id:x.id,reason:x.status!=='active'?'standard-not-active':'status-reverification-required',ageDays:x.ageDays,
    })),
  };
}

function active(id,sourceUrl) {
  return {id,status:'active',verifiedAt:'2026-09-30',sourceUrl};
}
