import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

const CargoConfig = () => {
  const [config, setConfig] = useState({
    cliente_id: '',
    membro_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/cargos`, {
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/cargos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        toast.success('Configuração de cargos salva!');
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
          CARREGANDO CARGOS
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            GERÊNCIA DE CARGOS
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Configure cargos automáticos para clientes e membros
        </p>
      </div>

      {/* Configuração Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Cargo Cliente */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-5 h-5 text-cyber-green" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              CARGO CLIENTE
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              ID DO CARGO CLIENTE
            </label>
            <input
              type="text"
              data-testid="cargo-cliente-input"
              className="form-input"
              placeholder="Ex: 1234567890123456789"
              value={config.cliente_id}
              onChange={(e) => setConfig(prev => ({ ...prev, cliente_id: e.target.value }))}
              required
            />
            <div className="mt-3 p-3 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
              <p className="text-xs text-cyber-green font-mono">
                ✓ Este cargo será atribuído automaticamente quando o usuário adicionar saldo
              </p>
            </div>
          </div>
        </div>

        {/* Cargo Membro */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-cyber-yellow" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              CARGO MEMBRO
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              ID DO CARGO MEMBRO
            </label>
            <input
              type="text"
              data-testid="cargo-membro-input"
              className="form-input"
              placeholder="Ex: 9876543210987654321"
              value={config.membro_id}
              onChange={(e) => setConfig(prev => ({ ...prev, membro_id: e.target.value }))}
              required
            />
            <div className="mt-3 p-3 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg">
              <p className="text-xs text-cyber-yellow font-mono">
                ✓ Este cargo será atribuído quando o usuário entrar no servidor
              </p>
            </div>
          </div>
        </div>

        {/* Regras e Restrições */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserX className="w-5 h-5 text-cyber-red" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              REGRAS DE ACESSO
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-void-highlight rounded-lg">
              <div className="w-2 h-2 bg-cyber-red rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm font-mono text-text-secondary">
                <strong className="text-cyber-red">Restrição:</strong> Apenas usuários com o cargo MEMBRO poderão adicionar saldo ao sistema
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-void-highlight rounded-lg">
              <div className="w-2 h-2 bg-cyber-green rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm font-mono text-text-secondary">
                <strong className="text-cyber-green">Automático:</strong> O cargo CLIENTE é atribuído automaticamente após primeira compra
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-void-highlight rounded-lg">
              <div className="w-2 h-2 bg-cyber-yellow rounded-full mt-2 flex-shrink-0" />
              <div className="text-sm font-mono text-text-secondary">
                <strong className="text-cyber-yellow">Entrada:</strong> O cargo MEMBRO é dado automaticamente quando alguém entra no servidor
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          data-testid="save-cargo-config-button"
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

export default CargoConfig;