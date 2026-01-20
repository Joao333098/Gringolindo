import React from 'react';
import { Home, ShoppingBag, User, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const DesktopShell = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
            <Link to={to} className={`
                flex items-center gap-4 px-6 py-4 transition-all duration-300 border-l-2
                ${active ? 'bg-white/5 border-cyber-red text-white' : 'border-transparent text-text-secondary hover:text-white hover:bg-white/5'}
            `}>
                <Icon size={20} className={active ? 'text-cyber-red drop-shadow-[0_0_5px_rgba(255,0,60,0.8)]' : ''} />
                <span className={`font-mono text-sm tracking-wider ${active ? 'font-bold' : ''}`}>{label}</span>
            </Link>
        );
    };

    return (
        <div className="flex min-h-screen bg-void overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 bg-[#080808] border-r border-void-border flex flex-col z-20">
                <div className="p-8 flex items-center justify-center border-b border-void-border">
                    <h1 className="text-3xl font-black font-unbounded text-white tracking-tighter italic glitch-text" data-text="KS">KS</h1>
                </div>

                <div className="flex-1 py-8 flex flex-col gap-2">
                    <NavItem to="/dashboard" icon={Home} label="DASHBOARD" />
                    <NavItem to="/dashboard" icon={ShoppingBag} label="LOJA" /> {/* Reuses dashboard for now */}
                    {user?.role === 'admin' && <NavItem to="/admin" icon={Settings} label="ADMIN" />}
                </div>

                <div className="p-6 border-t border-void-border">
                    <div className="flex items-center gap-3 mb-4">
                        <img src={user?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} alt="Avatar" className="w-10 h-10 rounded-full border border-cyber-red" />
                        <div className="overflow-hidden">
                            <p className="text-white text-sm font-bold truncate">{user?.username}</p>
                            <p className="text-cyber-green text-xs font-mono">R$ {user?.saldo?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-void-border rounded text-xs text-text-dim hover:bg-cyber-red hover:text-white hover:border-cyber-red transition-all"
                    >
                        <LogOut size={14} /> DISCONNECT
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DesktopShell;
