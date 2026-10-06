const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.argv.includes('--dev') ? 'development' : 'production';
require('@next/env').loadEnvConfig(process.cwd(), process.env.NODE_ENV === 'development');

if (process.env.NODE_ENV === 'development') {
  const rootReqFile = path.join(process.cwd(), '.next', 'required-server-files.json');
  const devDir = path.join(process.cwd(), '.next', 'dev');
  const devReqFile = path.join(devDir, 'required-server-files.json');
  if (fs.existsSync(rootReqFile) && !fs.existsSync(devReqFile)) {
    try {
      fs.mkdirSync(devDir, { recursive: true });
      fs.copyFileSync(rootReqFile, devReqFile);
    } catch (_) {}
  }
}

require('ts-node').register({ compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' }, transpileOnly: true });
require('../server.ts');
