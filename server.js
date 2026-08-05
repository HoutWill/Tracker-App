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
const DB_FILE = path.join(DATA_DIR, 'expenses.json');

app.use(cors());
app.use(express.json());

// Ensure data directory & initial file exist (Default 0 entries)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));

// Helper to read DB
const readExpenses = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

// Helper to write DB
const writeExpenses = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// REST API Endpoints
app.get('/api/expenses', (req, res) => {
  const expenses = readExpenses();
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const expenses = readExpenses();
  const newItem = {
    ...req.body,
    id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    createdAt: Date.now(),
  };
  const updated = [newItem, ...expenses];
  writeExpenses(updated);
  res.status(201).json(newItem);
});

app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const expenses = readExpenses();
  const updated = expenses.map(e => (e.id === id ? { ...e, ...req.body } : e));
  writeExpenses(updated);
  res.json({ success: true });
});

app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const expenses = readExpenses();
  const updated = expenses.filter(e => e.id !== id);
  writeExpenses(updated);
  res.json({ success: true });
});

app.post('/api/expenses/reset', (req, res) => {
  writeExpenses([]);
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
