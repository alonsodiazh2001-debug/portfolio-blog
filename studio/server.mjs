import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const PROJECTS_FILE = path.join(ROOT, 'src', 'data', 'proyectos.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const PORT = Number(process.env.STUDIO_PORT || 4322);
const HOST = '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function assertSafeSlug(slug) {
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Slug inválido. Usa solo minúsculas, números y guiones.');
  }
}

function resolveInside(baseDir, ...segments) {
  const target = path.resolve(baseDir, ...segments);
  const rel = path.relative(baseDir, target);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('Ruta fuera del directorio permitido.');
  }
  return target;
}

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      title: '',
      description: '',
      pubDate: new Date().toISOString().slice(0, 10),
      tags: [],
      draft: false,
      body: normalized,
    };
  }

  const header = match[1];
  const body = match[2].replace(/^\n+/, '');
  const meta = {
    title: '',
    description: '',
    pubDate: new Date().toISOString().slice(0, 10),
    tags: [],
    draft: false,
  };

  for (const line of header.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();

    if (key === 'title' || key === 'description') {
      meta[key] = unquoteYaml(val);
    } else if (key === 'pubDate') {
      meta.pubDate = unquoteYaml(val).slice(0, 10);
    } else if (key === 'draft') {
      meta.draft = val === 'true';
    } else if (key === 'tags') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) meta.tags = parsed.map(String);
      } catch {
        meta.tags = val
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((t) => unquoteYaml(t.trim()))
          .filter(Boolean);
      }
    }
  }

  return { ...meta, body };
}

function unquoteYaml(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  return value;
}

function buildMarkdown({ title, description, pubDate, tags, draft, body }) {
  const esc = (s) => JSON.stringify(String(s || '').trim());
  const cleanTags = Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(String(pubDate || ''))
    ? pubDate
    : new Date().toISOString().slice(0, 10);

  return [
    '---',
    `title: ${esc(title)}`,
    `description: ${esc(description)}`,
    `pubDate: ${dateStr}`,
    `tags: ${JSON.stringify(cleanTags)}`,
    `draft: ${Boolean(draft)}`,
    '---',
    '',
    String(body || '').trimEnd(),
    '',
  ].join('\n');
}

async function readJsonBody(req, maxBytes = 15 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error('La petición supera el tamaño máximo permitido.');
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

async function runGit(args) {
  return execFileAsync('git', args, { cwd: ROOT, maxBuffer: 4 * 1024 * 1024 });
}

async function listPosts() {
  await fs.mkdir(BLOG_DIR, { recursive: true });
  const files = await fs.readdir(BLOG_DIR);
  const posts = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const slug = file.slice(0, -3);
    const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf8');
    const parsed = parseFrontmatter(raw);
    posts.push({ slug, ...parsed });
  }

  posts.sort((a, b) => String(b.pubDate).localeCompare(String(a.pubDate)));
  return posts;
}

async function getGitStatus() {
  const { stdout: statusOut } = await runGit(['status', '--porcelain']);
  let lastCommit = '';
  try {
    const { stdout: logOut } = await runGit(['log', '-n', '1', '--oneline']);
    lastCommit = logOut.trim();
  } catch {
    lastCommit = 'Sin commits aún';
  }
  const changes = statusOut
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  return { changes, lastCommit };
}

async function handleApi(req, res, urlPath) {
  if (req.method === 'GET' && urlPath === '/api/posts') {
    return sendJson(res, 200, { posts: await listPosts() });
  }

  if (req.method === 'POST' && urlPath === '/api/posts') {
    const body = await readJsonBody(req);
    const title = String(body.title || '').trim();
    if (!title) return sendJson(res, 400, { error: 'El título es obligatorio.' });

    const slug = slugify(body.slug || title);
    assertSafeSlug(slug);

    const filePath = resolveInside(BLOG_DIR, `${slug}.md`);
    const content = buildMarkdown({
      title,
      description: body.description || '',
      pubDate: body.pubDate,
      tags: body.tags,
      draft: body.draft,
      body: body.body || '',
    });

    await fs.mkdir(BLOG_DIR, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    return sendJson(res, 200, { ok: true, slug });
  }

  if (req.method === 'DELETE' && urlPath.startsWith('/api/posts/')) {
    const slug = decodeURIComponent(urlPath.slice('/api/posts/'.length));
    assertSafeSlug(slug);
    const filePath = resolveInside(BLOG_DIR, `${slug}.md`);
    await fs.unlink(filePath);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'POST' && urlPath === '/api/upload-image') {
    const body = await readJsonBody(req);
    const slug = slugify(body.slug || 'general') || 'general';
    assertSafeSlug(slug);

    const originalName = path.basename(String(body.filename || 'captura.png'));
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_IMAGE_EXTS.has(ext)) {
      return sendJson(res, 400, { error: 'Formato de imagen no permitido (.png, .jpg, .webp, .gif).' });
    }

    const baseName = slugify(path.basename(originalName, ext)) || 'captura';
    const finalName = `${baseName}${ext}`;
    const targetDir = resolveInside(IMAGES_DIR, slug);
    const targetFile = resolveInside(targetDir, finalName);

    const base64 = String(body.dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
    if (!base64) return sendJson(res, 400, { error: 'No se recibió contenido de imagen.' });

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetFile, Buffer.from(base64, 'base64'));
    return sendJson(res, 200, { ok: true, path: `/images/${slug}/${finalName}` });
  }

  if (req.method === 'GET' && urlPath === '/api/projects') {
    const raw = await fs.readFile(PROJECTS_FILE, 'utf8');
    return sendJson(res, 200, { projects: JSON.parse(raw) });
  }

  if (req.method === 'POST' && urlPath === '/api/projects') {
    const body = await readJsonBody(req);
    if (!Array.isArray(body.projects)) {
      return sendJson(res, 400, { error: 'Se esperaba un array de proyectos.' });
    }
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(body.projects, null, 2) + '\n', 'utf8');
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && urlPath === '/api/git/status') {
    return sendJson(res, 200, await getGitStatus());
  }

  if (req.method === 'POST' && urlPath === '/api/build-check') {
    const astroCli = path.join(ROOT, 'node_modules', 'astro', 'astro.js');
    try {
      const { stdout, stderr } = await execFileAsync(process.execPath, [astroCli, 'build'], {
        cwd: ROOT,
        maxBuffer: 4 * 1024 * 1024,
      });
      return sendJson(res, 200, { ok: true, output: `${stdout}\n${stderr}`.trim() });
    } catch (err) {
      return sendJson(res, 400, {
        ok: false,
        error: 'Falló la compilación de Astro.',
        output: `${err.stdout || ''}\n${err.stderr || err.message}`.trim(),
      });
    }
  }

  if (req.method === 'POST' && urlPath === '/api/git/publish') {
    const body = await readJsonBody(req);
    const message = String(body.message || '').trim() || 'content: actualizar entradas y portfolio';
    const logs = [];

    await runGit(['add', '.']);
    const { stdout: pending } = await runGit(['status', '--porcelain']);

    if (pending.trim()) {
      const commitRes = await runGit(['commit', '-m', message]);
      logs.push(commitRes.stdout.trim());
    } else {
      logs.push('No había cambios nuevos sin commitear; intentando subir commits pendientes...');
    }

    const pushRes = await runGit(['push', '-u', 'origin', 'main']);
    if (pushRes.stdout.trim()) logs.push(pushRes.stdout.trim());
    if (pushRes.stderr.trim()) logs.push(pushRes.stderr.trim());

    return sendJson(res, 200, {
      ok: true,
      output: logs.join('\n'),
      git: await getGitStatus(),
    });
  }

  return sendJson(res, 404, { error: 'Ruta de API no encontrada.' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
    const urlPath = decodeURIComponent(url.pathname);

    if (urlPath.startsWith('/api/')) {
      await handleApi(req, res, urlPath);
      return;
    }

    if (urlPath.startsWith('/images/')) {
      const rel = urlPath.slice('/images/'.length);
      const filePath = resolveInside(IMAGES_DIR, rel);
      const ext = path.extname(filePath).toLowerCase();
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
      return;
    }

    if (urlPath === '/' || urlPath === '/index.html') {
      const html = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      res.end(html);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    sendJson(res, 500, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Alonso Studio listo en http://${HOST}:${PORT}`);
});
