import React, { useState } from 'react';
import { DollarSign, User, Plus, Minus, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SaldoManager = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({
    user_id: '',
    valor: '',
    descricao: '',
    motivo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/saldo/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          valor: parseFloat(formData.valor),
          descricao: formData.descricao || 'Saldo adicionado manualmente'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Saldo adicionado! Novo total: R$ ${data.novo_saldo.toFixed(2)}`);
        setFormData({ user_id: '', valor: '', descricao: '', motivo: '' });
      } else {
        toast.error(data.detail || 'Erro ao adicionar saldo');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRemove = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/saldo/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          valor: parseFloat(formData.valor),
          motivo: formData.motivo || 'Remoção manual'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Saldo removido! Novo total: R$ ${data.novo_saldo.toFixed(2)}`);
        setFormData({ user_id: '', valor: '', descricao: '', motivo: '' });
      } else {
        toast.error(data.detail || 'Erro ao remover saldo');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            GERENCIAR SALDO
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Adicione ou remova saldo de usuários do Discord
        </p>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
              activeTab === 'add'
                ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'
                : 'bg-void-highlight text-text-secondary hover:text-text-primary'
            }`}
            data-testid="tab-add-saldo"
          >
            <Plus className="w-4 h-4" />
            ADICIONAR SALDO
          </button>
          <button
            onClick={() => setActiveTab('remove')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
              activeTab === 'remove'
                ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30'
                : 'bg-void-highlight text-text-secondary hover:text-text-primary'
            }`}
            data-testid="tab-remove-saldo"
          >
            <Minus className="w-4 h-4" />
            REMOVER SALDO
          </button>
        </div>

        {/* Adicionar Saldo */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmitAdd} className="space-y-6">
            {/* ID do Usuário */}
            <div className="form-group">
              <label className="form-label">
                ID DO USUÁRIO (Discord)
              </label>
              <input
                type="text"
                data-testid="saldo-user-id-input"
                className="form-input"
                placeholder="Ex: 123456789012345678"
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                required
              />
              <p className="text-xs text-text-dim font-mono mt-2">
                Clique com botão direito no usuário no Discord e "Copiar ID"
              </p>
            </div>

            {/* Valor */}
            <div className="form-group">
              <label className="form-label">
                VALOR EM REAIS (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                data-testid="saldo-valor-input"
                className="form-input"
                placeholder="Ex: 10.00"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                required
              />
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label className="form-label">
                DESCRIÇÃO (Opcional)
              </label>
              <input
                type="text"
                data-testid="saldo-descricao-input"
                className="form-input"
                placeholder="Ex: Crédito promocional, Reembolso, etc."
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              data-testid="add-saldo-button"
              disabled={loading}
              className="w-full bg-cyber-green hover:bg-cyber-green/80 text-white py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-unbounded uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ADICIONANDO...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  ADICIONAR SALDO
                </>
              )}
            </button>
          </form>
        )}

        {/* Remover Saldo */}
        {activeTab === 'remove' && (
          <form onSubmit={handleSubmitRemove} className="space-y-6">
            {/* ID do Usuário */}
            <div className="form-group">
              <label className="form-label">
                ID DO USUÁRIO (Discord)
              </label>
              <input
                type="text"
                data-testid="remove-user-id-input"
                className="form-input"
                placeholder="Ex: 123456789012345678"
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                required
              />
            </div>

            {/* Valor */}
            <div className="form-group">
              <label className="form-label">
                VALOR A REMOVER (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                data-testid="remove-valor-input"
                className="form-input"
                placeholder="Ex: 5.00"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                required
              />
            </div>

            {/* Motivo */}
            <div className="form-group">
              <label className="form-label">
                MOTIVO DA REMOÇÃO
              </label>
              <input
                type="text"
                data-testid="remove-motivo-input"
                className="form-input"
                placeholder="Ex: Violação de regras, Cobrança indevida, etc."
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                required
              />
            </div>

            {/* Alerta Remoção */}
            <div className="p-4 bg-cyber-red/10 border border-cyber-red/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cyber-red flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-unbounded font-bold text-cyber-red mb-2">
                    ATENÇÃO - REMOÇÃO DE SALDO
                  </h4>
                  <div className="space-y-1 text-sm font-mono text-cyber-red">
                    <p>• Essa ação removerá saldo do usuário permanentemente</p>
                    <p>• Uma notificação será enviada ao canal de entrega</p>
                    <p>• O motivo será registrado no sistema</p>
                    <p>• Verificar saldo atual antes de remover</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              data-testid="remove-saldo-button"
              disabled={loading}
              className="w-full bg-cyber-red hover:bg-cyber-red/80 text-white py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-unbounded uppercase tracking-widest text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  REMOVENDO...
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4" />
                  REMOVER SALDO
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Informações */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <Send className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-unbounded font-bold text-cyber-yellow mb-2">
              IMPORTANTE
            </h4>
            <div className="space-y-1 text-sm font-mono text-text-secondary">
              <p>• Todas as transações são registradas automaticamente</p>
              <p>• Notificações são enviadas ao canal de entrega configurado</p>
              <p>• O usuário recebe/perde cargos automaticamente conforme configurado</p>
              <p>• Histórico completo fica disponível na aba "Entregas"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaldoManager;