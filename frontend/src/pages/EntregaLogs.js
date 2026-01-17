import React, { useState, useEffect } from 'react';
import { Activity, Calendar, User, DollarSign, Hash, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const EntregaLogs = () => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEntregas();
  }, []);

  const fetchEntregas = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/entregas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEntregas(data.entregas || []);
      } else {
        toast.error('Erro ao carregar entregas');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data inválida';
    
    try {
      return new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTransactionId = (id) => {
    if (!id) return 'N/A';
    return id.slice(0, 8) + '...';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO ENTREGAS
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyber-red" />
            <h1 className="text-xl font-unbounded font-bold text-text-primary">
              LOGS DE ENTREGA
            </h1>
          </div>
          
          <button
            onClick={() => fetchEntregas(false)}
            disabled={refreshing}
            className="p-2 bg-void-highlight border border-cyber-red/30 text-cyber-red rounded-lg hover:border-cyber-red transition-colors disabled:opacity-50"
            data-testid="refresh-entregas-button"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Histórico de saldos adicionados e entregas realizadas
        </p>
      </div>

      {/* Lista de Entregas */}
      {entregas.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center">
          <Activity className="w-12 h-12 text-text-dim mx-auto mb-4" />
          <h3 className="font-unbounded font-bold text-lg text-text-secondary mb-2">
            NENHUMA ENTREGA REGISTRADA
          </h3>
          <p className="text-text-dim font-mono text-sm">
            Quando saldos forem adicionados, eles aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entregas.map((entrega, index) => (
            <div key={entrega.transacao_id || index} className="glass-card rounded-3xl p-6">
              {/* Header da Entrega */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
                  <span className="font-unbounded font-bold text-cyber-green text-sm">
                    SALDO ADICIONADO
                  </span>
                </div>
                
                <div className="text-xs font-mono text-text-dim">
                  {formatDate(entrega.timestamp)}
                </div>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-secondary" />
                  <div>
                    <div className="text-xs font-mono text-text-secondary uppercase">Usuário</div>
                    <div className="font-mono text-sm text-text-primary">
                      {entrega.user_id ? `ID: ${entrega.user_id.slice(0, 8)}...` : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-text-secondary" />
                  <div>
                    <div className="text-xs font-mono text-text-secondary uppercase">Valor</div>
                    <div className="font-mono text-sm text-cyber-green font-bold">
                      R$ {(entrega.valor || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transação */}
              <div className="flex items-center gap-2 p-3 bg-void-highlight rounded-lg">
                <Hash className="w-4 h-4 text-text-secondary" />
                <div>
                  <div className="text-xs font-mono text-text-secondary uppercase">ID da Transação</div>
                  <div className="font-mono text-xs text-text-primary">
                    {formatTransactionId(entrega.transacao_id)}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-green rounded-full" />
                  <span className="text-xs font-mono text-cyber-green">
                    STATUS: APROVADO
                  </span>
                </div>
                
                <div className="text-xs font-mono text-text-dim">
                  Entrega #{(entregas.length - index).toString().padStart(3, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer com Total */}
      {entregas.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <div className="text-center">
            <div className="text-2xl font-unbounded font-bold text-cyber-red mb-2">
              {entregas.length}
            </div>
            <div className="text-sm font-mono text-text-secondary uppercase">
              TOTAL DE ENTREGAS REGISTRADAS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntregaLogs;