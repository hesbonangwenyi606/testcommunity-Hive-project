# Test Hive

Static frontend pages backed by a lightweight Node HTTP server, SQLite database, and admin dashboard.

## Run locally

```bash
npm start
```

The server starts on `http://127.0.0.1:3000` by default.

## Admin dashboard
- Open `/admin.html`
- Default username: `admin`
- Default password: `changeme123`

Override credentials with:

```bash
ADMIN_USERNAME=your_admin ADMIN_PASSWORD=strong_password npm start
```

## Available API routes

- `GET /api/health`
- `GET /api/content/home`
- `GET /api/events`
- `GET /api/events/:slug`
- `GET /api/members`
- `GET /api/members/:slug`
- `GET /api/gallery`
- `POST /api/applications`
- `POST /api/donations`
- `POST /api/sponsorships`

## Data files
- SQLite database: `data/testhive.sqlite`
- Seed content source: `data/content.json`
#
