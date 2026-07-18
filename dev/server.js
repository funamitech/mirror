#!/usr/bin/env node
/**
 * YuruMirror dev server.
 *
 * Serves src/ like the production nginx does, and emulates the
 * ngx-fancyindex module for the fake mirror tree in dev/fixtures.json so
 * directory listings (theme/header.html + <table id="list"> + theme/footer.html)
 * can be previewed without Docker.
 *
 * Pages that exist in templates/ are re-expanded on every request, so
 * template edits show up on refresh without running `npm run build`.
 *
 * Usage: node dev/server.js   (then open http://localhost:8080)
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandFile } from '../build.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const TEMPLATES = join(ROOT, 'templates');
const PORT = process.env.PORT || 8080;
const FIXTURES = JSON.parse(readFileSync(join(ROOT, 'dev', 'fixtures.json'), 'utf8'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

/* ---------------------------------------------------------------- fixtures */

/**
 * Walk the fixtures tree; returns a node or null. A node is {} (dir with
 * children), [] (file list) or an "@generate:N" string (synthetic dir with
 * N files, for testing huge real-world listings like arch/pool/packages).
 */
function fixtureNode(segments) {
  let node = FIXTURES;
  for (const seg of segments) {
    if (Array.isArray(node) || typeof node === 'string') return null;
    if (!(seg in node)) return null;
    node = node[seg];
  }
  return node;
}

const generatedCache = new Map();

/** Synthesize N deterministic package-ish entries for an "@generate:N" node. */
function generatedEntries(spec) {
  let entries = generatedCache.get(spec);
  if (entries) return entries;

  const count = Number(spec.split(':')[1]) || 1000;
  const prefixes = ['python-', 'lib', 'rust-', 'haskell-', 'perl-', 'gnome-', 'qt6-', ''];
  entries = [];
  for (let i = 0; i < count; i++) {
    const sig = i % 5 === 4;
    const name = `${prefixes[i % prefixes.length]}pkg-${String(i).padStart(5, '0')}-` +
      `${1 + (i % 9)}.${i % 24}.${i % 7}-${1 + (i % 3)}-x86_64.pkg.tar.zst${sig ? '.sig' : ''}`;
    entries.push({
      name,
      isDir: false,
      size: sig ? 566 : 4096 + ((i * 7919) % 300000000),
      date: `2026-07-${String(1 + (i % 28)).padStart(2, '0')} ` +
        `${String(i % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    });
  }
  generatedCache.set(spec, entries);
  return entries;
}

/** Flatten a fixture node into entries: {name, isDir, size, date}. */
function entriesOf(node) {
  if (typeof node === 'string') return generatedEntries(node);
  const entries = [];
  if (Array.isArray(node)) {
    for (const [name, size, date] of node) entries.push({ name, isDir: false, size, date });
  } else {
    for (const [name, child] of Object.entries(node)) {
      if (name === '') {
        for (const [n, size, date] of child) entries.push({ name: n, isDir: false, size, date });
      } else {
        entries.push({ name, isDir: true, size: null, date: '2026-07-18 09:00' });
      }
    }
  }
  return entries;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fancyDate(iso) {
  if (!iso) return '-';
  const [d, t] = iso.split(' ');
  const [y, m, day] = d.split('-');
  return `${y}-${MONTHS[+m - 1]}-${day} ${t}`;
}

/** Real fancyindex HTML-escapes file names; keep the emulator honest. */
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Human size like fancyindex_exact_size off: "357 B", "176.0 KiB", "1.2 GiB". */
function fancySize(bytes) {
  if (bytes == null) return '-';
  if (bytes < 1024) return bytes + ' B';
  const units = ['KiB', 'MiB', 'GiB', 'TiB'];
  let v = bytes;
  for (const u of units) {
    v /= 1024;
    if (v < 1024 || u === 'TiB') return v.toFixed(1) + ' ' + u;
  }
}

/** Render the fancyindex table for a directory, honoring ?C=&O= sort params. */
function renderListing(urlPath, node, query) {
  const col = query.get('C') || 'N';
  const desc = (query.get('O') || 'A') === 'D';
  const entries = entriesOf(node);

  entries.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1; // fancyindex_directories_first
    let cmp;
    if (col === 'S') cmp = (a.size ?? -1) - (b.size ?? -1);
    else if (col === 'M') cmp = String(a.date).localeCompare(String(b.date));
    else cmp = a.name.localeCompare(b.name);
    return desc ? -cmp : cmp;
  });

  // Row and header markup mirror the real module's output, including the
  // colspan="2" name column (verified against ngx-fancyindex in Docker).
  const rows = entries.map((e) => {
    const href = encodeURIComponent(e.name) + (e.isDir ? '/' : '');
    const label = escapeHtml(e.name) + (e.isDir ? '/' : '');
    return `<tr><td colspan="2" class="link"><a href="${href}" title="${escapeHtml(e.name)}">${label}</a></td>` +
      `<td class="size">${e.isDir ? '-' : fancySize(e.size)}</td>` +
      `<td class="date">${fancyDate(e.date)}</td></tr>`;
  });

  if (urlPath !== '/') {
    rows.unshift('<tr><td colspan="2" class="link"><a href="../">Parent directory/</a></td>' +
      '<td class="size">-</td><td class="date">-</td></tr>');
  }

  const th = (c, label, span) =>
    `<th${span ? ' colspan="2"' : ''}><a href="?C=${c}&amp;O=A">${label}</a>&nbsp;` +
    `<a href="?C=${c}&amp;O=D">&nbsp;&darr;&nbsp;</a></th>`;

  return [
    page('theme/header.html'),
    '<table id="list">',
    `<thead><tr>${th('N', 'File Name', true)}${th('S', 'File Size')}${th('M', 'Date')}</tr></thead>`,
    '<tbody>',
    ...rows,
    '</tbody>',
    '</table>',
    page('theme/footer.html'),
  ].join('\n');
}

/* ------------------------------------------------------------------ server */

/** Read a page, preferring live template expansion over the built file. */
function page(rel) {
  if (existsSync(join(TEMPLATES, rel))) {
    try {
      return expandFile(rel);
    } catch (err) {
      console.error(`template error in ${rel}:`, err.message);
    }
  }
  return readFileSync(join(SRC, rel), 'utf8');
}

function send(res, status, body, type = 'text/html; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

/** Dev-only helper: append ?theme=dark|light to force a color scheme. */
function forceTheme(html, query) {
  const theme = query.get('theme');
  if (theme !== 'dark' && theme !== 'light') return html;
  return html.replace('<html lang="en">', `<html lang="en" data-theme="${theme}">`);
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let urlPath;
  try {
    urlPath = decodeURIComponent(url.pathname);
  } catch {
    // Malformed % escape ("/%", "/%FF") must not crash the process.
    return send(res, 400, 'bad request', 'text/plain');
  }
  console.log(`${req.method} ${urlPath}`);

  const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(SRC, safe);
  if (!filePath.startsWith(SRC)) return send(res, 400, 'bad request', 'text/plain');

  // Directory listings from the fixture tree (any fixture node is a directory)
  const segments = urlPath.split('/').filter(Boolean);
  const node = segments.length > 0 ? fixtureNode(segments) : null;
  if (node) {
    if (!urlPath.endsWith('/')) {
      res.writeHead(301, { Location: urlPath + '/' });
      return res.end();
    }
    return send(res, 200, forceTheme(renderListing(urlPath, node, url.searchParams), url.searchParams));
  }

  if (urlPath === '/' || urlPath === '/index.html') return send(res, 200, forceTheme(page('index.html'), url.searchParams));

  // Static files and plain pages
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath).toLowerCase();
    if (ext === '.html') return send(res, 200, forceTheme(page(safe.replace(/\\/g, '/')), url.searchParams));
    return send(res, 200, readFileSync(filePath), MIME[ext] || 'application/octet-stream');
  }

  send(res, 404, page('error/404.html'));
}).listen(PORT, () => {
  console.log(`YuruMirror dev server: http://localhost:${PORT}`);
  console.log('Listing preview:      http://localhost:' + PORT + '/arch/core/os/x86_64/');
});
