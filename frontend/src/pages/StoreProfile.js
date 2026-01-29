import React, { useEffect, useState } from 'react';
import { User, Wallet, History, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoreProfile = () => {
  const [user, setUser] = useState({ username: 'Visitante', avatar: null, balance: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('user_token') || localStorage.getItem('admin_token');
    if (!token) {
        // navigate('/login'); // Allow viewing profile as guest? No.
    }
    // Ideally fetch user data here
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-void-surface border border-white/5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-red/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="w-32 h-32 rounded-full bg-void border-2 border-cyber-red p-1 relative z-10">
           <div className="w-full h-full rounded-full bg-void-highlight flex items-center justify-center overflow-hidden">
             <User className="w-12 h-12 text-text-dim" />
           </div>
           <div className="absolute bottom-0 right-2 w-6 h-6 bg-cyber-green rounded-full border-4 border-void" />
        </div>

        <div className="text-center md:text-left z-10 flex-1">
          <h1 className="text-3xl font-black text-white font-unbounded mb-2">{user.username}</h1>
          <p className="text-text-secondary font-mono text-sm">MEMBER SINCE 2024</p>
        </div>

        <div className="z-10">
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                <LogOut className="w-4 h-4" />
                SAIR
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-void-surface border border-white/5 rounded-2xl hover:border-cyber-green/30 transition-colors group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-cyber-green">
                <div className="p-2 bg-cyber-green/10 rounded-lg">
                    <Wallet className="w-6 h-6" />
                </div>
                <span className="font-bold font-unbounded">SALDO</span>
            </div>
            <button className="text-xs bg-cyber-green/10 text-cyber-green px-3 py-1 rounded hover:bg-cyber-green/20 transition-colors">
                ADICIONAR
            </button>
          </div>
          <p className="text-4xl font-mono text-white font-bold group-hover:scale-105 transition-transform origin-left">
            R$ {user.balance.toFixed(2)}
          </p>
        </div>

         <div className="p-8 bg-void-surface border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-6 text-blue-400">
             <div className="p-2 bg-blue-500/10 rounded-lg">
                <History className="w-6 h-6" />
             </div>
            <span className="font-bold font-unbounded">HISTÓRICO</span>
          </div>
          <div className="space-y-4">
              <div className="text-center py-8 text-text-dim border border-dashed border-white/10 rounded-xl">
                  Nenhuma transação recente
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfile;
