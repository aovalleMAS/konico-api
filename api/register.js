import { getPool } from './db.js';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { first_name, last_name, email, phone, date_of_birth, password,
          line1, line2, city, state_region, postal_code, consent } = req.body;

  if (!first_name || !last_name || !email) return res.status(400).json({ error: 'Nombre, apellido y email son obligatorios' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const pool = getPool();
  try {
    const [uRes] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, phone, date_of_birth, password) VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || null, date_of_birth || null, password]
    );
    const userId = uRes.insertId;

    if (line1) {
      await pool.execute(
        `INSERT INTO addresses (user_id, label, line1, line2, city, state_region, postal_code, country) VALUES (?, 'home', ?, ?, ?, ?, ?, 'CL')`,
        [userId, line1, line2 || null, city || null, state_region || null, postal_code || null]
      );
    }

    if (consent) {
      await pool.execute(
        `INSERT INTO user_consents (user_id, terms, marketing, analytics, consented_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE terms=VALUES(terms), marketing=VALUES(marketing), analytics=VALUES(analytics), consented_at=VALUES(consented_at)`,
        [userId, consent.terms ? 1 : 0, consent.marketing ? 1 : 0, consent.analytics ? 1 : 0, consent.timestamp || new Date().toISOString()]
      );
    }

    return res.status(200).json({ ok: true, userId, message: '¡Cuenta creada!' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email ya registrado' });
    return res.status(500).json({ error: e.message });
  }
}
