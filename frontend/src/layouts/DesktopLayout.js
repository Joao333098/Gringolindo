import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, ShoppingBag, Shield, Users, Database, Terminal, LogOut } from 'lucide-react';
import KSLogo from '../components/KSLogo';

const DesktopLayout = () => {
  const location = useLocation();

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: ShoppingBag, label: 'Loja Premium', path: '/store' },
    { type: 'divider', label: 'Administração' },
    { icon: Shield, label: 'Configurações', path: '/admin/config' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: Database, label: 'Produtos', path: '/admin/products' },
    { icon: Terminal, label: 'Logs do Sistema', path: '/admin/logs' },
  ];

  return (
    <div className="min-h-screen bg-void flex font-sans text-text-primary overflow-hidden">
        {/* Animated Background Grid */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
             style={{
                 backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>
        </div>

        {/* Sidebar */}
        <div className="w-72 bg-void-surface border-r border-void-border flex flex-col z-20 h-screen">
            <div className="h-24 flex items-center px-8 border-b border-void-border/50 bg-void/50 backdrop-blur-sm">
                <KSLogo size="medium" />
            </div>

            <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {sidebarItems.map((item, index) => {
                    if (item.type === 'divider') {
                        return (
                            <div key={index} className="pt-6 pb-2 px-4">
                                <span className="text-xs font-mono text-cyber-red/70 uppercase tracking-widest">{item.label}</span>
                            </div>
                        );
                    }
                    return (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                                ${isActive ? 'bg-void-highlight text-white border border-void-border' : 'text-text-secondary hover:text-white hover:bg-void-highlight/50'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-red shadow-[0_0_15px_#FF003C]"></div>
                                    )}
                                    <item.icon size={20} className={`${isActive ? 'text-cyber-red' : 'group-hover:text-cyber-red'} transition-colors`} />
                                    <span className="font-medium tracking-wide">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>

            <div className="p-4 border-t border-void-border bg-void-surface/50">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-text-dim hover:text-cyber-red hover:bg-void-highlight rounded-lg transition-all group">
                    <LogOut size={20} />
                    <span className="font-mono text-sm">ENCERRAR SESSÃO</span>
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            {/* Top Bar */}
            <div className="h-24 border-b border-void-border bg-void/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {location.pathname === '/' ? 'VISÃO GERAL' : location.pathname.split('/').pop().toUpperCase().replace('-', ' ')}
                    </h1>
                    <div className="px-2 py-0.5 bg-cyber-red/10 border border-cyber-red/30 rounded text-xs font-mono text-cyber-red animate-pulse">
                        SYSTEM ONLINE
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-white">Administrador</span>
                        <span className="text-xs font-mono text-cyber-green">● Conectado</span>
                    </div>
                    <div className="w-10 h-10 rounded bg-void-highlight border border-void-border flex items-center justify-center">
                         <Users size={20} className="text-text-secondary" />
                    </div>
                </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                 <Outlet />
            </div>
        </div>
    </div>
  );
};

export default DesktopLayout;
