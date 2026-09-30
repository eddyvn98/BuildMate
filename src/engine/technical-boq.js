export function buildTechnicalBoq({takeoff,priceBook,marketSnapshot}={}) {
  if(!takeoff?.items) throw new TypeError('takeoff is required');
  const rates=resolveRates(priceBook,marketSnapshot);
  const rows=[];
  for(const item of takeoff.items){
    if(!item.priceCode) continue;
    const rate=rates[item.priceCode]??null;
    rows.push({
      id:item.id,section:item.section,label:item.label,
      quantity:item.value,unit:item.unit,priceCode:item.priceCode,
      unitPriceVnd:rate?.value??null,
      amountVnd:rate?.value!=null?Math.round(Number(item.value)*rate.value):null,
      priceSource:rate?.source??null,
      priceDate:rate?.date??null,
      priceLevel:rate?.level??'unpriced',
      sourceComponentId:item.sourceComponentId,
    });
  }
  const priced=rows.filter(x=>x.amountVnd!=null);
  const unpricedItems=takeoff.items.filter(x=>!x.priceCode||!rates[x.priceCode]);
  const pricedSubtotalVnd=priced.reduce((a,b)=>a+b.amountVnd,0);
  return {
    level:'preliminary',
    rows,
    pricedSubtotalVnd,
    pricedRowCount:priced.length,
    unpricedCount:unpricedItems.length,
    unpricedItems:unpricedItems.map(x=>({label:x.label,quantity:x.value,unit:x.unit,section:x.section})),
    rateBook:rates,
    warning:'BOQ v0.9 dùng giá thị trường fresh cho bê tông/thép khi có; các nhóm còn lại dùng project price override hoặc profile hiện có. Dòng chưa có đơn giá được giữ unpriced thay vì tự đoán.',
  };
}

function resolveRates(priceBook={},marketSnapshot={}) {
  const rates={};
  const material=marketSnapshot?.materials??{};
  if(material['concrete-m250']?.center) rates.concrete=marketRate(material['concrete-m250'],'concrete-m250',marketSnapshot);
  else if(priceBook?.items?.concrete) rates.concrete=bookRate(priceBook,'concrete');
  if(material.rebar?.center) rates.rebar=marketRate(material.rebar,'rebar',marketSnapshot);
  else if(priceBook?.items?.rebar) rates.rebar=bookRate(priceBook,'rebar');
  for(const code of ['masonry','plaster','paint','electrical','plumbing']){
    if(priceBook?.items?.[code]) rates[code]=bookRate(priceBook,code);
  }
  return rates;
}

function marketRate(row,code,snapshot){
  return {
    value:Number(row.center),source:'market-snapshot:'+code,
    date:row.freshestSourceDate??snapshot?.asOf??null,level:'market-current',
  };
}
function bookRate(book,code){
  const override=book.overrides?.[code];
  return {
    value:Number(book.items[code]),
    source:override?.source??book.sourceLabel??'price-book',
    date:override?.effectiveDate??book.effectiveDate??null,
    level:override?'project-quoted':'price-book',
  };
}
