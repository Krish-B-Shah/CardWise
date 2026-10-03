const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cardwise-persistence-'));
let child;
async function start() {
  child = spawn(process.execPath, [path.join(__dirname, 'start-demo.cjs')], {
    env: { ...process.env, NODE_ENV: 'development', VITEST: '', DATABASE_URL: '', PGLITE_DATA_DIR: dataDir, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });
  return new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Disk-backed startup timed out: ' + output)), 20000);
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/Server running at (http:\/\/localhost:\d+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
    child.stderr.on('data', chunk => { output += chunk; });
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error('Startup exited (' + code + '): ' + output)); });
  });
}
async function stop() {
  const processToStop = child;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Graceful shutdown timed out')), 10000);
    processToStop.once('exit', code => {
      clearTimeout(timeout);
      code === 0 ? resolve() : reject(new Error('Shutdown exited ' + code));
    });
    processToStop.send('shutdown');
  });
  child = undefined;
}
async function main() {
  try {
    let base = await start();
    const update = await fetch(base + '/api/cards/card-prime-visa', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: 'Persistence regression marker' }), signal: AbortSignal.timeout(5000)
    });
    assert.equal(update.status, 200);
    await stop();
    base = await start();
    const response = await fetch(base + '/api/cards', { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    const cards = await response.json();
    assert.equal(cards.find(card => card.id === 'card-prime-visa').notes, 'Persistence regression marker');
    await stop();
    console.log('PASS: interview launcher, compiled disk-backed startup, persisted API update, clean shutdown, reopen and readback. Saved demo database untouched.');
  } finally {
    if (child) child.kill();
    // Only remove the test-owned directory allocated above, never a configured DB.
    const temporaryRoot = path.resolve(os.tmpdir()) + path.sep;
    if (path.resolve(dataDir).startsWith(temporaryRoot) && path.basename(dataDir).startsWith('cardwise-persistence-')) fs.rmSync(dataDir, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
