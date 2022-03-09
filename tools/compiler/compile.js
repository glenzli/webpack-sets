'use strict';

import chalk from 'chalk';
import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import { performance } from 'perf_hooks';

function traverse(dir, action) {
  const files = fs.readdirSync(dir, { encoding: 'utf-8' });
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverse(fullPath, action);
    } else if (file.endsWith('.js')) {
      action(fullPath);
    }
  });
}

// 使用tsc编译
function compile() {
  const startTime = performance.now();

  const projectPath = process.cwd();
  const project = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'package.json'), { encoding: 'utf-8' })).name;
  const isProd = process.env.NODE_ENV === 'production';
  const configFile = path.resolve(projectPath, isProd ? 'tsconfig.prod.json' : 'tsconfig.dev.json');

  console.log(chalk.green(`Compile ${project} ...`));
  childProcess.execSync(`tsc -p ${configFile}`, { stdio: 'inherit' });

  if (isProd) {
    traverse(path.resolve(projectPath, 'dist'), async (file) => {
      const code = fs.readFileSync(file, { encoding: 'utf-8' });
      const minifyCode = (await minify(code)).code;
      if (minifyCode) {
        fs.writeFileSync(file, minifyCode, { encoding: 'utf-8' });
      }
    });
  }

  console.log(chalk.bgGreen.black(`Compile Cost = ${Math.round(performance.now() - startTime) / 1000}s`));
}

compile();
