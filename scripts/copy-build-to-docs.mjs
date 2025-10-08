// Copy CRA build output to docs/ for GitHub Pages and ensure SPA 404.html
// Cross-platform (Windows/macOS/Linux) using Node fs APIs
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const buildDir = path.join(root, 'build');
const docsDir = path.join(root, 'docs');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    // ensure parent dir exists
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function main() {
  if (!fs.existsSync(buildDir)) {
    console.error('[postbuild] build/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  // 1) Copy build -> docs
  if (fs.existsSync(docsDir)) {
    // remove docs first to avoid stale files
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  copyRecursive(buildDir, docsDir);

  // 2) Ensure 404.html for SPA routing
  const indexHtml = path.join(docsDir, 'index.html');
  const notFoundHtml = path.join(docsDir, '404.html');
  try {
    if (fs.existsSync(indexHtml)) {
      fs.copyFileSync(indexHtml, notFoundHtml);
    }
  } catch (e) {
    console.warn('[postbuild] Failed to create 404.html:', e.message);
  }

  console.log('[postbuild] Copied build/ -> docs/ and ensured 404.html');
}

main();
