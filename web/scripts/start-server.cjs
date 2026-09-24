process.env.NODE_ENV = process.argv.includes('--dev') ? 'development' : 'production';
require('@next/env').loadEnvConfig(process.cwd(), process.env.NODE_ENV === 'development');
require('ts-node').register({ compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' }, transpileOnly: true });
require('../server.ts');
