const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'testhive.sqlite');
const CONTENT_SEED_PATH = path.join(DATA_DIR, 'content.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    venue TEXT,
    city TEXT,
    image TEXT,
    excerpt TEXT,
    description TEXT,
    registration_url TEXT,
    featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    work_mode TEXT,
    skills TEXT NOT NULL,
    bio TEXT,
    avatar TEXT,
    featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin TEXT,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    skills TEXT
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    amount REAL NOT NULL,
    donation_type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sponsorships (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT,
    event TEXT NOT NULL,
    message TEXT
  );
`);

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || randomUUID();
}

function toBoolean(value) {
  return value ? 1 : 0;
}

function mapEvent(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    city: row.city,
    image: row.image,
    excerpt: row.excerpt,
    description: row.description,
    registrationUrl: row.registration_url,
    featured: Boolean(row.featured)
  };
}

function mapMember(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    location: row.location,
    country: row.country,
    workMode: row.work_mode,
    skills: parseJson(row.skills, []),
    bio: row.bio,
    avatar: row.avatar,
    featured: Boolean(row.featured)
  };
}

function mapGallery(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    image: row.image,
    date: row.date
  };
}

function seedDatabase() {
  const countRow = db.prepare('SELECT COUNT(*) AS count FROM events').get();
  if (countRow.count > 0) {
    return;
  }

  const seed = JSON.parse(fs.readFileSync(CONTENT_SEED_PATH, 'utf8'));

  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('home_featured_event_slug', seed.home.featuredEventSlug);
  insertSetting.run('home_highlights', JSON.stringify(seed.home.highlights));

  const insertEvent = db.prepare(`
    INSERT INTO events (
      id, slug, title, category, status, date, start_time, end_time, venue, city,
      image, excerpt, description, registration_url, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const event of seed.events) {
    insertEvent.run(
      event.id,
      event.slug,
      event.title,
      event.category,
      event.status,
      event.date,
      event.startTime,
      event.endTime,
      event.venue,
      event.city,
      event.image,
      event.excerpt,
      event.description,
      event.registrationUrl,
      toBoolean(event.featured)
    );
  }

  const insertMember = db.prepare(`
    INSERT INTO members (
      id, slug, name, role, location, country, work_mode, skills, bio, avatar, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const member of seed.members) {
    insertMember.run(
      member.id,
      member.slug,
      member.name,
      member.role,
      member.location,
      member.country,
      member.workMode,
      JSON.stringify(member.skills || []),
      member.bio,
      member.avatar,
      toBoolean(member.featured)
    );
  }

  const insertGallery = db.prepare(`
    INSERT INTO gallery (id, title, category, image, date)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const item of seed.gallery) {
    insertGallery.run(item.id, item.title, item.category, item.image, item.date);
  }
}

seedDatabase();

function getHomeContent() {
  const featuredEventSlug = db.prepare('SELECT value FROM settings WHERE key = ?').get('home_featured_event_slug')?.value || null;
  const highlightsRaw = db.prepare('SELECT value FROM settings WHERE key = ?').get('home_highlights')?.value || '[]';
  const featuredEventRow = featuredEventSlug
    ? db.prepare('SELECT * FROM events WHERE slug = ?').get(featuredEventSlug)
    : null;
  const upcomingEventRows = db.prepare('SELECT * FROM events WHERE status = ? ORDER BY date ASC LIMIT 3').all('upcoming');

  return {
    highlights: parseJson(highlightsRaw, []),
    featuredEvent: featuredEventRow ? mapEvent(featuredEventRow) : null,
    upcomingEvents: upcomingEventRows.map(mapEvent)
  };
}

function listEvents(filters = {}) {
  let query = 'SELECT * FROM events WHERE 1 = 1';
  const values = [];

  if (filters.status) {
    query += ' AND status = ?';
    values.push(filters.status);
  }

  if (filters.featured === true) {
    query += ' AND featured = 1';
  }

  query += ' ORDER BY date ASC';
  return db.prepare(query).all(...values).map(mapEvent);
}

function getEventBySlug(slug) {
  const row = db.prepare('SELECT * FROM events WHERE slug = ?').get(slug);
  return row ? mapEvent(row) : null;
}

function listMembers(filters = {}) {
  const rows = db.prepare('SELECT * FROM members ORDER BY featured DESC, name ASC').all().map(mapMember);
  const search = String(filters.search || '').trim().toLowerCase();
  const skill = String(filters.skill || '').trim().toLowerCase();
  const location = String(filters.location || '').trim().toLowerCase();

  return rows.filter((member) => {
    const matchesSearch = !search || [
      member.name,
      member.role,
      member.location,
      ...(member.skills || [])
    ].some((value) => String(value).toLowerCase().includes(search));
    const matchesSkill = !skill || member.skills.some((value) => value.toLowerCase() === skill);
    const matchesLocation = !location || member.location.toLowerCase() === location;
    return matchesSearch && matchesSkill && matchesLocation;
  });
}

function getMemberBySlug(slug) {
  const row = db.prepare('SELECT * FROM members WHERE slug = ?').get(slug);
  return row ? mapMember(row) : null;
}

function listGallery(filters = {}) {
  let query = 'SELECT * FROM gallery';
  const values = [];
  if (filters.category) {
    query += ' WHERE category = ?';
    values.push(filters.category);
  }
  query += ' ORDER BY date DESC';
  return db.prepare(query).all(...values).map(mapGallery);
}

function createApplication(payload) {
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    name: payload.name,
    email: payload.email,
    phone: payload.phone || '',
    linkedin: payload.linkedin || '',
    location: payload.location,
    experience: payload.experience,
    skills: payload.skills || ''
  };

  db.prepare(`
    INSERT INTO applications (id, created_at, status, name, email, phone, linkedin, location, experience, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.createdAt,
    record.status,
    record.name,
    record.email,
    record.phone,
    record.linkedin,
    record.location,
    record.experience,
    record.skills
  );

  return record;
}

function createDonation(payload) {
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'received',
    name: payload.name,
    email: payload.email,
    amount: Number(payload.amount),
    donationType: payload.donationType
  };

  db.prepare(`
    INSERT INTO donations (id, created_at, status, name, email, amount, donation_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.createdAt,
    record.status,
    record.name,
    record.email,
    record.amount,
    record.donationType
  );

  return record;
}

function createSponsorship(payload) {
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'new',
    name: payload.name,
    email: payload.email,
    company: payload.company,
    phone: payload.phone || '',
    event: payload.event,
    message: payload.message || ''
  };

  db.prepare(`
    INSERT INTO sponsorships (id, created_at, status, name, email, company, phone, event, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.createdAt,
    record.status,
    record.name,
    record.email,
    record.company,
    record.phone,
    record.event,
    record.message
  );

  return record;
}

function getAdminDashboard() {
  const applications = db.prepare('SELECT COUNT(*) AS count FROM applications').get().count;
  const donations = db.prepare('SELECT COUNT(*) AS count FROM donations').get().count;
  const sponsorships = db.prepare('SELECT COUNT(*) AS count FROM sponsorships').get().count;
  const members = db.prepare('SELECT COUNT(*) AS count FROM members').get().count;
  const totalDonationValue = db.prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM donations').get().total;

  return {
    stats: {
      applications,
      donations,
      sponsorships,
      members,
      totalDonationValue
    },
    recentApplications: listSubmissionRows('applications').slice(0, 5),
    recentDonations: listSubmissionRows('donations').slice(0, 5),
    recentSponsorships: listSubmissionRows('sponsorships').slice(0, 5)
  };
}

function listSubmissionRows(type) {
  const allowed = new Set(['applications', 'donations', 'sponsorships']);
  if (!allowed.has(type)) {
    throw new Error('INVALID_SUBMISSION_TYPE');
  }

  return db.prepare(`SELECT * FROM ${type} ORDER BY created_at DESC`).all().map((row) => {
    const normalized = {
      ...row,
      createdAt: row.created_at
    };
    delete normalized.created_at;

    if (type === 'donations') {
      normalized.donationType = row.donation_type;
      delete normalized.donation_type;
    }

    return normalized;
  });
}

function updateSubmissionStatus(type, id, status) {
  const allowed = new Set(['applications', 'donations', 'sponsorships']);
  if (!allowed.has(type)) {
    throw new Error('INVALID_SUBMISSION_TYPE');
  }

  db.prepare(`UPDATE ${type} SET status = ? WHERE id = ?`).run(status, id);
  return db.prepare(`SELECT * FROM ${type} WHERE id = ?`).get(id);
}

function createEvent(payload) {
  const record = {
    id: payload.id || randomUUID(),
    slug: payload.slug || slugify(payload.title),
    title: payload.title,
    category: payload.category,
    status: payload.status,
    date: payload.date,
    startTime: payload.startTime || '',
    endTime: payload.endTime || '',
    venue: payload.venue || '',
    city: payload.city || '',
    image: payload.image || '',
    excerpt: payload.excerpt || '',
    description: payload.description || '',
    registrationUrl: payload.registrationUrl || '#',
    featured: Boolean(payload.featured)
  };

  db.prepare(`
    INSERT INTO events (
      id, slug, title, category, status, date, start_time, end_time, venue, city,
      image, excerpt, description, registration_url, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.slug,
    record.title,
    record.category,
    record.status,
    record.date,
    record.startTime,
    record.endTime,
    record.venue,
    record.city,
    record.image,
    record.excerpt,
    record.description,
    record.registrationUrl,
    toBoolean(record.featured)
  );

  return record;
}

function updateEvent(id, payload) {
  const current = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!current) {
    return null;
  }

  const merged = {
    ...mapEvent(current),
    ...payload,
    id
  };

  db.prepare(`
    UPDATE events
    SET slug = ?, title = ?, category = ?, status = ?, date = ?, start_time = ?, end_time = ?,
        venue = ?, city = ?, image = ?, excerpt = ?, description = ?, registration_url = ?, featured = ?
    WHERE id = ?
  `).run(
    merged.slug || slugify(merged.title),
    merged.title,
    merged.category,
    merged.status,
    merged.date,
    merged.startTime || '',
    merged.endTime || '',
    merged.venue || '',
    merged.city || '',
    merged.image || '',
    merged.excerpt || '',
    merged.description || '',
    merged.registrationUrl || '#',
    toBoolean(merged.featured),
    id
  );

  return getEventBySlug(merged.slug || slugify(merged.title));
}

function deleteEvent(id) {
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

function createMember(payload) {
  const record = {
    id: payload.id || randomUUID(),
    slug: payload.slug || slugify(payload.name),
    name: payload.name,
    role: payload.role,
    location: payload.location,
    country: payload.country || 'Kenya',
    workMode: payload.workMode || '',
    skills: Array.isArray(payload.skills) ? payload.skills : String(payload.skills || '').split(',').map((item) => item.trim()).filter(Boolean),
    bio: payload.bio || '',
    avatar: payload.avatar || '',
    featured: Boolean(payload.featured)
  };

  db.prepare(`
    INSERT INTO members (
      id, slug, name, role, location, country, work_mode, skills, bio, avatar, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.slug,
    record.name,
    record.role,
    record.location,
    record.country,
    record.workMode,
    JSON.stringify(record.skills),
    record.bio,
    record.avatar,
    toBoolean(record.featured)
  );

  return record;
}

function updateMember(id, payload) {
  const current = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  if (!current) {
    return null;
  }

  const existing = mapMember(current);
  const mergedSkills = Array.isArray(payload.skills)
    ? payload.skills
    : payload.skills !== undefined
      ? String(payload.skills).split(',').map((item) => item.trim()).filter(Boolean)
      : existing.skills;

  const merged = {
    ...existing,
    ...payload,
    skills: mergedSkills,
    id
  };

  db.prepare(`
    UPDATE members
    SET slug = ?, name = ?, role = ?, location = ?, country = ?, work_mode = ?, skills = ?, bio = ?, avatar = ?, featured = ?
    WHERE id = ?
  `).run(
    merged.slug || slugify(merged.name),
    merged.name,
    merged.role,
    merged.location,
    merged.country || 'Kenya',
    merged.workMode || '',
    JSON.stringify(merged.skills),
    merged.bio || '',
    merged.avatar || '',
    toBoolean(merged.featured),
    id
  );

  return getMemberBySlug(merged.slug || slugify(merged.name));
}

function deleteMember(id) {
  db.prepare('DELETE FROM members WHERE id = ?').run(id);
}

function createGalleryItem(payload) {
  const record = {
    id: payload.id || randomUUID(),
    title: payload.title,
    category: payload.category,
    image: payload.image,
    date: payload.date
  };

  db.prepare('INSERT INTO gallery (id, title, category, image, date) VALUES (?, ?, ?, ?, ?)').run(
    record.id,
    record.title,
    record.category,
    record.image,
    record.date
  );

  return record;
}

function updateGalleryItem(id, payload) {
  const current = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  if (!current) {
    return null;
  }

  const merged = {
    ...mapGallery(current),
    ...payload,
    id
  };

  db.prepare('UPDATE gallery SET title = ?, category = ?, image = ?, date = ? WHERE id = ?').run(
    merged.title,
    merged.category,
    merged.image,
    merged.date,
    id
  );

  return merged;
}

function deleteGalleryItem(id) {
  db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
}

module.exports = {
  DB_PATH,
  getHomeContent,
  listEvents,
  getEventBySlug,
  listMembers,
  getMemberBySlug,
  listGallery,
  createApplication,
  createDonation,
  createSponsorship,
  getAdminDashboard,
  listSubmissionRows,
  updateSubmissionStatus,
  createEvent,
  updateEvent,
  deleteEvent,
  createMember,
  updateMember,
  deleteMember,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
