import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Globe, Settings, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

const WebhookConfig = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    eventos: [],
    ativo: true
  });

  const eventosDisponiveis = [
    'user_login',
    'saldo_added', 
    'saldo_removed',
    'user_blacklisted',
    'user_unblacklisted',
    'coupon_used',
    'ticket_created',
    'bot_status_changed'
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/webhooks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Webhook criado com sucesso!');
        setFormData({ url: '', eventos: [], ativo: true });
        fetchWebhooks();
      } else {
        toast.error('Erro ao criar webhook');
      }
    } catch (error) {
      toast.error('Erro de conexao');
    } finally {
      setCreating(false);
    }
  };

  const handleEventoToggle = (evento) => {
    setFormData(prev => ({
      ...prev,
      eventos: prev.eventos.includes(evento)
        ? prev.eventos.filter(e => e !== evento)
        : [...prev.eventos, evento]
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO WEBHOOKS
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Webhook className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            CONFIGURACAO DE WEBHOOKS
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Configure notificacoes automaticas via webhook
        </p>
      </div>

      {/* Criar Webhook */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          CRIAR NOVO WEBHOOK
        </h3>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="form-label">URL DO WEBHOOK</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://seu-servidor.com/webhook"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="form-label">EVENTOS PARA NOTIFICAR</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {eventosDisponiveis.map(evento => (
                <div key={evento} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEventoToggle(evento)}
                    className={`p-1 rounded ${
                      formData.eventos.includes(evento)
                        ? 'text-cyber-green'
                        : 'text-text-dim'
                    }`}
                  >
                    {formData.eventos.includes(evento) ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <span className="text-sm font-mono text-text-secondary">
                    {evento}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={creating || formData.eventos.length === 0}
            className="cyber-btn py-3 px-6 rounded-full disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {creating ? 'CRIANDO...' : 'CRIAR WEBHOOK'}
          </button>
        </form>
      </div>

      {/* Lista de Webhooks */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          WEBHOOKS CONFIGURADOS ({webhooks.length})
        </h3>
        
        {webhooks.length === 0 ? (
          <div className="text-center py-8">
            <Webhook className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              Nenhum webhook configurado
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 bg-void-highlight rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-cyber-green" />
                    <div>
                      <div className="font-mono text-sm text-text-primary truncate max-w-md">
                        {webhook.url}
                      </div>
                      <div className="text-xs text-text-dim font-mono">
                        Criado: {new Date(webhook.criado_em).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-mono rounded ${
                      webhook.ativo 
                        ? 'bg-cyber-green/20 text-cyber-green'
                        : 'bg-cyber-red/20 text-cyber-red'
                    }`}>
                      {webhook.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs font-mono text-text-secondary mb-2">EVENTOS:</div>
                  <div className="flex flex-wrap gap-2">
                    {webhook.eventos.map(evento => (
                      <span 
                        key={evento}
                        className="px-2 py-1 bg-cyber-red/10 text-cyber-red text-xs font-mono rounded"
                      >
                        {evento}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exemplo de Payload */}
      <div className="glass-card rounded-3xl p-6">
        <h4 className="font-unbounded font-bold text-cyber-yellow mb-3">
          EXEMPLO DE PAYLOAD
        </h4>
        <div className="p-4 bg-void rounded-lg font-mono text-xs">
          <pre className="text-cyber-green">
{`{
  "event": "saldo_added",
  "timestamp": "2026-01-17T19:45:00Z",
  "data": {
    "user_id": "123456789012345678",
    "valor": 10.50,
    "novo_saldo": 25.75,
    "transacao_id": "uuid-here"
  }
}`}
          </pre>
        </div>
        <div className="mt-3 text-sm font-mono text-text-secondary">
          <p>• Todos os webhooks recebem payload JSON via POST</p>
          <p>• Timeout de 10 segundos para resposta</p>
          <p>• Eventos sao enviados em tempo real</p>
        </div>
      </div>
    </div>
  );
};

export default WebhookConfig;