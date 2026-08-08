import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.join(__dirname, 'data');

// Security: Enforce JSON Payload Body Size Limits (Prevent DoS memory flood)
app.use(cors());
app.use(express.json({ limit: '500kb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Security: In-Memory IP Rate Limiter & Anti-Spam Middleware
const rateLimitMap = new Map();

const rateLimiter = (maxRequests, windowMs, errorMessage) => (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ error: errorMessage || 'Too many requests. Please wait a moment.' });
  }

  next();
};

// Security: Apply General API Rate Limiting (120 req/min) & Auth Anti-Spam (6 req/min)
const generalRateLimit = rateLimiter(120, 60000, 'Rate limit exceeded. Please slow down.');
const authRateLimit = rateLimiter(6, 60000, 'Too many login/register attempts. Please wait 60 seconds.');

app.use('/api', generalRateLimit);

// Helper to hash password with SHA-256 + Pepper
const hashPassword = (pwd) => {
  return crypto.createHash('sha256').update(pwd + 'PITRACK_SECURE_PEPPER_2026').digest('hex');
};

// Helper to get sanitized guest DB filepath (Prevent Path Traversal Attack)
const getDbFilePath = (req) => {
  const rawId = req.headers['x-guest-id'] || 'default_guest';
  const cleanId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `expenses_${cleanId}.json`);
};

// Helper to read DB for specific guest/user
const readExpenses = (req) => {
  const rawId = req.headers['x-guest-id'] || 'default_guest';
  const cleanId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR);
      // Look for exact prefix match e.g. expenses_usr_hout_gmail_com...
      const matchingFiles = files.filter(f => f.startsWith(`expenses_${cleanId}`));
      if (matchingFiles.length > 0) {
        // Pick the largest / newest matching file
        matchingFiles.sort((a, b) => {
          const statA = fs.statSync(path.join(DATA_DIR, a));
          const statB = fs.statSync(path.join(DATA_DIR, b));
          return statB.mtimeMs - statA.mtimeMs;
        });

        const targetFile = matchingFiles[0];
        const raw = fs.readFileSync(path.join(DATA_DIR, targetFile), 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }

    const defaultFile = path.join(DATA_DIR, `expenses_${cleanId}.json`);
    if (fs.existsSync(defaultFile)) {
      const raw = fs.readFileSync(defaultFile, 'utf8');
      return JSON.parse(raw);
    }
    return [];
  } catch (e) {
    return [];
  }
};

// Helper to write DB for specific guest
const writeExpenses = (req, data) => {
  const file = getDbFilePath(req);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// REST API Endpoints with Anonymous Guest Isolation
app.get('/api/expenses', (req, res) => {
  const expenses = readExpenses(req);
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const expenses = readExpenses(req);
  const newItem = {
    ...req.body,
    id: req.body.id || ('exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000)),
    createdAt: req.body.createdAt || Date.now(),
  };
  const updated = [newItem, ...expenses.filter(e => e.id !== newItem.id)];
  writeExpenses(req, updated);
  res.status(201).json(newItem);
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const expenses = readExpenses(req);
  const updated = expenses.map(e => (e.id === id ? { ...e, ...req.body } : e));
  writeExpenses(req, updated);
  res.json({ success: true });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const expenses = readExpenses(req);
  const updated = expenses.filter(e => e.id !== id);
  writeExpenses(req, updated);
  res.json({ success: true });
});

app.post('/api/expenses/reset', (req, res) => {
  writeExpenses(req, []);
  res.json({ success: true });
});

// Helper for User Accounts DB
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const readUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) { return []; }
};
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Security: Email Regex Validator
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Auth API: Register / Link Guest Account (Rate Limited: 6 req/min)
app.post('/api/auth/register', authRateLimit, (req, res) => {
  const { email, password, name, guestId } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  // Strict Validation
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length < 6 || password.length > 64) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const users = readUsers();
  const existing = users.find(u => u.email === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'Account already exists. Please log in.' });
  }

  // Numeric Auto-Increment pkid (1, 2, 3...)
  const nextPkid = users.reduce((max, u) => (typeof u.pkid === 'number' && u.pkid > max ? u.pkid : max), 0) + 1;
  const now = Date.now();
  const newUser = {
    pkid: nextPkid,
    accountId: nextPkid.toString(),
    email: cleanEmail,
    passwordHash: hashPassword(password),
    name: (name || cleanEmail.split('@')[0]).trim(),
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  writeUsers(users);

  // If user has existing guest data, migrate/bind it to pkid
  if (guestId) {
    const guestFile = path.join(DATA_DIR, `expenses_${String(guestId).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
    const userFile = path.join(DATA_DIR, `expenses_${pkid}.json`);
    if (fs.existsSync(guestFile) && !fs.existsSync(userFile)) {
      fs.copyFileSync(guestFile, userFile);
    }
  }

  res.status(201).json({
    user: { pkid: newUser.pkid, accountId: newUser.pkid, email: newUser.email, name: newUser.name },
    token: 'jwt-' + newUser.pkid,
  });
});

// Auth API: Login (Rate Limited: 6 req/min)
app.post('/api/auth/login', authRateLimit, (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readUsers();
  const pwdHash = hashPassword(password);

  const user = users.find(u => u.email === cleanEmail && (u.passwordHash === pwdHash || u.password === password));

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const pkid = user.pkid || user.accountId || ('usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_'));

  res.json({
    user: { pkid, accountId: pkid, email: user.email, name: user.name },
    token: 'jwt-' + pkid,
  });
});

// Universal Account Cloud Sync Endpoint
app.get('/api/sync', (req, res) => {
  const pkid = req.query.pkid || req.query.accountId || req.headers['x-guest-id'];
  if (!pkid) return res.status(400).json({ error: 'pkid parameter is required' });
  const cleanId = String(pkid).replace(/[^a-zA-Z0-9_-]/g, '_');
  const accountFile = path.join(DATA_DIR, `account_${cleanId}.json`);

  if (fs.existsSync(accountFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(accountFile, 'utf8'));
      return res.json(data);
    } catch (e) {}
  }

  // Fallback to individual expenses file if account file doesn't exist yet
  const expFile = path.join(DATA_DIR, `expenses_${cleanId}.json`);
  let expenses = [];
  if (fs.existsSync(expFile)) {
    try { expenses = JSON.parse(fs.readFileSync(expFile, 'utf8')); } catch (e) {}
  }

  res.json({ expenses, reminders: [], trips: [], targets: null, goals: null, cycleHistory: [] });
});

app.post('/api/sync', (req, res) => {
  const accountId = req.body.accountId || req.headers['x-guest-id'];
  if (!accountId) return res.status(400).json({ error: 'Account ID required' });
  const cleanId = String(accountId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const accountFile = path.join(DATA_DIR, `account_${cleanId}.json`);

  try {
    let existing = {};
    if (fs.existsSync(accountFile)) {
      try { existing = JSON.parse(fs.readFileSync(accountFile, 'utf8')); } catch (e) {}
    }

    const updated = {
      ...existing,
      ...req.body,
      updatedAt: Date.now(),
    };

    fs.writeFileSync(accountFile, JSON.stringify(updated, null, 2));

    // Also write expenses to expenses_ clean file for backwards compatibility
    if (req.body.expenses && Array.isArray(req.body.expenses)) {
      const expFile = path.join(DATA_DIR, `expenses_${cleanId}.json`);
      fs.writeFileSync(expFile, JSON.stringify(req.body.expenses, null, 2));
    }

    res.json({ success: true, updatedAt: updated.updatedAt });
  } catch (e) {
    res.status(500).json({ error: 'Failed to sync data' });
  }
});

// Serve static frontend bundle from dist/
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

function startServer(portToTry) {
  const server = app
    .listen(portToTry, () => {
      console.log(`Expense Tracker Production Server running on port ${portToTry}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
        startServer(portToTry + 1);
      } else {
        console.error('Server error:', err);
      }
    });
}

startServer(PORT);
