import { createHmac, timingSafeEqual } from 'node:crypto';

export function issueToken(userId, secret, ttlSeconds = 86400) {
  if (!userId) throw new TypeError('userId is required');
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now()/1000)+ttlSeconds })).toString('base64url');
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export function verifyToken(token, secret) {
  if (!token || !token.includes('.')) throw unauthorized();
  const [payload, signature] = token.split('.');
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a,b)) throw unauthorized();
  const data = JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
  if (!data.sub || Number(data.exp) < Math.floor(Date.now()/1000)) throw unauthorized();
  return data;
}

export function bearerUser(req, secret) {
  const value = req.headers.authorization ?? '';
  const token = value.startsWith('Bearer ') ? value.slice(7) : '';
  return verifyToken(token, secret).sub;
}

function sign(payload, secret) {
  if (!secret) throw new Error('AUTH_SECRET is required');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function unauthorized() {
  const error = new Error('Unauthorized');
  error.statusCode = 401;
  return error;
}
