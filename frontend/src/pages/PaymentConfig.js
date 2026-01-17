import React, { useState, useEffect } from 'react';
import { CreditCard, MessageSquare, Key, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const PaymentConfig = () => {
  const [config, setConfig] = useState({
    mp_token: '',
    sms_api_key: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTokens, setShowTokens] = useState({
    mp: false,
    sms: false
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig({
          mp_token: data.mp_token || '',
          sms_api_key: data.sms_api_key || ''
        });
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('Configurações de pagamento atualizadas!');
      } else {
        toast.error('Erro ao salvar configuração');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowTokens(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO CONFIGURAÇÕES
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            CONFIGURAÇÕES DE PAGAMENTO
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Configure as APIs de pagamento e SMS
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Mercado Pago */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-cyber-green" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              MERCADO PAGO
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              ACCESS TOKEN
            </label>
            <div className="relative">
              <input
                type={showTokens.mp ? 'text' : 'password'}
                data-testid="mp-token-input"
                className="form-input pr-12"
                placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.mp_token}
                onChange={(e) => setConfig(prev => ({ ...prev, mp_token: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text-primary transition-colors"
                onClick={() => toggleVisibility('mp')}
              >
                {showTokens.mp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
              <p className="text-xs text-cyber-green font-mono">
                ✓ Obtenha o token em: developers.mercadopago.com
              </p>
            </div>
          </div>
        </div>

        {/* SMS24H */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-cyber-yellow" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              SMS24H API
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              API KEY
            </label>
            <div className="relative">
              <input
                type={showTokens.sms ? 'text' : 'password'}
                data-testid="sms-api-key-input"
                className="form-input pr-12"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={config.sms_api_key}
                onChange={(e) => setConfig(prev => ({ ...prev, sms_api_key: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-dim hover:text-text-primary transition-colors"
                onClick={() => toggleVisibility('sms')}
              >
                {showTokens.sms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 p-3 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg">
              <p className="text-xs text-cyber-yellow font-mono">
                ✓ Obtenha a API Key em: sms24h.com.br
              </p>
            </div>
          </div>
        </div>

        {/* Status das APIs */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-cyber-red" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              STATUS DAS APIS
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-void-highlight rounded-lg">
              <span className="font-mono text-sm text-text-secondary">Mercado Pago</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  config.mp_token && config.mp_token.length > 20 
                    ? 'bg-cyber-green animate-pulse' 
                    : 'bg-cyber-red'
                }`} />
                <span className={`text-xs font-mono ${
                  config.mp_token && config.mp_token.length > 20 
                    ? 'text-cyber-green' 
                    : 'text-cyber-red'
                }`}>
                  {config.mp_token && config.mp_token.length > 20 ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-void-highlight rounded-lg">
              <span className="font-mono text-sm text-text-secondary">SMS24H</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  config.sms_api_key && config.sms_api_key.length > 15 
                    ? 'bg-cyber-green animate-pulse' 
                    : 'bg-cyber-red'
                }`} />
                <span className={`text-xs font-mono ${
                  config.sms_api_key && config.sms_api_key.length > 15 
                    ? 'text-cyber-green' 
                    : 'text-cyber-red'
                }`}>
                  {config.sms_api_key && config.sms_api_key.length > 15 ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          data-testid="save-payments-button"
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
              SALVAR CONFIGURAÇÕES
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentConfig;