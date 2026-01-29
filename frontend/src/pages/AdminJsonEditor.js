import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Code } from 'lucide-react';
import { toast } from 'sonner';

const AdminJsonEditor = () => {
    const [config, setConfig] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/system/config`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setConfig(JSON.stringify(res.data, null, 2));
        } catch (error) {
            toast.error("Erro ao carregar config");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const parsed = JSON.parse(config);
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL || ''}/api/system/config`,
                parsed,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Configuração salva!");
        } catch (error) {
            toast.error("JSON Inválido ou Erro ao salvar");
        }
    };

    return (
        <div className="space-y-6 h-full min-h-[500px] flex flex-col">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Code className="text-cyber-red" />
                    Editor JSON Avançado (System Config)
                </h1>
                <button onClick={handleSave} className="bg-cyber-red text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600 transition-colors">
                    <Save className="w-4 h-4" />
                    Salvar
                </button>
            </div>

            <div className="flex-1 relative">
                <textarea
                    className="w-full h-full min-h-[400px] bg-void-surface border border-white/10 rounded-lg p-4 font-mono text-sm text-cyber-green focus:border-cyber-red outline-none resize-none shadow-inner"
                    value={config}
                    onChange={e => setConfig(e.target.value)}
                    spellCheck="false"
                />
            </div>
            <p className="text-xs text-text-dim mt-2">
                * Edite o JSON diretamente para configurações avançadas do sistema. Cuidado com a sintaxe.
            </p>
        </div>
    );
};

export default AdminJsonEditor;
