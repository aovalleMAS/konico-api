import { getPool } from './db.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  const pool = getPool();
  try {
    const [rows] = await pool.execute(
      'SELECT user_id, first_name, last_name, email, password FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Email no registrado. Crea una cuenta primero.' });
    const u = rows[0];
    if (u.password !== password) return res.status(401).json({ error: 'Contraseña incorrecta.' });
    return res.status(200).json({ ok: true, userId: u.user_id, name: `${u.first_name} ${u.last_name}`, email: u.email });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
