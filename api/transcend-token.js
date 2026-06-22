import { createSign } from 'crypto';

const PRIVATE_KEY = process.env.TRANSCEND_PRIVATE_KEY?.replace(/\\n/g, '\n');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });
  if (!PRIVATE_KEY) return res.status(500).json({ error: 'Private key no configurada' });

  try {
    const header = base64url(Buffer.from(JSON.stringify({ alg: 'ES384', typ: 'JWT' })));
    const now = Math.floor(Date.now() / 1000);
    const payload = base64url(Buffer.from(JSON.stringify({
      iat: now,
      exp: now + 300, // 5 minutos
      email,
    })));

    const signing = `${header}.${payload}`;
    const sign = createSign('SHA384');
    sign.update(signing);
    sign.end();
    const sig = base64url(sign.sign({ key: PRIVATE_KEY, dsaEncoding: 'ieee-p1363' }));

    return res.status(200).json({ token: `${signing}.${sig}` });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
