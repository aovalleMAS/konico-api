import mysql from 'mysql2/promise';
let pool;
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: 'bdtrascend5.mysql.database.azure.com',
      user: 'alfredo_admin',
      password: '4lfr3dO2026',
      database: 'transcend_prueba',
      port: 3306,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}
