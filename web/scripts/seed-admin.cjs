require('@next/env').loadEnvConfig(process.cwd());
require('ts-node').register({ compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' }, transpileOnly: true });
require('./seed-admin.ts');
