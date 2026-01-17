import React, { useState } from 'react';
import { DollarSign, User, Plus, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SaldoManager = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    valor: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
        setFormData({ user_id: '', valor: '', descricao: '' });
      } else {
        toast.error(data.detail || 'Erro ao adicionar saldo');
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
          Adicione saldo manualmente para usuários do Discord
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ID do Usuário */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-cyber-red" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              USUÁRIO
            </h3>
          </div>
          
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
        </div>

        {/* Valor */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-5 h-5 text-cyber-green" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              VALOR A ADICIONAR
            </h3>
          </div>
          
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
            <p className="text-xs text-text-dim font-mono mt-2">
              Use ponto (.) para separar os centavos
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-5 h-5 text-cyber-yellow" />
            <h3 className="font-unbounded font-bold text-lg text-text-primary">
              DESCRIÇÃO (Opcional)
            </h3>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              MOTIVO DA ADICÇÃO
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
        </div>

        {/* Alerta */}
        <div className="glass-card rounded-3xl p-6 border-cyber-yellow/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-unbounded font-bold text-cyber-yellow">
                IMPORTANTE
              </h4>
              <div className="space-y-1 text-sm font-mono text-text-secondary">
                <p>• Esta ação criará uma notificação no canal de entrega</p>
                <p>• O saldo será adicionado imediatamente</p>
                <p>• O usuário receberá o cargo de CLIENTE automaticamente</p>
                <p>• A transação será registrada no sistema</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Adicionar */}
        <button
          type="submit"
          data-testid="add-saldo-button"
          disabled={loading}
          className="w-full cyber-btn py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ADICIONANDO SALDO...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              ADICIONAR SALDO
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SaldoManager;