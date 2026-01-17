import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, DollarSign, Activity, AlertCircle, UserCheck, Server } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [usersWithBalance, setUsersWithBalance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsersWithBalance();
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

  const fetchUsersWithBalance = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/with-balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsersWithBalance(data.users || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários com saldo:', error);
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
          Sistema operacional - Monitoramento em tempo real
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

        {/* Usuários com Saldo */}
        <div className="bento-item">
          <div className="stat-card">
            <UserCheck className="w-8 h-8 text-cyber-yellow mx-auto mb-3" />
            <div className="stat-value">{stats?.usuarios_com_saldo || 0}</div>
            <div className="stat-label">Com Saldo</div>
          </div>
        </div>

        {/* Total de Membros Discord */}
        <div className="bento-item">
          <div className="stat-card">
            <Server className="w-8 h-8 text-text-primary mx-auto mb-3" />
            <div className="stat-value">{stats?.total_members || 0}</div>
            <div className="stat-label">Membros Discord</div>
          </div>
        </div>

        {/* Saldo Total do Sistema */}
        <div className="bento-item large">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-unbounded font-bold text-lg text-text-primary">
                SALDO TOTAL SISTEMA
              </h3>
              <DollarSign className="w-6 h-6 text-cyber-green" />
            </div>
            <div className="text-3xl font-unbounded font-black text-cyber-green mb-2">
              R$ {(stats?.saldo_total_sistema || 0).toFixed(2)}
            </div>
            <div className="text-sm font-mono text-text-secondary">
              Somatória de todos os saldos dos usuários
            </div>
          </div>
        </div>
      </div>

      {/* Usuários com Saldo */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            USUÁRIOS COM SALDO
          </h3>
          <div className="text-xs font-mono text-text-secondary">
            {usersWithBalance.length} usuários
          </div>
        </div>
        
        {usersWithBalance.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {usersWithBalance.slice(0, 8).map((user, index) => (
              <div key={user.user_id} className="flex items-center gap-3 p-3 bg-void-highlight rounded-lg">
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-cyber-red/30"
                  onError={(e) => {
                    e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-text-primary truncate">
                    {user.global_name || user.username}
                  </div>
                  <div className="text-xs text-text-dim font-mono">
                    @{user.username}#{user.discriminator}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-cyber-green">
                    R$ {user.balance.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-dim font-mono">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
            
            {usersWithBalance.length > 8 && (
              <div className="text-center pt-2">
                <div className="text-xs font-mono text-text-dim">
                  + {usersWithBalance.length - 8} usuários com saldo
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              Nenhum usuário com saldo cadastrado
            </p>
          </div>
        )}
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
            onClick={() => {
              fetchStats();
              fetchUsersWithBalance();
            }}
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