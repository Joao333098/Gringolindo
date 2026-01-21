import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, LogIn, ShoppingBag, Shield } from 'lucide-react';
import KSLogo from '../components/KSLogo';

const MobileLayout = () => {
  const location = useLocation();
  const isAuth = localStorage.getItem('token');

  const navItems = [
    { icon: Home, label: 'Home', path: '/store' },
    { icon: ShoppingBag, label: 'Loja', path: '/store' },
    { icon: Shield, label: 'Admin', path: '/admin', adminOnly: true },
    { icon: Settings, label: 'Config', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-void text-text-primary pb-20 font-sans overflow-x-hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-void-surface/80 backdrop-blur-md border-b border-void-border z-50 flex items-center justify-between px-4">
            <KSLogo size="small" />
            <div className="w-8 h-8 rounded-full bg-void-highlight border border-cyber-red/30 flex items-center justify-center">
                 {/* User Avatar Placeholder */}
                 <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            </div>
        </div>

        {/* Content Area */}
        <div className="pt-20 px-4 animate-in fade-in duration-500">
            <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-void-surface border-t border-void-border z-50 flex items-center justify-around px-2">
            {navItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300
                        ${isActive ? 'text-cyber-red' : 'text-text-dim hover:text-text-secondary'}
                    `}
                >
                    <item.icon size={20} strokeWidth={2} />
                    <span className="text-[10px] font-mono uppercase tracking-wider">{item.label}</span>
                    {location.pathname === item.path && (
                        <span className="absolute bottom-1 w-1 h-1 bg-cyber-red rounded-full shadow-[0_0_10px_#FF003C]"></span>
                    )}
                </NavLink>
            ))}
        </div>
    </div>
  );
};

export default MobileLayout;
