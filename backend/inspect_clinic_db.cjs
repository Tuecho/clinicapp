const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function inspectTables() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'family_agent.db');
  const db = new SQL.Database(fs.readFileSync(dbPath));
  
  const res = db.exec(`PRAGMA table_info(clinic_appointments)`);
  console.log('--- clinic_appointments ---');
  res[0].values.forEach(v => console.log(`${v[1]} (${v[2]})`));

  const res2 = db.exec(`PRAGMA table_info(clinic_products)`);
  console.log('\n--- clinic_products ---');
  res2[0].values.forEach(v => console.log(`${v[1]} (${v[2]})`));
}

inspectTables();
