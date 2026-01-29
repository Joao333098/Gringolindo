import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Save, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/store/services`);
      setProducts(res.data.services || []);
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao carregar produtos");
    }
  };

  const handleUpdate = async (product) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL || ''}/api/admin/services`,
        product,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Produto ${product.nome} atualizado!`);
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const filteredProducts = products.filter(p =>
    p.nome.toLowerCase().includes(filter.toLowerCase()) ||
    p.id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="text-cyber-red" />
          Gerenciar Produtos
        </h1>
        <button onClick={fetchProducts} className="p-2 bg-void-surface border border-white/10 rounded hover:bg-white/5">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-void-surface p-4 rounded-lg border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full bg-void border border-white/10 rounded pl-10 pr-4 py-2 text-white focus:border-cyber-red outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map(product => (
          <ProductRow key={product.id} product={product} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
};

const ProductRow = ({ product, onUpdate }) => {
  const [data, setData] = useState(product);
  const [changed, setChanged] = useState(false);

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
    setChanged(true);
  };

  const handleSave = () => {
    onUpdate(data);
    setChanged(false);
  };

  return (
    <div className="bg-void-surface p-4 rounded-lg border border-white/5 flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs text-text-dim block mb-1">Nome</label>
        <input
          value={data.nome}
          onChange={e => handleChange('nome', e.target.value)}
          className="w-full bg-void border border-white/10 rounded px-3 py-2 text-white"
        />
      </div>

      <div className="w-32">
        <label className="text-xs text-text-dim block mb-1">Preço (R$)</label>
        <input
          type="number"
          step="0.01"
          value={data.preco_final}
          onChange={e => handleChange('preco_final', parseFloat(e.target.value))}
          className="w-full bg-void border border-white/10 rounded px-3 py-2 text-cyber-green font-mono"
        />
      </div>

      <div className="w-32">
        <label className="text-xs text-text-dim block mb-1">Estoque</label>
        <input
          type="number"
          value={data.qtd_disp}
          onChange={e => handleChange('qtd_disp', parseInt(e.target.value))}
          className="w-full bg-void border border-white/10 rounded px-3 py-2 text-white"
        />
      </div>

      <div className="flex items-end h-full pt-6">
        <button
          onClick={handleSave}
          disabled={!changed}
          className={`p-2 rounded transition-colors ${changed ? 'bg-cyber-red text-white' : 'bg-white/5 text-text-dim'}`}
        >
          <Save className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AdminProductManager;
