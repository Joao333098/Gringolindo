import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit, Trash2, Copy, Percent } from 'lucide-react';
import { toast } from 'sonner';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    valor: '',
    usos_maximos: '',
    expira_em: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        codigo: formData.codigo.toUpperCase(),
        valor: parseFloat(formData.valor),
        usos_maximos: parseInt(formData.usos_maximos),
        expira_em: formData.expira_em || null
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/coupons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Cupom criado com sucesso!');
        setFormData({ codigo: '', valor: '', usos_maximos: '', expira_em: '' });
        fetchCoupons();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao criar cupom');
      }
    } catch (error) {
      toast.error('Erro de conexao');
    } finally {
      setCreating(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, codigo: result }));
  };

  const copyCode = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Codigo copiado!');
  };

  const isExpired = (expiraEm) => {
    if (!expiraEm) return false;
    return new Date() > new Date(expiraEm);
  };

  const isExhausted = (coupon) => {
    return coupon.usos_atual >= coupon.usos_maximos;
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.ativo) return { status: 'INATIVO', color: 'text-text-dim' };
    if (isExpired(coupon.expira_em)) return { status: 'EXPIRADO', color: 'text-cyber-red' };
    if (isExhausted(coupon)) return { status: 'ESGOTADO', color: 'text-cyber-yellow' };
    return { status: 'ATIVO', color: 'text-cyber-green' };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO CUPONS
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            SISTEMA DE CUPONS
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Gerencie cupons promocionais e codigos de desconto
        </p>
      </div>

      {/* Criar Cupom */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          CRIAR NOVO CUPOM
        </h3>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">CODIGO DO CUPOM</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="WELCOME10"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 py-2 bg-void-highlight border border-cyber-green/30 text-cyber-green rounded-lg hover:border-cyber-green transition-colors"
                  title="Gerar codigo aleatorio"
                >
                  <Percent className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">VALOR (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="10.00"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">USOS MAXIMOS</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="100"
                value={formData.usos_maximos}
                onChange={(e) => setFormData(prev => ({ ...prev, usos_maximos: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">DATA DE EXPIRACAO (OPCIONAL)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.expira_em}
                onChange={(e) => setFormData(prev => ({ ...prev, expira_em: e.target.value }))}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={creating}
            className="cyber-btn py-3 px-6 rounded-full disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {creating ? 'CRIANDO...' : 'CRIAR CUPOM'}
          </button>
        </form>
      </div>

      {/* Lista de Cupons */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            CUPONS CRIADOS ({coupons.length})
          </h3>
          <div className="text-xs font-mono text-text-secondary">
            {coupons.filter(c => getCouponStatus(c).status === 'ATIVO').length} ativos
          </div>
        </div>
        
        {coupons.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              Nenhum cupom criado ainda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <div key={coupon.id} className="p-4 bg-void-highlight rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-cyber-red/20 text-cyber-red text-sm font-mono rounded">
                        {coupon.codigo}
                      </code>
                      <button
                        onClick={() => copyCode(coupon.codigo)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Copiar codigo"
                      >
                        <Copy className="w-3 h-3 text-text-dim" />
                      </button>
                    </div>
                    <span className={`text-xs font-mono ${status.color}`}>
                      {status.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Valor:</span>
                      <span className="text-cyber-green font-bold">R$ {coupon.valor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Usos:</span>
                      <span className="text-text-primary">
                        {coupon.usos_atual}/{coupon.usos_maximos}
                      </span>
                    </div>
                    {coupon.expira_em && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Expira:</span>
                        <span className="text-text-primary text-xs">
                          {new Date(coupon.expira_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Criado:</span>
                      <span className="text-text-dim text-xs">
                        {new Date(coupon.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-void-border rounded-full h-2">
                      <div 
                        className="bg-cyber-red h-2 rounded-full transition-all"
                        style={{ width: `${(coupon.usos_atual / coupon.usos_maximos) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instrucoes */}
      <div className="glass-card rounded-3xl p-6">
        <h4 className="font-unbounded font-bold text-cyber-yellow mb-3">
          COMO USAR OS CUPONS
        </h4>
        <div className="space-y-2 text-sm font-mono text-text-secondary">
          <p>• Usuarios podem usar cupons para adicionar saldo</p>
          <p>• Cada cupom tem limite de usos definido</p>
          <p>• Cupons podem ter data de expiracao</p>
          <p>• Todos os usos sao registrados automaticamente</p>
          <p>• Use codigos curtos e faceis de lembrar</p>
        </div>
      </div>
    </div>
  );
};

export default CouponManager;