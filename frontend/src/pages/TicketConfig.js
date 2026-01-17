import React, { useState, useEffect } from 'react';
import { Settings, Hash, MessageSquare, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TicketConfig = () => {
  const [config, setConfig] = useState({
    categoria_id: '',
    logs_id: '',
    entrega_canal_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/ticket`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        toast.error('Erro ao carregar configuração');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/ticket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('Configuração salva com sucesso!');
      } else {
        toast.error('Erro ao salvar configuração');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO CONFIGURAÇÃO
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            TICKET DINÂMICO
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Configure canais para tickets e sistema de entrega
        </p>
      </div>

      {/* Configuração Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Categoria dos Tickets */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Hash className="w-5 h-5 text-cyber-red" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              CATEGORIA DOS TICKETS
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              ID DA CATEGORIA (Discord)
            </label>
            <input
              type="text"
              data-testid="ticket-categoria-input"
              className="form-input"
              placeholder="Ex: 1442998689802092674"
              value={config.categoria_id}
              onChange={(e) => setConfig(prev => ({ ...prev, categoria_id: e.target.value }))}
              required
            />
            <p className="text-xs text-text-dim font-mono mt-2">
              ID da categoria onde os tickets serão criados
            </p>
          </div>
        </div>

        {/* Canal de Logs */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-cyber-red" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              CANAL DE LOGS
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              ID DO CANAL DE LOGS
            </label>
            <input
              type="text"
              data-testid="ticket-logs-input"
              className="form-input"
              placeholder="Ex: 1269514936619372616"
              value={config.logs_id}
              onChange={(e) => setConfig(prev => ({ ...prev, logs_id: e.target.value }))}
              required
            />
            <p className="text-xs text-text-dim font-mono mt-2">
              Canal onde os logs dos tickets serão enviados
            </p>
          </div>
        </div>

        {/* Canal de Entrega */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-cyber-yellow" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              CANAL DE ENTREGA
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              ID DO CANAL DE ENTREGA (Opcional)
            </label>
            <input
              type="text"
              data-testid="ticket-entrega-input"
              className="form-input"
              placeholder="Ex: 1456320855155015794"
              value={config.entrega_canal_id}
              onChange={(e) => setConfig(prev => ({ ...prev, entrega_canal_id: e.target.value }))}
            />
            <p className="text-xs text-text-dim font-mono mt-2">
              Canal onde as notificações de saldo adicionado serão enviadas
            </p>
          </div>

          {/* Exemplo da mensagem */}
          <div className="mt-4 p-4 bg-void-highlight rounded-xl border border-cyber-red/20">
            <p className="text-xs font-mono text-text-secondary mb-2 uppercase tracking-wider">
              EXEMPLO DE NOTIFICAÇÃO:
            </p>
            <div className="text-xs font-mono text-cyber-green">
              <div className="mb-1">## ⚡ saldo adicionado</div>
              <div className="mb-1">👥 Usuário: @user</div>
              <div className="mb-1">💰 Valor Pago: R$10.00</div>
              <div className="mb-1">🚀 Status: Aprovado</div>
              <div>📅 Data: 01/01/2026 15:54</div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          data-testid="save-ticket-config-button"
          disabled={saving}
          className="w-full cyber-btn py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              SALVANDO...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              SALVAR CONFIGURAÇÃO
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TicketConfig;