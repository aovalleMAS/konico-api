import { getPool } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const pool = getPool();
  try {
    const [rows] = await pool.execute(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone, u.date_of_birth, u.created_at,
              a.line1, a.city, a.state_region, a.postal_code
       FROM users u
       LEFT JOIN addresses a ON a.user_id = u.user_id AND a.label = 'home'
       ORDER BY u.created_at DESC`
    );
    return res.status(200).json({ users: rows });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
