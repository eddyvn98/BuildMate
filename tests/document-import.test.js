import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDocumentCandidates } from '../src/ai/document-intake.js';
import { createProject } from '../src/engine/project.js';
import { runPlanningWorkflow } from '../src/engine/workflow.js';
import { shell } from '../src/ui/panels.js';

test('document intake extracts homeowner basics from natural text',()=>{
  const items=extractDocumentCandidates(
    'đất 4x16 ở TP.HCM, 5 người, 3 tầng, 4 phòng ngủ, ngân sách 1,5 tỷ',
    {fileName:'yeu-cau.txt'}
  );
  const values=Object.fromEntries(items.map(item=>[item.path,item.value]));
  assert.equal(values['location.province'],'TP.HCM');
  assert.equal(values['land.widthM'],4);
  assert.equal(values['land.lengthM'],16);
  assert.equal(values['design.storeys'],3);
  assert.equal(values['household.people'],5);
  assert.equal(values['household.bedrooms'],4);
  assert.equal(values['budget.totalVnd'],1_500_000_000);
});

test('document intake reads unit prices from a delimited quote table',()=>{
  const csv=[
    'Hạng mục;ĐVT;Đơn giá',
    'Bê tông;m3;1.425.000',
    'Thép;kg;18.500',
    'Tô trát;m2;175.000',
    'Sơn bả;m2;115.000',
  ].join('\n');
  const items=extractDocumentCandidates(csv,{fileName:'bao-gia.csv'});
  const values=Object.fromEntries(items.map(item=>[item.path,item.value]));
  assert.equal(values['pricing.items.concrete'],1_425_000);
  assert.equal(values['pricing.items.rebar'],18_500);
  assert.equal(values['pricing.items.plaster'],175_000);
  assert.equal(values['pricing.items.paint'],115_000);
  assert.equal(values['pricing.sourceLabel'],'bao-gia.csv');
});

test('document intake extracts geotechnical and MEP fields for review',()=>{
  const text=[
    'Áp lực nền cơ sở: 150 kPa',
    'Công suất điện kết nối: 12000 W',
    'Hệ số nhu cầu: 0,75',
    'Hệ số công suất: 0,85',
    'Mức dùng nước: 180 L/người.ngày',
  ].join('\n');
  const items=extractDocumentCandidates(text,{fileName:'thong-so.txt'});
  const values=Object.fromEntries(items.map(item=>[item.path,item.value]));
  assert.equal(values['engineering.allowableBearingKpa'],150);
  assert.equal(values['engineering.allowableBearingSource'],'thong-so.txt');
  assert.equal(values['mep.connectedPowerW'],12000);
  assert.equal(values['mep.demandFactor'],0.75);
  assert.equal(values['mep.powerFactor'],0.85);
  assert.equal(values['mep.waterLitersPerPersonDay'],180);
});

test('project panel renders upload and confirmation review before apply',()=>{
  const p=createProject();
  const html=shell({
    project:p,projects:[p],workflow:runPlanningWorkflow(p),activeView:'project',
    documentImportState:{
      status:'ready',fileName:'bao-gia.csv',
      candidates:[{
        path:'pricing.items.concrete',label:'Bê tông (VND/m³)',value:1425000,
        kind:'number',confidence:'high',reason:'Đọc từ cột Đơn giá của bảng',selected:true,
      }],
    },
  });
  assert.ok(html.includes('Bổ sung từ tài liệu'));
  assert.ok(html.includes('document-import-file'));
  assert.ok(html.includes('data-import-select="0"'));
  assert.ok(html.includes('data-import-value="0"'));
  assert.ok(html.includes('Xác nhận dữ liệu đã chọn'));
});
