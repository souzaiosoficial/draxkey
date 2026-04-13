const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'keys.json');

app.use(cors());
app.use(express.json());

// 🔥 SERVIR ARQUIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 ROTA PRINCIPAL (RESOLVE O ERRO)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 FALLBACK (QUALQUER ROTA ABRE O HTML)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Load/save keys
function loadKeys() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveKeys(keys) {
  fs.writeFileSync(DB_FILE, JSON.stringify(keys, null, 2));
}

// ADMIN PASSWORD
const ADMIN_PASS = process.env.ADMIN_PASS || 'draxadmin@';

// ===== API ROUTES =====

// Validate admin password
app.post('/api/admin/auth', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Senha incorreta' });
  }
});

// Get all keys (admin)
app.post('/api/admin/keys', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
  res.json(loadKeys());
});

// Generate key (admin)
app.post('/api/admin/generate', (req, res) => {
  const { password, maxUsers, duration } = req.body;
  if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = n => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const key = `DRAX-${seg(4)}-${seg(4)}-${seg(4)}`;
  const expires = duration === 0 ? 0 : Date.now() + duration * 24 * 60 * 60 * 1000;

  const keys = loadKeys();
  keys.push({
    key,
    maxUsers: maxUsers || 1,
    duration,
    expires,
    created: Date.now(),
    activeUsers: 0
  });

  saveKeys(keys);
  res.json({ ok: true, key });
});

// Delete key (admin)
app.post('/api/admin/delete', (req, res) => {
  const { password, key } = req.body;
  if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

  const keys = loadKeys().filter(k => k.key !== key);
  saveKeys(keys);
  res.json({ ok: true });
});

// Validate key (client)
app.post('/api/validate', (req, res) => {
  const { key } = req.body;
  const keys = loadKeys();

  const entry = keys.find(k => k.key === key.toUpperCase());

  if (!entry) {
    return res.json({ valid: false, reason: 'Chave inválida.' });
  }

  if (entry.duration !== 0 && Date.now() > entry.expires) {
    return res.json({ valid: false, reason: 'Chave expirada.' });
  }

  if (entry.activeUsers >= entry.maxUsers) {
    return res.json({ valid: false, reason: 'Limite de usuários atingido.' });
  }

  res.json({ valid: true });
});

app.listen(PORT, () => {
  console.log(`DRAX server running on port ${PORT}`);
});
