import http from 'node:http';
import { MemoryStore } from './store.js';
import { BuildMateService } from './service.js';
import { JsonFileStore } from './file-store.js';
import { createHandler } from './router.js';

export function createBuildMateServer(options={}) {
  const store=options.store ?? (process.env.DATA_FILE ? new JsonFileStore(process.env.DATA_FILE) : new MemoryStore(options.seed));
  const service=options.service ?? new BuildMateService(store);
  const authSecret=options.authSecret ?? process.env.AUTH_SECRET ?? 'development-only-change-me';
  return http.createServer(createHandler({service,store,authSecret}));
}

if (process.argv[1] && import.meta.url===new URL(`file://${process.argv[1]}`).href) {
  const port=Number(process.env.PORT ?? 3000);
  createBuildMateServer().listen(port,()=>console.log(`BuildMate API listening on :${port}`));
}
