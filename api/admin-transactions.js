import { getPool } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pool = getPool();
  try {
    const [rows] = await pool.execute(
      `SELECT t.id AS transaction_id, t.external_ref, t.amount_cents, t.currency,
              t.status, t.description, t.transaction_at,
              u.user_id, u.first_name, u.last_name, u.email
       FROM transactions t
       LEFT JOIN users u ON u.user_id = t.user_id
       ORDER BY t.transaction_at DESC`
    );
    return res.status(200).json({ transactions: rows });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
