import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Ban, DollarSign, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminUserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/ranking`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.ranking || []);
    } catch (error) {
        toast.error("Erro ao carregar usuários");
    } finally {
        setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.username && u.username.toLowerCase().includes(filter.toLowerCase())) ||
    u.user_id.includes(filter)
  );

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="text-cyber-red" />
            Gerenciar Usuários
        </h1>

        <div className="bg-void-surface p-4 rounded-lg border border-white/10">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
                <input
                    type="text"
                    placeholder="Buscar usuário (ID ou nome)..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="w-full bg-void border border-white/10 rounded pl-10 pr-4 py-2 text-white focus:border-cyber-red outline-none"
                />
            </div>
        </div>

        <div className="bg-void-surface border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-void-highlight border-b border-white/10 text-text-secondary font-mono text-sm">
                    <tr>
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Saldo</th>
                        <th className="p-4">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(user => (
                        <tr key={user.user_id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-void border border-white/10 overflow-hidden">
                                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-text-dim" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{user.username || "Desconhecido"}</div>
                                        <div className="text-xs text-text-dim font-mono">{user.user_id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 font-mono text-cyber-green">
                                R$ {user.saldo?.toFixed(2)}
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors" title="Banir">
                                        <Ban className="w-4 h-4" />
                                    </button>
                                     <button className="p-2 hover:bg-green-500/20 text-green-500 rounded transition-colors" title="Editar Saldo">
                                        <DollarSign className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan="3" className="p-8 text-center text-text-dim">Nenhum usuário encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AdminUserManager;
