// Uses only the existing seed fixtures in a disposable in-memory database.
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

async function main() {
  assert.equal(fs.readFileSync(path.join(__dirname, '../dist/db/schema.sql'), 'utf8'), fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8'));
  const child = spawn(process.execPath, [path.join(__dirname, '../dist/index.js')], {
    env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: '', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  try {
    const base = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Compiled startup timed out: ' + output)), 20000);
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/Server running at (http:\/\/localhost:\d+)/);
        if (match) { clearTimeout(timer); resolve(match[1]); }
      });
      child.stderr.on('data', chunk => { output += chunk; });
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', code => { clearTimeout(timer); reject(new Error('Compiled backend exited (' + code + '): ' + output)); });
    });
    const health = await fetch(base + '/api/health', { signal: AbortSignal.timeout(5000) });
    assert.equal(health.status, 200);
    const cards = await (await fetch(base + '/api/cards', { signal: AbortSignal.timeout(5000) })).json();
    assert.equal(cards.length, 5);
    const response = await fetch(base + '/api/recommend', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'bestbuy.com', amount: 100 }), signal: AbortSignal.timeout(5000)
    });
    assert.equal(response.status, 200);
    const rec = await response.json();
    assert.equal(rec.bestCard.estimatedCashback, 5);
    assert.match(rec.explanation, /caps.*not evaluated/i);
    console.log('PASS: compiled startup, copied schema, health, seeded cards, recommendation HTTP response and limitations disclosure (in-memory DB).');
  } finally {
    child.kill();
    await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once('exit', resolve); });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
