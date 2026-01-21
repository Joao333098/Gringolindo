import React from 'react';
import { ShoppingCart, Star, Zap } from 'lucide-react';

const products = [
    { id: 1, name: 'VIP Premium', price: 29.90, type: 'premium', features: ['Acesso total', 'Suporte 24/7', 'Badge Exclusiva'] },
    { id: 2, name: 'Gold Member', price: 19.90, type: 'premium', features: ['Acesso básico', 'Suporte Prioritário'] },
    { id: 3, name: 'Starter Kit', price: 0, type: 'free', features: ['Acesso limitado', 'Sem suporte'] },
    { id: 4, name: 'Booster Pack', price: 9.90, type: 'addon', features: ['XP Boost', 'Role Color'] },
];

const Store = () => {
    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">LOJA <span className="text-cyber-red">PREMIUM</span></h1>
                    <p className="text-text-secondary font-mono text-sm">UPGRADE YOUR EXPERIENCE</p>
                </div>
                <div className="bg-void-surface border border-void-border px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="text-text-dim text-xs font-mono">SEU SALDO:</span>
                    <span className="text-cyber-green font-bold font-mono">R$ 0,00</span>
                </div>
            </div>

            {/* Featured / Premium */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Star className="text-cyber-yellow fill-cyber-yellow" size={18} />
                    <h2 className="text-xl font-bold text-white tracking-wide">DESTAQUES</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.filter(p => p.type === 'premium').map(product => (
                        <div key={product.id} className="group relative bg-void-surface border border-void-border rounded-xl overflow-hidden hover:border-cyber-red transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyber-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-black text-white italic">{product.name}</h3>
                                    {product.type === 'premium' && <Zap size={20} className="text-cyber-yellow" />}
                                </div>

                                <ul className="space-y-2 mb-8">
                                    {product.features.map((f, i) => (
                                        <li key={i} className="text-text-secondary text-sm flex items-center gap-2">
                                            <div className="w-1 h-1 bg-cyber-red rounded-full"></div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-text-dim text-xs font-mono">PREÇO</span>
                                        <span className="text-2xl font-bold text-white">R$ {product.price.toFixed(2)}</span>
                                    </div>
                                    <button className="bg-white text-black hover:bg-cyber-red hover:text-white px-6 py-2 rounded font-bold transition-colors flex items-center gap-2">
                                        <ShoppingCart size={16} />
                                        COMPRAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Free / Others */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-text-dim" size={18} />
                    <h2 className="text-xl font-bold text-text-secondary tracking-wide">OUTROS ITENS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.filter(p => p.type !== 'premium').map(product => (
                        <div key={product.id} className="bg-void-surface/50 border border-void-border rounded-lg p-4 hover:bg-void-highlight transition-colors">
                            <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-lg font-mono text-cyber-green">{product.price === 0 ? 'GRÁTIS' : `R$ ${product.price.toFixed(2)}`}</span>
                                <button className="text-xs border border-void-border px-3 py-1 rounded text-text-primary hover:border-cyber-red hover:text-cyber-red transition-colors">
                                    DETALHES
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Store;
