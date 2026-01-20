import React from 'react';
import { Home, Settings, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const MobileShell = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
            <Link to={to} className={`flex flex-col items-center gap-1 p-2 ${active ? 'text-cyber-red' : 'text-text-dim'}`}>
                <Icon size={24} className={active ? 'drop-shadow-[0_0_8px_rgba(255,0,60,0.6)]' : ''} />
                <span className="text-[10px] font-mono">{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-void pb-20 relative">
            {/* Mobile Header */}
            <div className="sticky top-0 z-50 bg-void/90 backdrop-blur-md border-b border-void-border px-4 py-3 flex items-center justify-between">
                <span className="text-2xl font-black font-unbounded text-white tracking-tighter italic">KS</span>
                <div className="flex items-center gap-3">
                     <span className="text-cyber-green font-mono text-sm font-bold">R$ {user?.saldo?.toFixed(2)}</span>
                     <img src={user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} alt="Avatar" className="w-8 h-8 rounded-full border border-cyber-red" />
                     <button onClick={logout} className="text-text-dim"><LogOut size={18}/></button>
                </div>
            </div>

            {/* Content */}
            <div className="p-2">
                {children}
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 w-full bg-[#080808] border-t border-void-border px-6 py-2 flex justify-between items-center z-50 pb-safe">
                <NavItem to="/dashboard" icon={Home} label="INÍCIO" />
                {user?.role === 'admin' && <NavItem to="/admin" icon={Settings} label="CONFIG" />}
                {/* Add more nav items as needed */}
            </div>
        </div>
    );
};

export default MobileShell;
