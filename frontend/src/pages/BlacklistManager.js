import React, { useState, useEffect } from 'react';
import { UserX, Plus, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BlacklistManager = () => {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    motivo: '',
    duracao_horas: ''
  });

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blacklist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBlacklist(data.users || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar blacklist');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const token = localStorage.getItem('admin_token');
      const payload = {
        user_id: formData.user_id,
        motivo: formData.motivo,
        duracao_horas: formData.duracao_horas ? parseInt(formData.duracao_horas) : null
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blacklist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Usuario adicionado a blacklist!');
        setFormData({ user_id: '', motivo: '', duracao_horas: '' });
        fetchBlacklist();
      } else {
        toast.error('Erro ao adicionar usuario');
      }
    } catch (error) {
      toast.error('Erro de conexao');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remover usuario da blacklist?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blacklist/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Usuario removido da blacklist');
        fetchBlacklist();
      } else {
        toast.error('Erro ao remover usuario');
      }
    } catch (error) {
      toast.error('Erro de conexao');
    }
  };

  const isExpired = (expiraEm) => {
    if (!expiraEm) return false;
    return new Date() > new Date(expiraEm);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO BLACKLIST
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <UserX className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            BLACKLIST DE USUARIOS
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Gerencie usuarios banidos do sistema
        </p>
      </div>

      {/* Adicionar Usuario */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          ADICIONAR A BLACKLIST
        </h3>
        
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">ID DO USUARIO</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456789012345678"
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">MOTIVO</label>
              <input
                type="text"
                className="form-input"
                placeholder="Violacao de regras"
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">DURACAO (HORAS)</label>
              <input
                type="number"
                className="form-input"
                placeholder="24 (vazio = permanente)"
                value={formData.duracao_horas}
                onChange={(e) => setFormData(prev => ({ ...prev, duracao_horas: e.target.value }))}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={adding}
            className="cyber-btn py-3 px-6 rounded-full disabled:opacity-50 flex items-center gap-2"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {adding ? 'ADICIONANDO...' : 'ADICIONAR A BLACKLIST'}
          </button>
        </form>
      </div>

      {/* Lista de Usuarios */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          USUARIOS BANIDOS ({blacklist.length})
        </h3>
        
        {blacklist.length === 0 ? (
          <div className="text-center py-8">
            <UserX className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              Nenhum usuario na blacklist
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blacklist.map((user) => (
              <div key={user.id} className={`p-4 rounded-lg border ${
                isExpired(user.expira_em) 
                  ? 'bg-cyber-yellow/10 border-cyber-yellow/30' 
                  : 'bg-cyber-red/10 border-cyber-red/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm text-text-primary">
                        ID: {user.user_id}
                      </span>
                      {isExpired(user.expira_em) && (
                        <span className="px-2 py-1 bg-cyber-yellow/20 text-cyber-yellow text-xs font-mono rounded">
                          EXPIRADO
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-mono text-text-secondary mb-1">
                      <strong>Motivo:</strong> {user.motivo}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-text-dim">
                      <span>Criado: {new Date(user.criado_em).toLocaleString('pt-BR')}</span>
                      {user.expira_em && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expira: {new Date(user.expira_em).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(user.user_id)}
                    className="p-2 bg-void-highlight hover:bg-cyber-red/20 text-cyber-red rounded-lg transition-colors"
                    title="Remover da blacklist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerta */}
      <div className="glass-card rounded-3xl p-6 border-cyber-yellow/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-unbounded font-bold text-cyber-yellow mb-2">
              INFORMACOES IMPORTANTES
            </h4>
            <div className="space-y-1 text-sm font-mono text-text-secondary">
              <p>• Usuarios na blacklist nao podem usar o bot</p>
              <p>• Duracao vazia = ban permanente</p>
              <p>• Bans expirados aparecem em amarelo</p>
              <p>• Todas acoes sao registradas nos logs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlacklistManager;