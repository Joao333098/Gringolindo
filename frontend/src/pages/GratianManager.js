import React, { useState, useEffect } from 'react';

export default function GratianManager() {
  const [config, setConfig] = useState({
    api_key: '',
    bot_app_id: '',
    configured: false
  });
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gratian/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gratian/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          api_key: config.api_key,
          bot_app_id: config.bot_app_id
        })
      });
      const data = await response.json();
      setMessage(data.message || 'Configuração salva!');
      loadConfig();
    } catch (error) {
      setMessage('Erro ao salvar configuração');
    }
    setLoading(false);
  };

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gratian/bot/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setMessage('Erro ao carregar status');
    }
    setLoading(false);
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gratian/bot/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      setLogs(JSON.stringify(data, null, 2));
    } catch (error) {
      setMessage('Erro ao carregar logs');
    }
    setLoading(false);
  };

  const performAction = async (action) => {
    if (!config.bot_app_id && action !== 'create') {
      setMessage('Configure o App ID primeiro!');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gratian/bot/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          app_id: config.bot_app_id,
          action: action
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Ação '${action}' executada com sucesso!`);
        if (action === 'create' && data.data?.appId) {
          setConfig({...config, bot_app_id: data.data.appId});
        }
        loadStatus();
      } else {
        setMessage(data.message || `Erro ao executar '${action}'`);
      }
    } catch (error) {
      setMessage(`Erro ao executar '${action}'`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">
            🌐 Gerenciador Gratian.pro
          </h1>
          <p className="text-gray-400">
            Controle o bot Discord remotamente via API do Gratian.pro
          </p>
        </div>

        {/* Mensagem */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Erro') || message.includes('erro') 
              ? 'bg-red-900/50 border border-red-500' 
              : 'bg-green-900/50 border border-green-500'
          }`}>
            {message}
          </div>
        )}

        {/* Configuração */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚙️ Configuração</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key do Gratian.pro
              </label>
              <input
                type="password"
                value={config.api_key}
                onChange={(e) => setConfig({...config, api_key: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="grt_live_..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenha em: <a href="https://dashboard.gratian.pro/profile/api-keys" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Dashboard → Perfil → API Keys</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                App ID do Bot (opcional - será preenchido automaticamente)
              </label>
              <input
                type="text"
                value={config.bot_app_id}
                onChange={(e) => setConfig({...config, bot_app_id: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="13073a8e..."
              />
              <p className="text-xs text-gray-500 mt-1">
                ID da aplicação "Bot sms" no Gratian.pro
              </p>
            </div>

            <button
              onClick={saveConfig}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : '💾 Salvar Configuração'}
            </button>
          </div>
        </div>

        {/* Ações do Bot */}
        {config.configured && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">🤖 Gerenciar Bot</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => performAction('create')}
                disabled={loading || config.bot_app_id}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ➕ Criar App
              </button>
              
              <button
                onClick={() => performAction('deploy')}
                disabled={loading || !config.bot_app_id}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                🚀 Deploy
              </button>
              
              <button
                onClick={() => performAction('start')}
                disabled={loading || !config.bot_app_id}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ▶️ Iniciar
              </button>
              
              <button
                onClick={() => performAction('stop')}
                disabled={loading || !config.bot_app_id}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ⏹️ Parar
              </button>
              
              <button
                onClick={() => performAction('restart')}
                disabled={loading || !config.bot_app_id}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                🔄 Reiniciar
              </button>
              
              <button
                onClick={loadStatus}
                disabled={loading || !config.bot_app_id}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                📊 Status
              </button>
            </div>

            <button
              onClick={loadLogs}
              disabled={loading || !config.bot_app_id}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📜 Ver Logs
            </button>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">📊 Status do Bot</h2>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-green-400">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}

        {/* Logs */}
        {logs && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">📜 Logs</h2>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-300 max-h-96">
              {logs}
            </pre>
          </div>
        )}

        {/* Instruções */}
        {!config.configured && (
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <h2 className="text-xl font-bold text-blue-400 mb-3">ℹ️ Como Usar</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Obtenha sua API Key em: <a href="https://dashboard.gratian.pro/profile/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Gratian.pro → Perfil → API Keys</a></li>
              <li>Cole a API Key no campo acima</li>
              <li>Se já criou a aplicação "Bot sms", cole o App ID (opcional)</li>
              <li>Clique em "Salvar Configuração"</li>
              <li>Use os botões para gerenciar o bot remotamente!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
