import React, { useState, useEffect } from 'react';
import { Save, Folder, FileJson, ChevronRight, ChevronDown } from 'lucide-react';

const JsonEditor = ({ data, onChange }) => {
    const handleFieldChange = (key, value) => {
        onChange({ ...data, [key]: value });
    };

    if (typeof data !== 'object' || data === null) {
        return (
            <input
                value={data}
                onChange={(e) => onChange(e.target.value)}
                className="bg-void-highlight border border-void-border rounded px-2 py-1 w-full text-text-primary text-sm focus:border-cyber-red outline-none"
            />
        );
    }

    return (
        <div className="space-y-2 pl-4 border-l border-void-border/30">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="space-y-1">
                    <div className="flex items-center gap-2">
                         <span className="text-text-secondary text-xs font-mono">{key}:</span>
                    </div>
                    {typeof value === 'object' && value !== null ? (
                        <JsonEditor data={value} onChange={(newValue) => handleFieldChange(key, newValue)} />
                    ) : (
                        <input
                            value={value}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            className="bg-void-highlight border border-void-border rounded px-2 py-1 w-full text-text-primary text-sm focus:border-cyber-red outline-none"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const ConfigEditor = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/config/files', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFiles(data.files || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadFile = async (filename) => {
        setLoading(true);
        setSelectedFile(filename);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/config/content/${filename}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setContent(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveFile = async () => {
        if (!selectedFile || !content) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/admin/config/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filename: selectedFile, content })
            });
            setMessage('Configuração salva com sucesso!');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage('Erro ao salvar configuração.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* File List */}
            <div className="w-1/4 bg-void-surface border border-void-border rounded-lg p-4 h-full overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Folder size={18} className="text-cyber-red" />
                    ARQUIVOS
                </h3>
                <div className="space-y-1">
                    {files.map(file => (
                        <button
                            key={file}
                            onClick={() => loadFile(file)}
                            className={`w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center gap-2 transition-colors ${selectedFile === file ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30' : 'text-text-secondary hover:bg-void-highlight'}`}
                        >
                            <FileJson size={14} />
                            {file}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 bg-void-surface border border-void-border rounded-lg p-6 h-full flex flex-col relative overflow-hidden">
                {message && (
                    <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 border border-green-500/50 px-4 py-2 rounded text-sm z-50">
                        {message}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6 border-b border-void-border pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-cyber-red">EDITANDO:</span>
                        {selectedFile || 'SELECIONE UM ARQUIVO'}
                    </h3>
                    <button
                        onClick={saveFile}
                        disabled={!selectedFile || loading}
                        className="bg-cyber-red hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm transition-colors"
                    >
                        <Save size={16} />
                        SALVAR ALTERAÇÕES
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {content ? (
                        <div className="space-y-4">
                             <JsonEditor data={content} onChange={setContent} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-dim">
                            <FileJson size={48} className="mb-4 opacity-50" />
                            <p>Selecione um arquivo JSON para editar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigEditor;
