import React, { useState, useEffect } from 'react';
import { Bot, Key, Save, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const BotConfig = () => {
  const [config, setConfig] = useState({
    token: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botStatus, setBotStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetchConfig();
    checkBotStatus();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/bot`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig({ token: data.token || '' });
      } else {
        toast.error('Erro ao carregar configuração do bot');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const checkBotStatus = async () => {
    setCheckingStatus(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bot/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBotStatus(data);
      } else {
        setBotStatus({ status: 'error', message: 'Erro ao verificar status' });
      }
    } catch (error) {
      setBotStatus({ status: 'error', message: 'Bot offline ou erro de conexão' });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/bot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('Token do bot atualizado! Reiniciando bot...');
        
        // Reiniciar o bot após salvar
        setTimeout(async () => {
          await restartBot();
        }, 2000);
      } else {
        toast.error('Erro ao salvar token do bot');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const restartBot = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/bot/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Bot reiniciado com sucesso!');
        setTimeout(() => {
          checkBotStatus();
        }, 5000);
      } else {
        toast.error('Erro ao reiniciar bot');
      }
    } catch (error) {
      toast.error('Erro ao reiniciar bot');
    }
  };

  const getStatusIcon = () => {
    if (checkingStatus) return <RefreshCw className="w-5 h-5 text-cyber-yellow animate-spin" />;
    if (!botStatus) return <XCircle className="w-5 h-5 text-cyber-red" />;
    
    switch (botStatus.status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-cyber-green" />;
      case 'offline':
      case 'error':
        return <XCircle className="w-5 h-5 text-cyber-red" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-cyber-yellow" />;
    }
  };

  const getStatusText = () => {
    if (checkingStatus) return 'VERIFICANDO...';
    if (!botStatus) return 'ERRO DE CONEXÃO';
    
    switch (botStatus.status) {
      case 'online':
        return `ONLINE - ${botStatus.guilds || 0} servidores`;
      case 'offline':
        return 'OFFLINE';
      case 'error':
        return `ERRO: ${botStatus.message || 'Token inválido'}`;
      default:
        return 'STATUS DESCONHECIDO';
    }
  };

  const getStatusColor = () => {
    if (checkingStatus) return 'text-cyber-yellow';
    if (!botStatus) return 'text-cyber-red';
    
    switch (botStatus.status) {
      case 'online':
        return 'text-cyber-green';
      case 'offline':
      case 'error':
        return 'text-cyber-red';
      default:
        return 'text-cyber-yellow';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO CONFIGURAÇÃO DO BOT
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            CONFIGURAÇÃO DO BOT
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Gerencie o token e status do bot Discord
        </p>
      </div>

      {/* Status do Bot */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            STATUS DO BOT
          </h3>
          
          <button
            onClick={checkBotStatus}
            disabled={checkingStatus}
            className="p-2 bg-void-highlight border border-cyber-red/30 text-cyber-red rounded-lg hover:border-cyber-red transition-colors disabled:opacity-50"
            data-testid="refresh-bot-status-button"
          >
            <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-void-highlight rounded-lg">
          {getStatusIcon()}
          <div>
            <div className={`font-mono text-sm font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {botStatus?.lastSeen && (
              <div className="text-xs text-text-dim font-mono mt-1">
                Última conexão: {new Date(botStatus.lastSeen).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </div>
        
        {botStatus?.status === 'error' && (
          <div className="mt-4 p-4 bg-cyber-red/10 border border-cyber-red/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-cyber-red flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-unbounded font-bold text-cyber-red mb-2">
                  BOT COM PROBLEMAS
                </h4>
                <p className="text-sm font-mono text-cyber-red">
                  {botStatus.message || 'Token pode estar inválido ou expirado'}
                </p>
                <p className="text-xs text-text-dim font-mono mt-2">
                  Atualize o token abaixo e reinicie o bot
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuração do Token */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-cyber-red" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              TOKEN DO BOT
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              TOKEN DISCORD BOT
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                data-testid="bot-token-input"
                className="form-input pr-12"
                placeholder="MTQ1NjMxOTU3MzIyMDM5Mjk5Mw.GQul1P.RYqxUa..."
                value={config.token}
                onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text-primary transition-colors"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 p-3 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg">
              <p className="text-xs text-cyber-yellow font-mono">
                ⚠️ Obtenha um novo token em: discord.com/developers/applications
              </p>
              <p className="text-xs text-text-dim font-mono mt-1">
                Bot → Token → Reset Token
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            type="submit"
            data-testid="save-bot-token-button"
            disabled={saving}
            className="w-full cyber-btn py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                SALVANDO E REINICIANDO...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                SALVAR TOKEN E REINICIAR BOT
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={restartBot}
            className="w-full bg-void-highlight border border-cyber-yellow/30 text-cyber-yellow py-4 rounded-full hover:border-cyber-yellow transition-colors flex items-center justify-center gap-2"
            data-testid="restart-bot-button"
          >
            <RefreshCw className="w-4 h-4" />
            APENAS REINICIAR BOT
          </button>
        </div>
      </form>
    </div>
  );
};

export default BotConfig;