import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag,
  FileJson,
  DollarSign, 
  Bot
} from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/store', icon: ShoppingBag, label: 'Loja' },
    { path: '/saldo', icon: DollarSign, label: 'Saldo' },
    { path: '/bot', icon: Bot, label: 'Bot' },
    { path: '/admin/universal', icon: FileJson, label: 'Config' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mobile-container">
        <div className="bg-void-surface/90 backdrop-blur-lg border-t border-cyber-red/20 rounded-t-3xl px-2 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-cyber-red -translate-y-2'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  <IconComponent className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]' : ''}`} />
                  <span className={`text-[10px] font-mono tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
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
