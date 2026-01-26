import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import KSLogo from './KSLogo';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  LogOut,
  Users,
  Ticket,
  Shield,
  FileJson,
  Activity,
  Bot
} from 'lucide-react';

const DesktopShell = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingBag, label: 'Loja', path: '/store' },
    { icon: Ticket, label: 'Tickets', path: '/ticket' },
    { icon: Shield, label: 'Cargos', path: '/cargos' },
    { icon: CreditCard, label: 'Pagamentos', path: '/payments' },
    { icon: Users, label: 'Saldo', path: '/saldo' },
    { icon: Bot, label: 'Bot Config', path: '/bot' },
    { icon: FileJson, label: 'Universal Config', path: '/admin/universal' },
    { icon: Activity, label: 'Logs', path: '/entregas' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-void text-text-primary overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-void-surface border-r border-void-border flex flex-col z-20 shadow-2xl shadow-black">
        <div className="p-8 flex items-center justify-center border-b border-void-border/50 bg-void/50 backdrop-blur-sm">
          <KSLogo size="text-3xl" />
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                    isActive(item.path)
                      ? 'bg-cyber-red/10 text-cyber-red border-l-4 border-cyber-red shadow-[0_0_15px_rgba(255,0,60,0.15)]'
                      : 'hover:bg-void-highlight text-text-secondary hover:text-text-primary hover:pl-6'
                  }`}
                >
                  <item.icon size={20} className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110 drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]' : 'group-hover:scale-110'}`} />
                  <span className="font-medium tracking-wide">{item.label}</span>

                  {/* Hover Glitch Effect Element */}
                  <div className="absolute inset-0 bg-cyber-red/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out skew-x-12" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-void-border/50 bg-void/30">
          <button
            onClick={() => {
                localStorage.removeItem('admin_token');
                window.location.reload();
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded border border-void-border hover:border-cyber-red text-text-dim hover:text-cyber-red hover:bg-cyber-red/5 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-sm uppercase">Sair do Sistema</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-void relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DesktopShell;
