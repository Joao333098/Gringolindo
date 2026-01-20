import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { ShoppingCart, RefreshCw, Smartphone, Globe, CreditCard, Shield, Settings, History } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Dashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products'); // products, history

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Poll user/products every 30s
        return () => clearInterval(interval);
    }, []);

    // Polling for pending transactions
    useEffect(() => {
        const checkPending = async () => {
            const pendingTxs = history.filter(h =>
                h.status === "WAITING_SMS" || h.status === "pending"
            );

            for (const tx of pendingTxs) {
                try {
                    const endpoint = tx.type === 'deposit'
                        ? `/api/deposit/${tx.id}/status`
                        : `/api/purchase/${tx.id}/status`;

                    const res = await axios.get(endpoint, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });

                    // If status changed, force reload full data
                    if (res.data.status !== tx.status && res.data.status !== 'pending' && res.data.status !== 'WAITING_SMS') {
                        toast.success(`Atualização: Transação ${res.data.status}`);
                        loadData();
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }
        };

        if (history.length > 0) {
            const pollInterval = setInterval(checkPending, 5000); // Check pending every 5s
            return () => clearInterval(pollInterval);
        }
    }, [history]);

    const loadData = async () => {
        try {
            const [prodRes, userRes] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/user/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            ]);
            setProducts(prodRes.data.products || []);
            setBalance(userRes.data.user.saldo);
            setHistory(userRes.data.history || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (productId) => {
        if (!confirm(`Confirmar compra?`)) return;
        try {
            toast.loading("Processando...");
            const res = await axios.post('/api/purchase',
                { service_id: productId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success(`Número Gerado: ${res.data.number}`);
            loadData();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Erro na compra");
        }
    };

    const handleDeposit = async () => {
        const amount = prompt("Valor para depositar (R$):");
        if (!amount) return;
        try {
            toast.loading("Gerando PIX...");
            const res = await axios.post('/api/deposit',
                { amount: parseFloat(amount) },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success("PIX Gerado! Copie o código no histórico.");
            loadData();
        } catch (e) {
            toast.error("Erro ao gerar PIX");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-cyber-red">CARREGANDO DADOS...</div>;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-xl border-l-4 border-cyber-red relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={64} />
                    </div>
                    <p className="text-text-secondary text-sm font-unbounded">SEU SALDO</p>
                    <h2 className="text-4xl font-bold text-white mt-2 font-mono glitch-text" data-text={`R$ ${balance.toFixed(2)}`}>
                        R$ {balance.toFixed(2)}
                    </h2>
                    <button onClick={handleDeposit} className="mt-4 cyber-btn text-xs px-4 py-2 w-full">
                        + ADICIONAR FUNDOS (PIX)
                    </button>
                </div>

                <div className="glass-card p-6 rounded-xl border-l-4 border-cyber-green relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Shield size={64} />
                    </div>
                    <p className="text-text-secondary text-sm font-unbounded">STATUS</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse shadow-[0_0_10px_#00FF9D]"></div>
                        <span className="text-xl font-bold text-cyber-green">ONLINE</span>
                    </div>
                    <p className="text-xs text-text-dim mt-2">SISTEMA OPERANTE</p>
                </div>

                <div className="glass-card p-6 rounded-xl border-l-4 border-cyber-yellow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <History size={64} />
                    </div>
                    <p className="text-text-secondary text-sm font-unbounded">ATIVIDADE</p>
                    <h2 className="text-4xl font-bold text-white mt-2 font-mono">
                        {history.length}
                    </h2>
                    <p className="text-xs text-text-dim mt-1">TRANSAÇÕES TOTAIS</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-void-border pb-4">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`font-unbounded text-sm px-4 py-2 transition-all ${activeTab === 'products' ? 'text-cyber-red border-b-2 border-cyber-red' : 'text-text-dim hover:text-white'}`}
                >
                    SERVIÇOS
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`font-unbounded text-sm px-4 py-2 transition-all ${activeTab === 'history' ? 'text-cyber-red border-b-2 border-cyber-red' : 'text-text-dim hover:text-white'}`}
                >
                    HISTÓRICO
                </button>
            </div>

            {/* Content */}
            {activeTab === 'products' && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.map(p => (
                        <div key={p.id} className="glass-card p-4 rounded-lg hover:bg-white/5 transition-all group flex flex-col justify-between h-full relative">
                           {p.qtd_disp < 100 && (
                               <div className="absolute top-2 right-2 text-[10px] text-cyber-red border border-cyber-red px-1 rounded bg-black/50">
                                   POUCO ESTOQUE
                               </div>
                           )}
                           <div>
                                <div className="w-10 h-10 bg-void-highlight rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-void-border group-hover:border-cyber-red">
                                    <Smartphone size={20} className="text-text-secondary group-hover:text-cyber-red" />
                                </div>
                                <h3 className="font-bold text-white text-sm md:text-base truncate" title={p.nome}>{p.nome}</h3>
                                <p className="text-xs text-text-dim mt-1">Disp: {p.qtd_disp}</p>
                           </div>
                           <div className="mt-4">
                                <p className="text-cyber-green font-mono font-bold mb-2">R$ {p.preco_final?.toFixed(2)}</p>
                                <button
                                    onClick={() => handleBuy(p.id)}
                                    className="w-full bg-void-border hover:bg-cyber-red text-white text-xs font-bold py-2 rounded transition-colors uppercase tracking-wider"
                                >
                                    COMPRAR
                                </button>
                           </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-card rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-void-highlight text-text-secondary font-mono text-xs uppercase">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Serviço/Tipo</th>
                                    <th className="p-4">Valor</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Dados (SMS/Pix)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-void-border">
                                {history.slice().reverse().map((h) => (
                                    <tr key={h.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-xs text-text-dim">{String(h.id).substring(0, 8)}...</td>
                                        <td className="p-4 font-bold text-white">{h.product_name || h.type?.toUpperCase()}</td>
                                        <td className="p-4 text-cyber-green">R$ {h.price || h.amount}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                                ${h.status === 'COMPLETED' || h.status === 'approved' || h.status === 'RECEBIDO' ? 'bg-cyber-green/20 text-cyber-green' :
                                                  h.status === 'CANCELLED' ? 'bg-cyber-red/20 text-cyber-red' : 'bg-cyber-yellow/20 text-cyber-yellow'}
                                            `}>
                                                {h.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-xs max-w-[200px] truncate">
                                            {h.qr_code && h.status !== 'approved' && (
                                                <button
                                                    onClick={() => {navigator.clipboard.writeText(h.qr_code); toast.success("Copiado!");}}
                                                    className="text-cyber-yellow hover:underline"
                                                >
                                                    [COPIAR PIX]
                                                </button>
                                            )}
                                            {h.number && <div className="text-white">{h.number}</div>}
                                            {h.code && <div className="text-cyber-green font-bold text-lg mt-1 tracking-widest">{h.code}</div>}
                                            {(h.status === "WAITING_SMS" || h.status === "pending") && <span className="animate-pulse text-text-dim">Aguardando...</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
