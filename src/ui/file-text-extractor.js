const CDN=Object.freeze({
  xlsx:'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm',
  pdf:'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs',
  pdfWorker:'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs',
  tesseract:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js',
});

export async function extractFileText(file,{onProgress=()=>{}}={}) {
  if(!file) throw new TypeError('Chưa chọn file.');
  const name=String(file.name??'').toLowerCase();
  const type=String(file.type??'').toLowerCase();

  if(isTextLike(name,type)) {
    onProgress({stage:'reading',progress:0.2,message:'Đang đọc nội dung…'});
    const text=await file.text();
    onProgress({stage:'done',progress:1,message:'Đã đọc file.'});
    return {text,method:'text'};
  }
  if(/\.xlsx?$/.test(name)||type.includes('spreadsheet')||type.includes('excel')) {
    return extractExcel(file,onProgress);
  }
  if(name.endsWith('.pdf')||type==='application/pdf') {
    return extractPdf(file,onProgress);
  }
  if(type.startsWith('image/')||/\.(png|jpe?g|webp|bmp)$/i.test(name)) {
    return extractImage(file,onProgress);
  }
  throw new TypeError('Định dạng chưa hỗ trợ. Hãy dùng PDF, Excel, ảnh, TXT, CSV hoặc JSON.');
}

function isTextLike(name,type) {
  return /\.(txt|csv|json|tsv|md)$/i.test(name) ||
    type.startsWith('text/') || type.includes('json') || type.includes('csv');
}

async function extractExcel(file,onProgress) {
  onProgress({stage:'loading-parser',progress:0.08,message:'Đang tải bộ đọc Excel…'});
  const XLSX=await import(CDN.xlsx);
  onProgress({stage:'reading',progress:0.25,message:'Đang đọc workbook…'});
  const workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});
  const parts=[];
  workbook.SheetNames.forEach((name,index)=>{
    const sheet=workbook.Sheets[name];
    parts.push('# Sheet: '+name);
    parts.push(XLSX.utils.sheet_to_csv(sheet,{blankrows:false}));
    onProgress({
      stage:'reading',progress:0.25+0.65*((index+1)/workbook.SheetNames.length),
      message:'Đang đọc sheet '+name+'…',
    });
  });
  onProgress({stage:'done',progress:1,message:'Đã đọc Excel.'});
  return {text:parts.join('\n'),method:'xlsx'};
}

async function extractPdf(file,onProgress) {
  onProgress({stage:'loading-parser',progress:0.08,message:'Đang tải bộ đọc PDF…'});
  const pdfjs=await import(CDN.pdf);
  pdfjs.GlobalWorkerOptions.workerSrc=CDN.pdfWorker;
  const data=new Uint8Array(await file.arrayBuffer());
  const pdf=await pdfjs.getDocument({data}).promise;
  const pages=[];
  for(let pageNo=1;pageNo<=pdf.numPages;pageNo+=1){
    const page=await pdf.getPage(pageNo);
    const content=await page.getTextContent();
    pages.push(content.items.map(item=>item.str).join(' '));
    onProgress({
      stage:'reading',progress:0.15+0.8*(pageNo/pdf.numPages),
      message:'Đang đọc PDF · trang '+pageNo+'/'+pdf.numPages,
    });
  }
  onProgress({stage:'done',progress:1,message:'Đã đọc PDF.'});
  return {text:pages.join('\n'),method:'pdf'};
}

async function extractImage(file,onProgress) {
  onProgress({stage:'loading-ocr',progress:0.05,message:'Đang tải OCR tiếng Việt…'});
  const module=await import(CDN.tesseract);
  const Tesseract=module.default??module;
  const result=await Tesseract.recognize(file,'vie+eng',{
    logger:event=>{
      const value=Number(event.progress??0);
      const base=event.status==='recognizing text'?0.2:0.08;
      onProgress({
        stage:'ocr',progress:Math.min(0.98,base+value*0.78),
        message:ocrMessage(event.status,value),
      });
    },
  });
  onProgress({stage:'done',progress:1,message:'Đã OCR ảnh.'});
  return {text:result?.data?.text??'',method:'ocr'};
}

function ocrMessage(status,progress) {
  if(status==='recognizing text') return 'Đang nhận dạng chữ… '+Math.round(progress*100)+'%';
  if(status==='loading language traineddata') return 'Đang tải dữ liệu OCR…';
  if(status==='initializing api') return 'Đang khởi tạo OCR…';
  return 'Đang xử lý ảnh…';
}
