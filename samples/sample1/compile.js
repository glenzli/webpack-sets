/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

const childProcess = require('child_process');

const isProd = /(--production|-P)/.test(process.argv.join(' '));
const cmd = isProd ? 'cross-env NODE_ENV=production webpack' : 'webpack';

childProcess.execSync(cmd, { stdio: 'inherit' });

