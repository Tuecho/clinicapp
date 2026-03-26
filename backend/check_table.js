const initSqlJs = require('sql.js');
const fs = require('fs');

async function check() {
  try {
    const SQL = await initSqlJs();
    const data = fs.readFileSync('family_agent.db');
    const db = new SQL.Database(data);
    const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='gallery_albums'");
    if (res.length > 0) {
      console.log('TABLE EXISTS');
    } else {
      console.log('TABLE MISSING');
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

check();
