import React, { useState } from 'react';
import { Download, Package, FileText, Code, Database, Smartphone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ProjectDownload = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/download/project`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Criar blob do arquivo
        const blob = await response.blob();
        
        // Criar URL temporaria
        const url = window.URL.createObjectURL(blob);
        
        // Criar elemento de link temporario para download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gradianet-completo.zip';
        document.body.appendChild(a);
        a.click();
        
        // Limpar
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('Download iniciado com sucesso!');
      } else {
        toast.error('Erro ao gerar arquivo de download');
      }
    } catch (error) {
      toast.error('Erro de conexao');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            DOWNLOAD DO PROJETO
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Baixe o codigo completo do sistema Gradianet
        </p>
      </div>

      {/* Informacoes do Sistema */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-5 h-5 text-cyber-green" />
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            SISTEMA COMPLETO
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Backend */}
          <div className="p-4 bg-void-highlight rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-cyber-red rounded-full" />
              <span className="font-mono text-sm text-text-primary font-bold">BACKEND</span>
            </div>
            <div className="text-xs text-text-secondary font-mono space-y-1">
              <p>• FastAPI + Python</p>
              <p>• 15 APIs funcionando</p>
              <p>• Autenticacao JWT</p>
              <p>• Discord API integration</p>
            </div>
          </div>
          
          {/* Frontend */}
          <div className="p-4 bg-void-highlight rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-cyber-green rounded-full" />
              <span className="font-mono text-sm text-text-primary font-bold">FRONTEND</span>
            </div>
            <div className="text-xs text-text-secondary font-mono space-y-1">
              <p>• React + TailwindCSS</p>
              <p>• Interface mobile-first</p>
              <p>• Tema cyberpunk</p>
              <p>• Shadcn/UI components</p>
            </div>
          </div>
          
          {/* Database */}
          <div className="p-4 bg-void-highlight rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-cyber-yellow rounded-full" />
              <span className="font-mono text-sm text-text-primary font-bold">DATABASE</span>
            </div>
            <div className="text-xs text-text-secondary font-mono space-y-1">
              <p>• JSON files estruturados</p>
              <p>• wio.db compativel</p>
              <p>• Dados de exemplo</p>
              <p>• Sistema de backup</p>
            </div>
          </div>
          
          {/* Bot Discord */}
          <div className="p-4 bg-void-highlight rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-text-primary rounded-full" />
              <span className="font-mono text-sm text-text-primary font-bold">BOT DISCORD</span>
            </div>
            <div className="text-xs text-text-secondary font-mono space-y-1">
              <p>• Node.js + Discord.js v14</p>
              <p>• Components v2</p>
              <p>• Sistema de tickets</p>
              <p>• Notificacoes automaticas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-5 h-5 text-cyber-red" />
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            FUNCIONALIDADES INCLUIDAS
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3 text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Dashboard com estatisticas em tempo real</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Gerenciamento de saldo (add/remove)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Status real do bot Discord</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Configuracao de tickets dinamicos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Gerencia de cargos automaticos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Sistema de configuracao de pagamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full" />
            <span className="text-text-secondary">Interface mobile cyberpunk</span>
          </div>
        </div>
      </div>

      {/* Informacoes de Login */}
      <div className="glass-card rounded-3xl p-6 border-cyber-yellow/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-unbounded font-bold text-cyber-yellow mb-2">
              CREDENCIAIS DE ACESSO
            </h4>
            <div className="space-y-1 text-sm font-mono text-text-secondary">
              <p>• <strong className="text-cyber-yellow">Usuario:</strong> vovo</p>
              <p>• <strong className="text-cyber-yellow">Senha:</strong> 2210DORRY90</p>
              <p>• <strong className="text-cyber-yellow">Backend:</strong> localhost:27687</p>
              <p>• <strong className="text-cyber-yellow">Frontend:</strong> localhost:3000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botao de Download */}
      <div className="glass-card rounded-3xl p-6 text-center">
        <div className="mb-4">
          <FileText className="w-12 h-12 text-cyber-red mx-auto mb-2" />
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            PROJETO COMPLETO
          </h3>
          <p className="text-text-secondary font-mono text-sm">
            Arquivo ZIP com todo o codigo fonte e documentacao
          </p>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          data-testid="download-project-button"
          className="w-full cyber-btn py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              GERANDO DOWNLOAD...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              BAIXAR GRADIANET COMPLETO
            </>
          )}
        </button>
        
        <div className="mt-4 text-xs font-mono text-text-dim">
          O download incluira todo o codigo fonte, documentacao e instrucoes de instalacao
        </div>
      </div>
    </div>
  );
};

export default ProjectDownload;