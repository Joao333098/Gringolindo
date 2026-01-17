import React, { useState, useEffect } from 'react';
import { FileText, Filter, Search, User, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ActionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logs/actions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_login':
        return <User className="w-4 h-4 text-cyber-green" />;
      case 'saldo_added':
      case 'saldo_removed':
        return <span className="text-cyber-yellow">$</span>;
      case 'user_blacklisted':
      case 'user_unblacklisted':
        return <AlertTriangle className="w-4 h-4 text-cyber-red" />;
      default:
        return <FileText className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getActionColor = (action) => {
    if (action.includes('login')) return 'text-cyber-green';
    if (action.includes('blacklist')) return 'text-cyber-red';
    if (action.includes('saldo')) return 'text-cyber-yellow';
    if (action.includes('coupon')) return 'text-cyber-green';
    return 'text-text-primary';
  };

  const getActionDescription = (log) => {
    const action = log.action;
    const details = log.details || {};
    
    switch (action) {
      case 'user_login':
        return 'Usuario fez login no sistema';
      case 'saldo_added':
        return `Saldo adicionado: R$ ${details.valor || '0.00'}`;
      case 'saldo_removed':
        return `Saldo removido: R$ ${details.valor || '0.00'}`;
      case 'user_blacklisted':
        return `Usuario banido: ${details.motivo || 'Sem motivo'}`;
      case 'user_unblacklisted':
        return 'Usuario removido da blacklist';
      case 'coupon_created':
        return `Cupom criado: ${details.codigo || 'N/A'}`;
      case 'coupon_used':
        return `Cupom utilizado: ${details.codigo || 'N/A'}`;
      case 'webhook_created':
        return 'Novo webhook configurado';
      case 'auto_backup':
        return 'Backup automatico realizado';
      case 'project_downloaded':
        return 'Projeto baixado via ZIP';
      default:
        return action.replace('_', ' ').toUpperCase();
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === '' || log.action === filter;
    const matchesSearch = search === '' || 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.user_id && log.user_id.includes(search)) ||
      getActionDescription(log).toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO LOGS
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            LOGS DE ACOES
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Historico detalhado de todas as acoes do sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-3xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">FILTRAR POR ACAO</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-dim" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-select pl-10"
              >
                <option value="">Todas as acoes</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="form-label">BUSCAR</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Buscar por acao, usuario ou descricao"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-cyber-red mb-1">
            {logs.length}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Total de Logs
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-cyber-green mb-1">
            {filteredLogs.length}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Filtrados
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-cyber-yellow mb-1">
            {uniqueActions.length}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Tipos de Acao
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-text-primary mb-1">
            {logs.filter(l => l.timestamp > new Date(Date.now() - 24*60*60*1000).toISOString()).length}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Ultimas 24h
          </div>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          HISTORICO DE ACOES ({filteredLogs.length})
        </h3>
        
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              {search || filter ? 'Nenhum log encontrado com os filtros aplicados' : 'Nenhum log registrado ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log, index) => (
              <div key={log.id || index} className="p-3 bg-void-highlight rounded-lg border border-white/5 hover:border-cyber-red/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-sm font-bold ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-dim font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="text-sm text-text-secondary font-mono mb-2">
                      {getActionDescription(log)}
                    </div>
                    
                    {log.user_id && (
                      <div className="text-xs text-text-dim font-mono">
                        Usuario ID: {log.user_id}
                      </div>
                    )}
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 p-2 bg-void/50 rounded text-xs font-mono">
                        <pre className="text-text-dim whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informacoes */}
      <div className="glass-card rounded-3xl p-6">
        <h4 className="font-unbounded font-bold text-cyber-yellow mb-3">
          SOBRE OS LOGS
        </h4>
        <div className="space-y-1 text-sm font-mono text-text-secondary">
          <p>• Sistema mantem os ultimos 1000 logs automaticamente</p>
          <p>• Todas as acoes sao registradas com timestamp UTC</p>
          <p>• Logs incluem detalhes completos das acoes</p>
          <p>• Use filtros para encontrar eventos especificos</p>
          <p>• Dados sensiveis nao sao armazenados nos logs</p>
        </div>
      </div>
    </div>
  );
};

export default ActionLogs;