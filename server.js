import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to get sanitized guest DB filepath
const getDbFilePath = (req) => {
  const rawId = req.headers['x-guest-id'] || 'default_guest';
  const cleanId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `expenses_${cleanId}.json`);
};

// Helper to read DB for specific guest
const readExpenses = (req) => {
  const file = getDbFilePath(req);
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
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

// Auth API: Register / Link Guest Account
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, guestId } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Account already exists. Please log in.' });
  }

  const accountId = 'usr_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
  const newUser = {
    accountId,
    email: email.toLowerCase(),
    password, // demo simple hash/string
    name: name || email.split('@')[0],
    createdAt: Date.now(),
  };

  users.push(newUser);
  writeUsers(users);

  // If user has existing guest data, migrate/bind it to accountId
  if (guestId) {
    const guestFile = path.join(DATA_DIR, `expenses_${String(guestId).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
    const userFile = path.join(DATA_DIR, `expenses_${accountId}.json`);
    if (fs.existsSync(guestFile) && !fs.existsSync(userFile)) {
      fs.copyFileSync(guestFile, userFile);
    }
  }

  res.status(201).json({
    user: { accountId: newUser.accountId, email: newUser.email, name: newUser.name },
    token: 'jwt-' + newUser.accountId,
  });
});

// Auth API: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    user: { accountId: user.accountId, email: user.email, name: user.name },
    token: 'jwt-' + user.accountId,
  });
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
