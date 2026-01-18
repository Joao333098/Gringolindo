# Relatório de Correção - Gerenciador Gratian.pro

## 1. Problema Identificado
O erro **401 Unauthorized** ocorria porque o componente `GratianManager.js` no frontend estava tentando recuperar o token de autenticação do `localStorage` usando a chave incorreta.

*   **Chave usada no GratianManager.js:** `localStorage.getItem('token')`
*   **Chave correta (definida no Login.js):** `localStorage.getItem('admin_token')`

Como o token enviado era `null` ou `undefined`, o backend FastAPI retornava erro de autorização (401).

## 2. Correção Aplicada
O arquivo `frontend/src/pages/GratianManager.js` foi atualizado para usar a chave correta:

```javascript
// Antes
'Authorization': `Bearer ${localStorage.getItem('token')}`

// Depois (Corrigido)
'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
```

## 3. Como Aplicar no seu Ambiente
Se você estiver usando o código localmente, basta atualizar o arquivo `frontend/src/pages/GratianManager.js` com a alteração acima ou baixar a versão corrigida do repositório.

## 4. Instalação do Node.js
Para instalar o Node.js e as dependências no seu servidor (Ubuntu/Debian):

```bash
# 1. Instalar Node.js (Versão 18 ou superior recomendada)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar dependências do Bot (na raiz do projeto)
npm install

# 3. Instalar dependências do Frontend
cd frontend
npm install # ou yarn install
```

## 5. Verificação da API Gratian.pro
A integração utiliza a **API v2** da Gratian.pro:
*   **URL Base:** `https://dashboard.gratian.pro/api/v2`
*   **Autenticação:** Cabeçalho `Authorization: Bearer <sua_api_key>`

O código no backend (`backend/gratian_manager.py`) já segue este padrão corretamente.
