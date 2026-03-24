const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const db = require('./lib/db');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const sessions = new Map();

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end(message);
}

function sanitizePathname(pathname) {
  const decoded = decodeURIComponent(pathname);
  return decoded === '/' ? '/index.html' : decoded;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('INVALID_JSON');
  }
}

function validateRequiredFields(payload, requiredFields) {
  return requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, part) => {
    const [key, ...value] = part.trim().split('=');
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(value.join('='));
    return acc;
  }, {});
}

function createSession(username) {
  const token = crypto.randomUUID();
  sessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function getSession(req) {
  const cookies = parseCookies(req);
  const token = cookies.testhive_admin;
  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { token, ...session };
}

function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Authentication required.' });
    return null;
  }
  return session;
}

function clearSessionCookie() {
  return 'testhive_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

async function handlePublicApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: db.DB_PATH
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/content/home') {
    return sendJson(res, 200, db.getHomeContent());
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    return sendJson(res, 200, {
      items: db.listEvents({
        status: url.searchParams.get('status') || '',
        featured: url.searchParams.get('featured') === 'true'
      })
    });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/events/')) {
    const slug = url.pathname.split('/').pop();
    const event = db.getEventBySlug(slug);
    if (!event) {
      return sendJson(res, 404, { error: 'Event not found' });
    }
    return sendJson(res, 200, event);
  }

  if (req.method === 'GET' && url.pathname === '/api/members') {
    return sendJson(res, 200, {
      items: db.listMembers({
        search: url.searchParams.get('search') || '',
        skill: url.searchParams.get('skill') || '',
        location: url.searchParams.get('location') || ''
      })
    });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/members/')) {
    const slug = url.pathname.split('/').pop();
    const member = db.getMemberBySlug(slug);
    if (!member) {
      return sendJson(res, 404, { error: 'Member not found' });
    }
    return sendJson(res, 200, member);
  }

  if (req.method === 'GET' && url.pathname === '/api/gallery') {
    return sendJson(res, 200, {
      items: db.listGallery({
        category: (url.searchParams.get('category') || '').trim().toLowerCase()
      })
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/applications') {
    const payload = await readRequestBody(req);
    const missing = validateRequiredFields(payload, ['name', 'email', 'location', 'experience']);
    if (missing.length) {
      return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }
    return sendJson(res, 201, {
      message: 'Application submitted successfully.',
      item: db.createApplication(payload)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/donations') {
    const payload = await readRequestBody(req);
    const missing = validateRequiredFields(payload, ['name', 'email', 'amount', 'donationType']);
    if (missing.length) {
      return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }

    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return sendJson(res, 400, { error: 'Donation amount must be a positive number.' });
    }

    return sendJson(res, 201, {
      message: 'Donation intent received successfully.',
      item: db.createDonation(payload)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/sponsorships') {
    const payload = await readRequestBody(req);
    const missing = validateRequiredFields(payload, ['name', 'email', 'company', 'event']);
    if (missing.length) {
      return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }

    return sendJson(res, 201, {
      message: 'Sponsorship request submitted successfully.',
      item: db.createSponsorship(payload)
    });
  }

  return false;
}

async function handleAdminApi(req, res, url) {
  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    const payload = await readRequestBody(req);
    if (payload.username !== ADMIN_USERNAME || payload.password !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Invalid credentials.' });
    }

    const token = createSession(payload.username);
    return sendJson(
      res,
      200,
      { message: 'Logged in successfully.', username: payload.username },
      {
        'Set-Cookie': `testhive_admin=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
      }
    );
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
    const session = getSession(req);
    if (session) {
      sessions.delete(session.token);
    }
    return sendJson(res, 200, { message: 'Logged out.' }, { 'Set-Cookie': clearSessionCookie() });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/session') {
    const session = getSession(req);
    return sendJson(res, 200, {
      authenticated: Boolean(session),
      username: session?.username || null
    });
  }

  if (!requireAdmin(req, res)) {
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/dashboard') {
    return sendJson(res, 200, db.getAdminDashboard());
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/submissions') {
    const type = url.searchParams.get('type') || 'applications';
    return sendJson(res, 200, { items: db.listSubmissionRows(type) });
  }

  if (req.method === 'PATCH' && url.pathname.startsWith('/api/admin/submissions/')) {
    const [, , , type, id] = url.pathname.split('/');
    const payload = await readRequestBody(req);
    const updated = db.updateSubmissionStatus(type, id, payload.status);
    if (!updated) {
      return sendJson(res, 404, { error: 'Submission not found.' });
    }
    return sendJson(res, 200, { item: updated });
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/events') {
    return sendJson(res, 200, { items: db.listEvents({}) });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/events') {
    const payload = await readRequestBody(req);
    const missing = validateRequiredFields(payload, ['title', 'category', 'status', 'date']);
    if (missing.length) {
      return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }
    return sendJson(res, 201, { item: db.createEvent(payload) });
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/admin/events/')) {
    const id = url.pathname.split('/').pop();
    const payload = await readRequestBody(req);
    const updated = db.updateEvent(id, payload);
    if (!updated) {
      return sendJson(res, 404, { error: 'Event not found.' });
    }
    return sendJson(res, 200, { item: updated });
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/admin/events/')) {
    db.deleteEvent(url.pathname.split('/').pop());
    return sendJson(res, 204, {});
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/members') {
    return sendJson(res, 200, { items: db.listMembers({}) });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/members') {
    const payload = await readRequestBody(req);
    const missing = validateRequiredFields(payload, ['name', 'role', 'location']);
    if (missing.length) {
      return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }
    return sendJson(res, 201, { item: db.createMember(payload) });
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/admin/members/')) {
    const id = url.pathname.split('/').pop();
    const payload = await readRequestBody(req);
    const updated = db.updateMember(id, payload);
    if (!updated) {
      return sendJson(res, 404, { error: 'Member not found.' });
    }
    return sendJson(res, 200, { item: updated });
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/admin/members/')) {
    db.deleteMember(url.pathname.split('/').pop());
    return sendJson(res, 204, {});
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/gallery') {
    return sendJson(res, 200, { items: db.listGallery({}) });
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/gallery') {
    const payload = await readRequestBody(req);
    const missing = validateRequiredFields(payload, ['title', 'category', 'image', 'date']);
    if (missing.length) {
      return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
    }
    return sendJson(res, 201, { item: db.createGalleryItem(payload) });
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/admin/gallery/')) {
    const id = url.pathname.split('/').pop();
    const payload = await readRequestBody(req);
    const updated = db.updateGalleryItem(id, payload);
    if (!updated) {
      return sendJson(res, 404, { error: 'Gallery item not found.' });
    }
    return sendJson(res, 200, { item: updated });
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/admin/gallery/')) {
    db.deleteGalleryItem(url.pathname.split('/').pop());
    return sendJson(res, 204, {});
  }

  return false;
}

async function handleStatic(req, res, url) {
  const safePath = sanitizePathname(url.pathname);
  const filePath = path.normalize(path.join(ROOT_DIR, safePath));

  if (!filePath.startsWith(ROOT_DIR)) {
    return sendText(res, 403, 'Forbidden');
  }

  try {
    const stat = await fs.stat(filePath);
    const finalPath = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    const ext = path.extname(finalPath).toLowerCase();
    const content = await fs.readFile(finalPath);

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    res.end(content);
  } catch {
    sendText(res, 404, 'Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname.startsWith('/api/admin/')) {
      const handled = await handleAdminApi(req, res, url);
      if (handled !== false) {
        return;
      }
    }

    if (url.pathname.startsWith('/api/')) {
      const handled = await handlePublicApi(req, res, url);
      if (handled !== false) {
        return;
      }
      return sendJson(res, 404, { error: 'Route not found' });
    }

    await handleStatic(req, res, url);
  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      sendJson(res, 400, { error: 'Request body must be valid JSON.' });
      return;
    }

    if (error.message === 'INVALID_SUBMISSION_TYPE') {
      sendJson(res, 400, { error: 'Invalid submission type.' });
      return;
    }

    console.error(error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Test Hive server running at http://${HOST}:${PORT}`);
});
