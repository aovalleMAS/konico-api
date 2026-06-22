import { getPool } from './db.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { first_name, last_name, email, phone, date_of_birth, line1, line2, city, state_region, postal_code } = req.body;
  if (!first_name || !last_name || !email) return res.status(400).json({ error: 'Nombre, apellido y email son obligatorios' });
  const pool = getPool();
  try {
    const [uRes] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, phone, date_of_birth) VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || null, date_of_birth || null]
    );
    const userId = uRes.insertId;
    if (line1) {
      await pool.execute(
        `INSERT INTO addresses (user_id, label, line1, line2, city, state_region, postal_code, country) VALUES (?, 'home', ?, ?, ?, ?, ?, 'CL')`,
        [userId, line1, line2 || null, city || null, state_region || null, postal_code || null]
      );
    }
    return res.status(200).json({ ok: true, userId, message: '¡Cuenta creada!' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email ya registrado' });
    return res.status(500).json({ error: e.message });
  }
}
