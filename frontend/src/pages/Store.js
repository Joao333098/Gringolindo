import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
        const token = localStorage.getItem('admin_token');
        // Fetch services.json directly
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/fs/read/services.json`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Handle structure: { services: [...] } or just [...] or { servicos: [...] }
        const data = res.data;
        const list = data.servicos || data.services || (Array.isArray(data) ? data : []);
        setProducts(list);
    } catch (error) {
        console.error("Error loading products", error);
        // Fallback mock data
        setProducts([
            { nome: "Nitro Mensal", valor: 24.90, image: "https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6918e57475a843f59e_full_logo_blurple_RGB.png" },
            { nome: "Nitro Anual", valor: 249.90, image: "https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6918e57475a843f59e_full_logo_blurple_RGB.png" },
            { nome: "Spotify Premium", valor: 15.00, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png" }
        ]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-white tracking-tighter">LOJA <span className="text-cyber-red">VIRTUAL</span></h1>
        <div className="flex items-center gap-2 text-text-dim">
            <ShoppingCart />
            <span>{products.length} Produtos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
            <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-void-surface border border-void-border hover:border-cyber-red/50 transition-all group overflow-hidden rounded-xl"
            >
                <div className="h-48 bg-void-highlight relative overflow-hidden flex items-center justify-center p-4">
                    {product.image ? (
                        <img src={product.image} alt={product.nome} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <Star className="text-text-dim w-12 h-12" />
                    )}
                    <div className="absolute top-2 right-2 bg-cyber-red text-white text-xs font-bold px-2 py-1 rounded">
                        PREMIUM
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyber-red transition-colors">{product.nome}</h3>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-text-dim text-xs uppercase">A partir de</p>
                            <p className="text-2xl font-mono text-cyber-green">R$ {product.valor?.toFixed(2)}</p>
                        </div>
                        <button className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-cyber-red hover:text-white transition-colors">
                            COMPRAR
                        </button>
                    </div>
                </div>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Store;
