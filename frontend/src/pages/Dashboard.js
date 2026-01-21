import React, { useEffect, useState } from 'react';
import { Activity, CreditCard, ShoppingBag, Users } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = "cyber-red" }) => (
    <div className="bg-void-surface border border-void-border p-6 rounded-xl relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}`}>
            <Icon size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded bg-${color}/10 text-${color}`}>
                    <Icon size={20} />
                </div>
                <span className="text-text-secondary font-mono text-xs uppercase tracking-wider">{title}</span>
            </div>
            <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        balance: 0,
        activeOrders: 0,
        totalSpent: 0
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-void-highlight to-void-surface border border-void-border rounded-2xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-2">
                        OLÁ, <span className="text-cyber-red">{user?.username || 'VISITANTE'}</span>
                    </h1>
                    <p className="text-text-secondary max-w-lg">
                        Bem-vindo ao <span className="text-white font-bold">KAELI SYSTEM</span>. Seu painel de controle pessoal está pronto.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 h-full w-1/3 bg-gradient-to-l from-cyber-red/10 to-transparent"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Saldo Atual" value={`R$ ${stats.balance.toFixed(2)}`} icon={CreditCard} color="cyber-green" />
                <StatCard title="Pedidos Ativos" value={stats.activeOrders} icon={ShoppingBag} color="cyber-yellow" />
                <StatCard title="Total Gasto" value={`R$ ${stats.totalSpent.toFixed(2)}`} icon={Activity} color="cyber-red" />
                <StatCard title="Nível" value="Membro" icon={Users} color="blue-500" />
            </div>

            {/* Recent Activity */}
            <div className="bg-void-surface border border-void-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-cyber-red" />
                    ATIVIDADE RECENTE
                </h2>

                <div className="space-y-4">
                    <div className="text-center text-text-dim py-10 font-mono text-sm border border-dashed border-void-border rounded">
                        NENHUMA ATIVIDADE REGISTRADA
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
