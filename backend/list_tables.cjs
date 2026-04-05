const initSqlJs = require('sql.js');
const fs = require('fs');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('./family_agent.db'));

  const result = db.exec('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name');
  console.log('All tables:', result[0].values.flat().join('\n'));

  db.close();
})();