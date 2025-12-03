require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db.config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// --- Rota de Teste ---
app.get('/api', (req, res) => {
  res.json({ message: 'Backend do Portal do Transportador está no ar!' });
});

// --- Rotas de Autenticação ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    // Compara a senha fornecida com o hash armazenado no banco
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Remove o hash da senha do objeto de usuário antes de enviar a resposta
    const { password_hash, ...safeUser } = user;
    safeUser.token = 'local-jwt-token-placeholder'; // Token de exemplo

    res.json(safeUser);
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// --- Rotas de NF-e ---
app.get('/api/nfes', async (req, res) => {
  const { carrierId, issueDate, number, route } = req.query;

  try {
    let query = 'SELECT * FROM nfes';
    const params = [];
    const conditions = [];

    if (carrierId && carrierId !== 'ALL') {
      params.push(carrierId);
      conditions.push(`"carrierId" = $${params.length}`);
    }
    if (issueDate) {
        // Converte a data para garantir que o fuso horário não afete a busca
        params.push(issueDate);
        conditions.push(`"issuedAt"::date = $${params.length}::date`);
    }
    if (number) {
      params.push(`%${number}%`);
      conditions.push(`number ILIKE $${params.length}`);
    }
    if (route) {
        params.push(`%${route}%`);
        conditions.push(`route ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY "issuedAt" DESC';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar NF-es:', err);
    res.status(500).json({ message: 'Erro ao buscar dados das notas fiscais.' });
  }
});

// --- Rotas de Administração (Usuários) ---
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, email, role, "carrierId" FROM users ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { role, carrierId } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE users SET role = $1, "carrierId" = $2 WHERE id = $3 RETURNING id, name, email, role, "carrierId"',
            [role, carrierId === '' ? null : carrierId, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

// --- Rotas de Administração (Transportadoras) ---
app.get('/api/carriers', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM transportadoras ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar transportadoras.' });
    }
});

app.post('/api/carriers', async (req, res) => {
    const { name, cnpj } = req.body;
    const newId = 'c' + Math.random().toString(36).substr(2, 9);
    try {
        const { rows } = await db.query(
            'INSERT INTO transportadoras(id, name, cnpj) VALUES($1, $2, $3) RETURNING *',
            [newId, name, cnpj]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao criar transportadora.' });
    }
});

app.put('/api/carriers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, cnpj } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE transportadoras SET name = $1, cnpj = $2 WHERE id = $3 RETURNING *',
            [name, cnpj, id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar transportadora.' });
    }
});

app.delete('/api/carriers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM transportadoras WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Erro ao excluir transportadora.' });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});