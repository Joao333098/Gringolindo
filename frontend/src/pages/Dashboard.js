import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-cyber-red font-mono animate-pulse loading-dots">
            CARREGANDO DADOS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-unbounded font-black text-cyber-red mb-2">
          PAINEL DE CONTROLE
        </h1>
        <p className="text-text-secondary font-mono text-sm">
          Sistema operacional - Todos os serviços ativos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="bento-grid">
        {/* Vendas Totais */}
        <div className="bento-item" data-testid="dashboard-stat-sales">
          <div className="stat-card">
            <TrendingUp className="w-8 h-8 text-cyber-red mx-auto mb-3" />
            <div className="stat-value">{stats?.vendas_totais || 0}</div>
            <div className="stat-label">Vendas Totais</div>
          </div>
        </div>

        {/* Faturamento */}
        <div className="bento-item" data-testid="dashboard-stat-revenue">
          <div className="stat-card">
            <DollarSign className="w-8 h-8 text-cyber-green mx-auto mb-3" />
            <div className="stat-value">R$ {(stats?.faturamento || 0).toFixed(2)}</div>
            <div className="stat-label">Faturamento</div>
          </div>
        </div>

        {/* Tickets */}
        <div className="bento-item">
          <div className="stat-card">
            <Activity className="w-8 h-8 text-cyber-yellow mx-auto mb-3" />
            <div className="stat-value">{stats?.tickets_criados || 0}</div>
            <div className="stat-label">Tickets Criados</div>
          </div>
        </div>

        {/* Usuários */}
        <div className="bento-item">
          <div className="stat-card">
            <Users className="w-8 h-8 text-text-primary mx-auto mb-3" />
            <div className="stat-value">{stats?.usuarios_total || 0}</div>
            <div className="stat-label">Usuários Ativos</div>
          </div>
        </div>

        {/* Saldo SMS */}
        <div className="bento-item large">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-unbounded font-bold text-lg text-text-primary">
                SALDO SMS24H
              </h3>
              <Zap className="w-6 h-6 text-cyber-red" />
            </div>
            <div className="text-3xl font-unbounded font-black text-cyber-green mb-2">
              R$ {(stats?.sms_saldo || 0).toFixed(2)}
            </div>
            <div className="text-sm font-mono text-text-secondary">
              Créditos disponíveis para envio de SMS
            </div>
          </div>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            STATUS DO SISTEMA
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              stats?.bot_status === 'online' ? 'bg-cyber-green' : 'bg-cyber-red'
            }`} />
            <span className={`font-mono text-sm ${
              stats?.bot_status === 'online' ? 'text-cyber-green status-online' : 'text-cyber-red'
            }`}>
              {stats?.bot_status === 'online' ? 'OPERACIONAL' : 'OFFLINE'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              stats?.bot_status === 'online' ? 'bg-cyber-green' : 'bg-cyber-red'
            }`} />
            <span className="font-mono text-text-secondary">
              Bot Discord ({stats?.bot_guilds || 0} servers)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="font-mono text-text-secondary">Mercado Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="font-mono text-text-secondary">SMS24H API</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="font-mono text-text-secondary">Database</span>
          </div>
        </div>

        {stats?.bot_status !== 'online' && (
          <div className="mt-4 p-3 bg-cyber-red/10 border border-cyber-red/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyber-red" />
              <span className="text-sm font-mono text-cyber-red">
                Bot Discord offline - Verifique a configuração
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          AÇÕES RÁPIDAS
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="cyber-btn py-3 px-4 rounded-xl text-xs"
            onClick={fetchStats}
            data-testid="refresh-stats-button"
          >
            ATUALIZAR DADOS
          </button>
          <button 
            className="bg-void-highlight border border-cyber-red/30 text-cyber-red py-3 px-4 rounded-xl text-xs font-mono hover:border-cyber-red transition-colors"
            onClick={() => {
              if (window.confirm('Deseja realmente sair do sistema?')) {
                localStorage.removeItem('admin_token');
                window.location.reload();
              }
            }}
          >
            SAIR DO SISTEMA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;