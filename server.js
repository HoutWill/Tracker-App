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
