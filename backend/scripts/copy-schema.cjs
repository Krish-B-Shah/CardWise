const fs = require('node:fs');
const path = require('node:path');

const destination = path.join(__dirname, '../dist/db/schema.sql');
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(path.join(__dirname, '../src/db/schema.sql'), destination);
