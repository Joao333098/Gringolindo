# 🚀 Gringolindo - Discord Bot Admin Panel

Sistema completo de administração para bots Discord com painel web moderno.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)

**🌐 Site:** https://sms-test.gratianweb.site

---

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
- **Estatísticas em tempo real**: Vendas, faturamento, tickets, membros Discord
- **Monitoramento do bot**: Status real via Discord API
- **Lista de usuários**: Usuários com saldo + avatares Discord
- **Métricas detalhadas**: Total de membros, saldo do sistema

### 💰 Gerenciamento de Saldo
- **Adicionar saldo**: Interface intuitiva com notificações automáticas
- **Remover saldo**: Sistema seguro com alertas e motivos
- **Histórico completo**: Logs de todas transações
- **Notificações Discord**: Components v2 automáticas

### ⚙️ Configurações Avançadas
- **Ticket Dinâmico**: Configurar categorias e canais
- **Gerência de Cargos**: Cargos automáticos (cliente/membro)  
- **Config do Bot**: Trocar token, restart automático
- **Pagamentos**: Mercado Pago + SMS24H API

### 🎨 Design
- **Mobile-first**: Interface otimizada para celular
- **Tema cyberpunk**: Cores vermelho/preto com efeitos glitch
- **Glassmorphism**: Efeitos visuais modernos
- **Navegação inferior**: Estilo iOS

---

## 🛠️ Tecnologias

- **Frontend**: React + TailwindCSS + Lucide Icons
- **Backend**: FastAPI + Python 3.12
- **Database**: JSON files (wio.db compatível)
- **Discord**: Discord.js v14 + Components v2

---

## 🚀 Deploy Rápido

### Gratian.pro (Recomendado)

Para deploy no Gratian.pro, use estas configurações:

```
Versão da Imagem: python_3.12
Arquivo Principal: main.py
Porta: 27687
Requirements: backend/requirements.txt
```

**📚 Documentação completa:** [DEPLOY_GRATIAN.md](DEPLOY_GRATIAN.md)  
**⚙️ Configurações prontas:** [GRATIAN_CONFIG.txt](GRATIAN_CONFIG.txt)

---

### Deploy Local

```bash
# Clone o repositório
git clone https://github.com/Joao333098/Gringolindo.git
cd Gringolindo

# Inicie automaticamente
python3 inicia.py

# Ou com Docker
docker-compose up -d
```

---

## 📁 Estrutura do Projeto

```
Gringolindo/
├── main.py                    # 🆕 Arquivo principal para hosting
├── inicia.py                  # Script de inicialização local
├── backend/
│   ├── server.py              # Backend FastAPI
│   ├── requirements.txt       # Dependências Python
│   └── DataBaseJson/          # Banco de dados JSON
├── frontend/
│   ├── src/                   # Código React
│   ├── public/                # Arquivos estáticos
│   └── package.json           # Dependências Node.js
├── config.json                # Configurações do bot Discord
├── Dockerfile                 # Imagem Docker
├── docker-compose.yml         # Orquestração Docker
├── DEPLOY_GRATIAN.md          # 🆕 Guia de deploy Gratian.pro
└── GRATIAN_CONFIG.txt         # 🆕 Configurações prontas
```

---

## 📱 Páginas

- **Login**: Autenticação segura (usuário: vovo)
- **Dashboard**: Painel principal com estatísticas
- **Ticket Config**: Configuração de tickets dinâmicos
- **Gerência Cargos**: Configuração de cargos automáticos
- **Gerenciar Saldo**: Adicionar/remover saldo de usuários
- **Configuração Bot**: Gerenciar token e status do bot
- **Pagamentos**: Configurar APIs de pagamento
- **Logs Entrega**: Histórico de transações

---

## 📚 Documentação da API

### Endpoints Principais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/docs` | GET | Documentação Swagger |
| `/api/auth/login` | POST | Login |
| `/api/dashboard/stats` | GET | Estatísticas |
| `/api/bot/status` | GET | Status do bot |

**Documentação completa:** https://sms-test.gratianweb.site/docs

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz (use `.env.example` como base):

```env
# Backend
PORT=27687
HOST=0.0.0.0
JWT_SECRET=seu_secret_aqui

# Frontend
REACT_APP_BACKEND_URL=http://localhost:27687

# Bot Discord (opcional)
DISCORD_TOKEN=seu_token_aqui
```

### Config.json

Configure o bot Discord em `config.json`:

```json
{
  "token": "seu_token_discord",
  "prefix": "!",
  "ownerID": "seu_id"
}
```

---

## 🚀 Comandos Úteis

### Desenvolvimento Local

```bash
# Instalar e iniciar tudo
python3 inicia.py

# Apenas backend (porta 27687)
python3 main.py

# Apenas frontend
cd frontend && yarn start

# Apenas bot Discord
node index.js
```

### Docker

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Testes

```bash
# Health check
curl http://localhost:27687/health

# Documentação
open http://localhost:27687/docs
```

---

## 🌐 Deploy em Produção

### Gratian.pro

1. Acesse https://dashboard.gratian.pro
2. Crie nova aplicação
3. Configure:
   - **Versão:** `python_3.12`
   - **Arquivo:** `main.py`
   - **Porta:** `27687`
   - **Requirements:** `backend/requirements.txt`
4. Faça upload do projeto
5. Inicie a aplicação

**📖 Guia completo:** [DEPLOY_GRATIAN.md](DEPLOY_GRATIAN.md)

### Outros Hosts

- **Heroku:** Use `Procfile`
- **Railway:** Detecção automática
- **Replit:** Use `main.py`
- **VPS:** Use `inicia.py` ou Docker

---

## 🔒 Segurança

- ✅ JWT tokens com expiração
- ✅ Senha criptografada com salt
- ✅ Validação de todas entradas
- ✅ Status real do bot via Discord API
- ✅ CORS configurado
- ✅ Health check endpoint

---

## 🛠️ Troubleshooting

### Erro: "Module not found"
```bash
pip3 install -r backend/requirements.txt
```

### Erro: "Port already in use"
```bash
# Alterar porta
export PORT=8080
python3 main.py
```

### Erro: "Cannot connect to backend"
```bash
# Verificar se backend está rodando
curl http://localhost:27687/health
```

---

## 📄 Licença

MIT License - Desenvolvido por E1 Agent - Emergent Labs

---

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📞 Suporte

- **Issues:** https://github.com/Joao333098/Gringolindo/issues
- **Documentação:** [INSTALACAO.md](INSTALACAO.md)
- **Deploy:** [DEPLOY_GRATIAN.md](DEPLOY_GRATIAN.md)
- **Site:** https://sms-test.gratianweb.site

---

## 🎯 Status

- ✅ Backend: Operacional
- ✅ Frontend: Operacional  
- ✅ API: Documentada (15 endpoints)
- ✅ Deploy: Automatizado
- ✅ Docker: Suportado
- ✅ Gratian.pro: Configurado

---

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**

**🌐 Acesse:** https://sms-test.gratianweb.site
