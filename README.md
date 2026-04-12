# DRAX EXTERNAL — Servidor

## Como subir no Railway (grátis):

### 1. Crie conta no Railway
Acesse https://railway.app e crie conta grátis com GitHub.

### 2. Suba o projeto
- Clique em "New Project" → "Deploy from GitHub repo"
- Ou arraste a pasta do projeto

### Alternativa: Deploy pelo terminal
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Configure variável de ambiente (opcional)
No painel do Railway:
- ADMIN_PASS = sua_senha_aqui (padrão: draxadmin@)

### 4. Pegue a URL
Após o deploy, Railway gera uma URL tipo:
https://drax-server-production.up.railway.app

### 5. Configure no app
- Abra o app → entre como admin (DRAX-ADMIN-2024)
- Clique em "Configurar Servidor"
- Cole a URL do Railway
- Pronto! Agora as chaves funcionam para qualquer cliente

## Estrutura
- server.js     — servidor Node.js/Express
- keys.json     — banco de dados das chaves (criado automaticamente)
- public/       — frontend (index.html)
- package.json  — dependências

## API
- POST /api/validate          — valida chave (cliente)
- POST /api/admin/auth        — autentica admin
- POST /api/admin/keys        — lista chaves
- POST /api/admin/generate    — gera chave
- POST /api/admin/delete      — exclui chave
