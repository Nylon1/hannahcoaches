import { mkdir, cp, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage } from '../src/site.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const base = '/' + (process.env.BASE_PATH || '').split('/').filter(Boolean).join('/') + ((process.env.BASE_PATH || '').split('/').filter(Boolean).length ? '/' : '');

export async function build() {
  await mkdir(resolve(root, 'dist/assets'), { recursive: true });
  await cp(resolve(root, 'assets'), resolve(root, 'dist/assets'), { recursive: true });
  await cp(resolve(root, 'src/styles.css'), resolve(root, 'dist/assets/styles.css'));
  await cp(resolve(root, 'src/client.js'), resolve(root, 'dist/assets/client.js'));
  for (const file of ['trip-tool.js', 'trip-engine.js', 'trip-tool.css', 'stays.js', 'stays-engine.js', 'stays.css', 'airports.js', 'flights-engine.js', 'flights.js', 'flights.css']) {
    await cp(resolve(root, 'src', file), resolve(root, 'dist/assets', file));
  }
  for (const page of pages) {
    const dir = resolve(root, 'dist', page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'index.html'), renderPage(page, base));
  }
  console.log(`Built ${pages.length} pages. Base path: ${base}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
