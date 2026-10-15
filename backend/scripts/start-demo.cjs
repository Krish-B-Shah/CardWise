const path = require('node:path');
require('dotenv').config();

// Explicit opt-in to a separate persistent database; never reset the old one.
process.env.PGLITE_DATA_DIR ||= path.join(__dirname, '../data/interview-pg');
if (process.env.DATABASE_URL) {
  console.error('start:demo uses embedded storage. Unset DATABASE_URL first; the saved database has not been changed.');
  process.exit(1);
}
console.log('[CardWise] Interview database: ' + process.env.PGLITE_DATA_DIR);
console.log('[CardWise] This is separate from cardwise-pg; first launch uses the existing fictional seed fixtures.');
require('../dist/index.js').startServer();
