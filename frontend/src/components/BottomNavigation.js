import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Users, 
  DollarSign, 
  Package, 
  Activity 
} from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/ticket', icon: Settings, label: 'Ticket' },
    { path: '/cargos', icon: Users, label: 'Cargos' },
    { path: '/saldo', icon: DollarSign, label: 'Saldo' },
    { path: '/payments', icon: Package, label: 'Pagamentos' },
    { path: '/entregas', icon: Activity, label: 'Entregas' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mobile-container">
        <div className="bg-void-surface/90 backdrop-blur-lg border-t border-white/10 rounded-t-3xl px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${
                    isActive ? 'active' : ''
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-mono">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;