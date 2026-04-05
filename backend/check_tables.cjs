const initSqlJs = require('sql.js');
const fs = require('fs');

initSqlJs().then(SQL => {
  const db = new SQL.Database(fs.readFileSync('./family_agent.db'));
  const r = db.exec('SELECT name FROM sqlite_master WHERE type="table"');
  console.log(r[0].values.map(v => v[0]).join('\n'));
});