const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const { io } = require('../../mobile/node_modules/socket.io-client');
const server = spawn(process.execPath, ['scripts/start-server.cjs'], { env: { ...process.env, PORT: '43017', HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', value => logs += value);
server.stderr.on('data', value => logs += value);
(async () => {
  try {
    await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (logs.includes('Ready on')) { clearInterval(interval); resolve(); }
        else if (server.exitCode !== null) { clearInterval(interval); reject(new Error(logs.slice(-1500))); }
      }, 100);
      setTimeout(() => { clearInterval(interval); reject(new Error('Server startup timed out: ' + logs.slice(-1500))); }, 20000).unref();
    });
    for (const path of ['/', '/login', '/checkout/cashfree']) assert.equal((await fetch('http://127.0.0.1:43017' + path)).status, 200, path);
    assert.equal((await fetch('http://127.0.0.1:43017/api/auth')).status, 401);
    await new Promise((resolve, reject) => {
      const socket = io('http://127.0.0.1:43017', { transports: ['websocket'], reconnection: false, timeout: 3000 });
      socket.on('connect', () => { socket.disconnect(); reject(new Error('Anonymous socket accepted')); });
      socket.on('connect_error', error => { socket.disconnect(); try { assert.match(error.message, /Unauthorized/); resolve(); } catch (error) { reject(error); } });
    });
    console.log('PASS: production startup, public HTTP pages, auth 401 and anonymous socket denial.');
  } finally { server.kill(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
