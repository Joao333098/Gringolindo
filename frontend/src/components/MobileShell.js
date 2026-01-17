import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Settings, Zap, DollarSign, Package, Activity } from 'lucide-react';
import BottomNavigation from './BottomNavigation';

const MobileShell = ({ children }) => {
  const location = useLocation();
  
  // Definir título baseado na rota
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/ticket':
        return 'Ticket Dinâmico';
      case '/cargos':
        return 'Gerência Cargos';
      case '/saldo':
        return 'Gerenciar Saldo';
      case '/payments':
        return 'Pagamentos';
      case '/entregas':
        return 'Entregas';
      default:
        return 'Sistema E1';
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Top Status Bar */}
      <div className="bg-void-surface/90 backdrop-blur-lg border-b border-white/5 sticky top-0 z-40">
        <div className="mobile-container px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyber-red" />
              <h1 className="font-unbounded font-bold text-lg text-text-primary">
                {getPageTitle()}
              </h1>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span className="text-xs font-mono text-text-secondary">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="mobile-container p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MobileShell;