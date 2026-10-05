const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const dist = path.join(__dirname, '../dist');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
for (const entry of manifest.content_scripts) {
  for (const file of entry.js) new vm.Script(fs.readFileSync(path.join(dist, file), 'utf8'), { filename: file });
}
for (const file of [manifest.background.service_worker, manifest.action.default_popup, ...Object.values(manifest.icons)]) assert.ok(fs.existsSync(path.join(dist, file)), 'Missing extension asset: ' + file);
for (const [size, file] of Object.entries(manifest.icons)) {
  const png = fs.readFileSync(path.join(dist, file));
  assert.equal(path.extname(file), '.png');
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), Number(size));
  assert.equal(png.readUInt32BE(20), Number(size));
}
console.log('PASS: extension assets exist and content script parses as a classic script. Chrome runtime has not been tested.');
