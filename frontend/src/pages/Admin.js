import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Save, FileJson, AlertOctagon } from 'lucide-react';

const Admin = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [jsonContent, setJsonContent] = useState({});
    const [textValue, setTextValue] = useState('');

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const res = await axios.get('/api/admin/files', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setFiles(res.data);
            if (res.data.includes('config')) selectFile('config');
            else if (res.data.length > 0) selectFile(res.data[0]);
        } catch (e) {
            toast.error("Erro ao carregar arquivos");
        }
    };

    const selectFile = async (filename) => {
        setSelectedFile(filename);
        try {
            const res = await axios.get(`/api/admin/file/${filename}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setJsonContent(res.data);
            setTextValue(JSON.stringify(res.data, null, 2));
        } catch (e) {
            toast.error("Erro ao ler arquivo");
        }
    };

    const handleSave = async () => {
        try {
            const parsed = JSON.parse(textValue);

            // We need to send updates key by key or rewrite logic.
            // Since the API expects key/value updates for specific keys or files...
            // Wait, the API `update_config` updates a SPECIFIC key.
            // But we want to bulk save.
            // Let's modify the API or just iterate top-level keys.

            // Actually, for this "glitch" theme, let's just assume we built a bulk update endpoint
            // or we iterate. The prompt asked for "Dynamic configuration".
            // The current API endpoint `update_config` is granular.
            // Let's assume for now we just show it and say "Use specific sections" or
            // we can try to save the whole file by overwriting keys.

            // To be safe and adhere to "don't break things", I'll just iterate top level keys.

            for (const [key, value] of Object.entries(parsed)) {
                await axios.post('/api/admin/config', {
                    file: selectedFile,
                    key: key,
                    value: value
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            }

            toast.success("Arquivo salvo com sucesso!");
            selectFile(selectedFile); // Reload

        } catch (e) {
            console.error(e);
            toast.error("JSON Inválido ou Erro ao Salvar");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-unbounded text-cyber-red glitch-text" data-text="ADMIN CONSOLE">ADMIN CONSOLE</h1>
                    <p className="text-text-dim text-xs font-mono mt-1">SYSTEM CONFIGURATION V2.0</p>
                </div>
                <button
                    onClick={handleSave}
                    className="cyber-btn px-6 py-3 flex items-center gap-2"
                >
                    <Save size={18} /> SALVAR ALTERAÇÕES
                </button>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 h-full overflow-hidden">
                {/* Sidebar */}
                <div className="col-span-12 md:col-span-3 glass-card rounded-lg p-4 overflow-y-auto h-full">
                    <h3 className="text-cyber-green font-bold mb-4 flex items-center gap-2">
                        <FileJson size={16} /> ARQUIVOS JSON
                    </h3>
                    <div className="space-y-2">
                        {files.map(f => (
                            <button
                                key={f}
                                onClick={() => selectFile(f)}
                                className={`w-full text-left px-4 py-3 rounded font-mono text-sm border transition-all
                                    ${selectedFile === f
                                        ? 'bg-cyber-red/10 border-cyber-red text-white'
                                        : 'border-transparent hover:bg-white/5 text-text-dim hover:text-white'}
                                `}
                            >
                                {f}.json
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-void-border">
                        <div className="bg-cyber-yellow/10 border border-cyber-yellow/50 p-4 rounded text-xs text-cyber-yellow">
                            <div className="flex items-center gap-2 mb-2 font-bold">
                                <AlertOctagon size={16} /> AVISO
                            </div>
                            A edição direta dos arquivos JSON pode quebrar o sistema. Verifique a sintaxe antes de salvar.
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="col-span-12 md:col-span-9 h-full flex flex-col">
                    <div className="glass-card rounded-lg flex-1 p-0 overflow-hidden border border-cyber-red/20 relative">
                        <div className="absolute top-0 left-0 w-full h-8 bg-void-highlight border-b border-void-border flex items-center px-4 text-xs text-text-dim font-mono">
                            EDITION MODE: {selectedFile.toUpperCase()}.JSON
                        </div>
                        <textarea
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            className="w-full h-full bg-[#050505] text-green-500 font-mono text-sm p-4 pt-12 resize-none outline-none focus:bg-[#080808] transition-colors"
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
