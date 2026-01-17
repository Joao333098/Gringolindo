import React, { useState, useEffect } from 'react';
import { HardDrive, Download, Archive, Calendar, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/backup/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/backup/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Backup criado com sucesso!');
        fetchBackups();
      } else {
        toast.error('Erro ao criar backup');
      }
    } catch (error) {
      toast.error('Erro de conexao');
    } finally {
      setCreating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO BACKUPS
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            GERENCIADOR DE BACKUP
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Gerencie backups automaticos do sistema
        </p>
      </div>

      {/* Criar Backup */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-unbounded font-bold text-lg text-text-primary mb-2">
              CRIAR NOVO BACKUP
            </h3>
            <p className="text-text-secondary font-mono text-sm">
              Cria backup de todos os dados JSON do sistema
            </p>
          </div>
          <Database className="w-12 h-12 text-cyber-green" />
        </div>
        
        <button
          onClick={createBackup}
          disabled={creating}
          className="cyber-btn py-3 px-6 rounded-full disabled:opacity-50 flex items-center gap-2"
        >
          {creating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              CRIANDO BACKUP...
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              CRIAR BACKUP AGORA
            </>
          )}
        </button>
      </div>

      {/* Lista de Backups */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            BACKUPS DISPONIVEIS ({backups.length})
          </h3>
          <button
            onClick={fetchBackups}
            className="p-2 bg-void-highlight border border-cyber-green/30 text-cyber-green rounded-lg hover:border-cyber-green transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              Nenhum backup encontrado
            </p>
            <p className="text-text-dim font-mono text-xs mt-2">
              Clique em "Criar Backup Agora" para gerar o primeiro backup
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup, index) => (
              <div key={index} className="p-4 bg-void-highlight rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-cyber-green" />
                    <div>
                      <div className="font-mono text-sm text-text-primary">
                        {backup.nome}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-text-dim">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(backup.criado_em).toLocaleString('pt-BR')}
                        </span>
                        <span>
                          Tamanho: {formatFileSize(backup.tamanho)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-mono rounded ${
                      index === 0 
                        ? 'bg-cyber-green/20 text-cyber-green'
                        : 'bg-cyber-yellow/20 text-cyber-yellow'
                    }`}>
                      {index === 0 ? 'MAIS RECENTE' : 'HISTORICO'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuracoes de Backup */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-unbounded font-bold text-lg text-text-primary mb-4">
          CONFIGURACOES DE BACKUP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-void-highlight rounded-lg text-center">
            <div className="text-2xl font-unbounded font-bold text-cyber-green mb-2">
              AUTOMATICO
            </div>
            <div className="text-xs font-mono text-text-secondary">
              Backup automatico a cada 24h
            </div>
          </div>
          
          <div className="p-4 bg-void-highlight rounded-lg text-center">
            <div className="text-2xl font-unbounded font-bold text-cyber-red mb-2">
              {backups.length}
            </div>
            <div className="text-xs font-mono text-text-secondary">
              Total de backups
            </div>
          </div>
          
          <div className="p-4 bg-void-highlight rounded-lg text-center">
            <div className="text-2xl font-unbounded font-bold text-cyber-yellow mb-2">
              {backups.length > 0 ? formatFileSize(backups.reduce((sum, b) => sum + b.tamanho, 0)) : '0 B'}
            </div>
            <div className="text-xs font-mono text-text-secondary">
              Espaco total usado
            </div>
          </div>
        </div>
      </div>

      {/* Informacoes */}
      <div className="glass-card rounded-3xl p-6">
        <h4 className="font-unbounded font-bold text-cyber-yellow mb-3">
          SOBRE OS BACKUPS
        </h4>
        <div className="space-y-2 text-sm font-mono text-text-secondary">
          <p>• Backups incluem todos os arquivos JSON do sistema</p>
          <p>• Backup automatico roda a cada 24 horas</p>
          <p>• Arquivos sao compactados em formato ZIP</p>
          <p>• Backups antigos sao mantidos para recuperacao</p>
          <p>• Todas operacoes sao registradas nos logs</p>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;