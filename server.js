import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
let PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.join(__dirname, 'data');

// Security: Add Standard HTTP Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Security: Enforce JSON Payload Body Size Limits & Safe CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'],
}));
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

// Helper to sanitize guest/user identifiers (Prevent Path Traversal & DOS)
const sanitizeId = (id) => {
  if (!id) return 'default_guest';
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64);
};

// Helper to get sanitized guest DB filepath (Prevent Path Traversal Attack)
const getDbFilePath = (req) => {
  const rawId = req.headers['x-guest-id'] || 'default_guest';
  const cleanId = sanitizeId(rawId);
  return path.join(DATA_DIR, `expenses_${cleanId}.json`);
};

// Helper to read DB for specific guest/user
const readExpenses = (req) => {
  const rawId = req.headers['x-guest-id'] || 'default_guest';
  const cleanId = sanitizeId(rawId);

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
// REST API Endpoints with Anonymous Guest Isolation & Strict CRUD Validation
app.get('/api/expenses', (req, res) => {
  const expenses = readExpenses(req);
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { amount, title, date, currency, type, paymentMethod, categoryId, categoryName, categoryIcon, categoryColor, notes, tripId } = req.body;

  // Strict Amount Validation: Must be finite, positive number, max 1 billion
  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000000) {
    return res.status(400).json({ error: 'Valid positive amount required (max 1,000,000,000)' });
  }

  // Strict Title Validation: Non-empty string, max 150 chars
  const rawTitle = typeof title === 'string' ? title.trim() : '';
  if (!rawTitle) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const cleanTitle = rawTitle.slice(0, 150);

  // Strict Date Validation: YYYY-MM-DD or Cambodia UTC+7 fallback
  const cleanDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)
    ? date.slice(0, 10)
    : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Phnom_Penh' }).format(new Date());

  // Strict Enum & Field Validation
  const cleanType = type === 'SAVING' ? 'SAVING' : 'EXPENSE';
  const cleanCurrency = currency === 'KHR' ? 'KHR' : 'USD';
  const cleanPayment = typeof paymentMethod === 'string' ? paymentMethod.slice(0, 30) : 'Cash';
  const cleanCatId = typeof categoryId === 'string' && categoryId.trim() ? categoryId.slice(0, 50) : (cleanType === 'SAVING' ? 'cat-saving-vault' : 'cat-food');
  const cleanCatName = typeof categoryName === 'string' && categoryName.trim() ? categoryName.slice(0, 50) : 'General';
  const cleanCatIcon = typeof categoryIcon === 'string' && categoryIcon.trim() ? categoryIcon.slice(0, 50) : 'receipt';
  const cleanCatColor = typeof categoryColor === 'string' && categoryColor.trim() ? categoryColor.slice(0, 30) : '#6C5CE7';
  const cleanNotes = typeof notes === 'string' ? notes.slice(0, 1000) : '';
  const cleanTripId = typeof tripId === 'string' && tripId.trim() ? tripId.slice(0, 80) : undefined;

  const expenses = readExpenses(req);
  const cleanId = req.body.id ? String(req.body.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100) : ('exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
  const cleanCreatedAt = typeof req.body.createdAt === 'number' && isFinite(req.body.createdAt) ? req.body.createdAt : Date.now();

  const newItem = {
    id: cleanId,
    title: cleanTitle,
    amount: parsedAmount,
    currency: cleanCurrency,
    type: cleanType,
    categoryId: cleanCatId,
    categoryName: cleanCatName,
    categoryIcon: cleanCatIcon,
    categoryColor: cleanCatColor,
    date: cleanDate,
    paymentMethod: cleanPayment,
    notes: cleanNotes,
    tripId: cleanTripId,
    createdAt: cleanCreatedAt,
  };

  const updated = [newItem, ...expenses.filter(e => e.id !== newItem.id)].slice(0, 5000);
  writeExpenses(req, updated);
  res.status(201).json(newItem);
});

app.put('/api/expenses/:id', (req, res) => {
  const rawId = req.params.id;
  if (!rawId || typeof rawId !== 'string') {
    return res.status(400).json({ error: 'Valid expense id required' });
  }
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
  const expenses = readExpenses(req);
  const index = expenses.findIndex(e => e.id === cleanId);
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const existing = expenses[index];
  const updates = {};

  if (req.body.amount !== undefined) {
    const parsedAmount = typeof req.body.amount === 'number' ? req.body.amount : parseFloat(req.body.amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000000) {
      return res.status(400).json({ error: 'Valid positive amount required (max 1,000,000,000)' });
    }
    updates.amount = parsedAmount;
  }

  if (req.body.title !== undefined) {
    const rawTitle = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!rawTitle) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    updates.title = rawTitle.slice(0, 150);
  }

  if (req.body.date !== undefined && typeof req.body.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(req.body.date)) {
    updates.date = req.body.date.slice(0, 10);
  }

  if (req.body.type !== undefined) {
    updates.type = req.body.type === 'SAVING' ? 'SAVING' : 'EXPENSE';
  }

  if (req.body.currency !== undefined) {
    updates.currency = req.body.currency === 'KHR' ? 'KHR' : 'USD';
  }

  if (req.body.paymentMethod !== undefined && typeof req.body.paymentMethod === 'string') {
    updates.paymentMethod = req.body.paymentMethod.slice(0, 30);
  }

  if (req.body.categoryId !== undefined && typeof req.body.categoryId === 'string') {
    updates.categoryId = req.body.categoryId.slice(0, 50);
  }

  if (req.body.categoryName !== undefined && typeof req.body.categoryName === 'string') {
    updates.categoryName = req.body.categoryName.slice(0, 50);
  }

  if (req.body.categoryIcon !== undefined && typeof req.body.categoryIcon === 'string') {
    updates.categoryIcon = req.body.categoryIcon.slice(0, 50);
  }

  if (req.body.categoryColor !== undefined && typeof req.body.categoryColor === 'string') {
    updates.categoryColor = req.body.categoryColor.slice(0, 30);
  }

  if (req.body.notes !== undefined && typeof req.body.notes === 'string') {
    updates.notes = req.body.notes.slice(0, 1000);
  }

  if (req.body.tripId !== undefined) {
    if (typeof req.body.tripId === 'string' && req.body.tripId.trim() && req.body.tripId !== 'GENERAL') {
      updates.tripId = req.body.tripId.slice(0, 80);
    } else {
      delete existing.tripId;
      updates.tripId = undefined;
    }
  }

  expenses[index] = { ...existing, ...updates, updatedAt: Date.now() };
  writeExpenses(req, expenses);
  res.json({ success: true, item: expenses[index] });
});

app.delete('/api/expenses/:id', (req, res) => {
  const rawId = req.params.id;
  if (!rawId || typeof rawId !== 'string') {
    return res.status(400).json({ error: 'Valid expense id required' });
  }
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
  const expenses = readExpenses(req);
  const exists = expenses.some(e => e.id === cleanId);
  const updated = expenses.filter(e => e.id !== cleanId);
  writeExpenses(req, updated);
  res.json({ success: true, deleted: exists });
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
    const guestFile = path.join(DATA_DIR, `expenses_${sanitizeId(guestId)}.json`);
    const userFile = path.join(DATA_DIR, `expenses_${newUser.pkid}.json`);
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
  const cleanId = sanitizeId(pkid);
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
  const cleanId = sanitizeId(accountId);
  const accountFile = path.join(DATA_DIR, `account_${cleanId}.json`);

  try {
    let existing = {};
    if (fs.existsSync(accountFile)) {
      try { existing = JSON.parse(fs.readFileSync(accountFile, 'utf8')); } catch (e) {}
    }

    const payload = {};
    if (req.body.expenses && Array.isArray(req.body.expenses)) {
      payload.expenses = req.body.expenses.slice(0, 5000);
    }
    if (req.body.reminders && Array.isArray(req.body.reminders)) {
      payload.reminders = req.body.reminders.slice(0, 2000);
    }
    if (req.body.trips && Array.isArray(req.body.trips)) {
      payload.trips = req.body.trips.slice(0, 500);
    }
    if (req.body.targets && typeof req.body.targets === 'object') {
      payload.targets = req.body.targets;
    }
    if (req.body.goals && typeof req.body.goals === 'object') {
      payload.goals = req.body.goals;
    }
    if (req.body.cycleHistory && Array.isArray(req.body.cycleHistory)) {
      payload.cycleHistory = req.body.cycleHistory.slice(0, 500);
    }

    const updated = {
      ...existing,
      ...payload,
      pkid: cleanId,
      accountId: cleanId,
      updatedAt: Date.now(),
    };

    fs.writeFileSync(accountFile, JSON.stringify(updated, null, 2));

    // Also write expenses to expenses_ clean file for backwards compatibility
    if (payload.expenses) {
      const expFile = path.join(DATA_DIR, `expenses_${cleanId}.json`);
      fs.writeFileSync(expFile, JSON.stringify(payload.expenses, null, 2));
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
