import crypto from 'crypto';

export function verifyXHubSignature256(appSecret: string, payload: Buffer, header?: string): boolean {
  if (!header) return false;
  const [algo, signature] = header.split('=');
  if (algo !== 'sha256' || !signature) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
