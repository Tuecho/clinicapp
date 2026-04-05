const initSqlJs = require('sql.js');
const fs = require('fs');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('./family_agent.db'));

  const tables = ['subscriptions', 'pet_tracker', 'travel_manager', 'savings_goals', 'home_maintenance'];
  const result = db.exec('SELECT name FROM sqlite_master WHERE type="table"');
  const allTables = result[0].values.flat();

  console.log('Existing tables:', allTables.filter(t => tables.includes(t)).join(', '));
  console.log('Missing tables:', tables.filter(t => !allTables.includes(t)).join(', '));

  db.close();
})();