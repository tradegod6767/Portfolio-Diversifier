import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const indexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
writeFileSync(resolve(distDir, '404.html'), indexHtml);
console.log('Generated 404.html from index.html');
