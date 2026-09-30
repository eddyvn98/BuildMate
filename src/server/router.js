import { STANDARD_STATUS_SNAPSHOT,standardsSnapshotHealth } from '../engine/standards/status-registry.js';
import { buildIndependentReviewPacket } from '../engine/review-packet.js';
import { STANDARD_CLAUSE_COVERAGE } from '../engine/standards/coverage.js';
import { bearerUser } from './auth.js';
import { buildMarketSnapshot } from '../engine/market-pricing.js';

export function createHandler({service,store,authSecret}) {
  return async function handler(req,res) {
    try {
      const url=new URL(req.url,'http://localhost');
      if (url.pathname==='/healthz') return json(res,200,{ok:true});
      if (req.method==='GET' && url.pathname==='/api/standards/coverage') return json(res,200,STANDARD_CLAUSE_COVERAGE);
      if (req.method==='GET' && url.pathname==='/api/standards/status') return json(res,200,{snapshot:STANDARD_STATUS_SNAPSHOT,health:standardsSnapshotHealth()});
      if (req.method==='GET' && url.pathname==='/api/engineering/calculators') return json(res,200,service.standardCalculatorCapabilities());
      if (req.method==='GET' && url.pathname==='/api/pricing/market-snapshot') return json(res,200,buildMarketSnapshot({
        province:url.searchParams.get('province') ?? 'TP.HCM',
        asOf:url.searchParams.get('asOf') ?? new Date().toISOString().slice(0,10),
      }));
      if (req.method==='GET' && url.pathname==='/api/engineering/review-packets') return json(res,200,[4,5,6,7,8,12].map((issue)=>buildIndependentReviewPacket(issue)));
      const packetMatch=url.pathname.match(/^\/api\/engineering\/review-packets\/(4|5|6|7|8|12)$/);
      if (req.method==='GET' && packetMatch) return json(res,200,buildIndependentReviewPacket(Number(packetMatch[1])));
      const userId=bearerUser(req,authSecret);
      const body=await readJson(req);
      const parts=url.pathname.split('/').filter(Boolean);

      if (req.method==='POST' && url.pathname==='/api/projects') return json(res,201,service.createProject(userId,body));
      if (req.method==='GET' && url.pathname==='/api/projects') return json(res,200,service.listProjects(userId));
      if (req.method==='GET' && url.pathname==='/api/price-books') {
        return json(res,200,store.listPriceBooks({province:url.searchParams.get('province'),effectiveDate:url.searchParams.get('effectiveDate')}));
      }
      if (req.method==='POST' && url.pathname==='/api/import') return json(res,201,service.importProject(userId,body));

      if (parts[0]!=='api' || parts[1]!=='projects' || !parts[2]) return json(res,404,{error:'not found'});
      const projectId=parts[2];
      if (parts.length===3 && req.method==='GET') return json(res,200,service.getProject(userId,projectId));
      if (parts.length===3 && req.method==='PATCH') return json(res,200,service.patchProject(userId,projectId,body));
      if (parts[3]==='versions' && req.method==='POST') return json(res,201,service.createVersion(userId,projectId,body.label));
      if (parts[3]==='versions' && req.method==='GET') return json(res,200,service.listVersions(userId,projectId));
      if (parts[3]==='intake' && parts[4]==='interpret' && req.method==='POST') return json(res,200,service.interpret(userId,projectId,body.text));
      if (parts[3]==='calculate' && req.method==='POST') return json(res,201,service.calculate(userId,projectId,body));
      if (parts[3]==='engineering' && parts[4]==='calculate' && req.method==='POST') return json(res,201,service.calculateStandard(userId,projectId,body));
      if (parts[3]==='runs' && parts[4] && req.method==='GET') return json(res,200,service.getRun(userId,projectId,parts[4]));
      if (parts[3]==='price-overrides' && req.method==='POST') return json(res,200,service.addPriceOverrides(userId,projectId,body));
      if (parts[3]==='actual-costs' && parts.length===4 && req.method==='POST') return json(res,201,service.addActualCost(userId,projectId,body));
      if (parts[3]==='actual-costs' && parts[4] && req.method==='DELETE') return json(res,200,service.deleteActualCost(userId,projectId,parts[4]));
      if (parts[3]==='engineering-readiness' && req.method==='GET') return json(res,200,service.engineeringReadiness(userId,projectId));
      if (parts[3]==='engineering-evidence' && req.method==='POST') return json(res,201,service.addEngineeringEvidence(userId,projectId,body));
      if (parts[3]==='engineering-evidence' && req.method==='GET') return json(res,200,service.listEngineeringEvidence(userId,projectId,url.searchParams.get('issue')));
      if (parts[3]==='engineering-reviews' && parts[4]==='fingerprint' && req.method==='GET') return json(res,200,service.reviewFingerprint(userId,projectId,url.searchParams.get('issue'),url.searchParams.get('commitSha')));
      if (parts[3]==='engineering-reviews' && req.method==='POST') return json(res,201,service.addEngineeringReview(userId,projectId,body));
      if (parts[3]==='engineering-reviews' && req.method==='GET') return json(res,200,service.listEngineeringReviews(userId,projectId));
      if (parts[3]==='documents' && req.method==='POST') return json(res,201,service.addDocument(userId,projectId,body));
      if (parts[3]==='documents' && req.method==='GET') return json(res,200,store.listDocuments(userId,projectId));
      if (parts[3]==='reports' && parts[4] && req.method==='GET') return json(res,200,service.report(userId,projectId,parts[4]));
      return json(res,404,{error:'not found'});
    } catch (error) {
      return json(res,error.statusCode ?? 500,{error:error.message ?? 'internal error'});
    }
  };
}

async function readJson(req) {
  if (req.method==='GET' || req.method==='DELETE') return {};
  let text=''; for await (const chunk of req) text+=chunk;
  if (!text) return {};
  try { return JSON.parse(text); } catch { const e=new Error('Invalid JSON'); e.statusCode=400; throw e; }
}

function json(res,status,payload) {
  res.writeHead(status,{'content-type':'application/json; charset=utf-8'});
  res.end(JSON.stringify(payload));
}
