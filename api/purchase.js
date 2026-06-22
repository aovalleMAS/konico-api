import { getPool } from './db.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, description, amount_cents } = req.body;
  if (!userId || !description || !amount_cents) return res.status(400).json({ error: 'Datos incompletos' });
  const pool = getPool();
  try {
    const external_ref = 'KON-' + Date.now();
    const [result] = await pool.execute(
      `INSERT INTO transactions (user_id, external_ref, amount_cents, currency, status, description, transaction_at) VALUES (?, ?, ?, 'CLP', 'paid', ?, NOW())`,
      [userId, external_ref, amount_cents, description]
    );
    return res.status(200).json({ ok: true, transactionId: result.insertId, external_ref });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
