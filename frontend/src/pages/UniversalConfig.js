import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, RefreshCw, FileJson, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const UniversalConfig = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/fs/files`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setFiles(res.data.files || []);
    } catch (error) {
        toast.error("Erro ao carregar lista de arquivos");
    }
  };

  const loadFile = async (filename) => {
    setLoading(true);
    try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/fs/read/${filename}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setContent(JSON.stringify(res.data, null, 2));
        setSelectedFile(filename);
    } catch (error) {
        toast.error("Erro ao ler arquivo");
    } finally {
        setLoading(false);
    }
  };

  const saveFile = async () => {
    try {
        // Validate JSON
        const jsonContent = JSON.parse(content);

        setLoading(true);
        const token = localStorage.getItem('admin_token');
        await axios.post(`${process.env.REACT_APP_BACKEND_URL || ''}/api/fs/write/${selectedFile}`, jsonContent, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Arquivo salvo com sucesso!");
    } catch (error) {
        toast.error("JSON Inválido ou Erro ao salvar");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* File List */}
      <div className="lg:col-span-1 bg-void-surface border border-void-border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-void-border bg-void-highlight flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
                <FileJson size={18} /> Arquivos
            </h3>
            <button onClick={fetchFiles} className="text-text-dim hover:text-white">
                <RefreshCw size={16} />
            </button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {files.map(file => (
                <button
                    key={file}
                    onClick={() => loadFile(file)}
                    className={`w-full text-left px-3 py-2 rounded text-sm font-mono transition-colors ${
                        selectedFile === file
                        ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/50'
                        : 'text-text-secondary hover:bg-void-highlight'
                    }`}
                >
                    {file}
                </button>
            ))}
        </div>
      </div>

      {/* Editor */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {selectedFile ? (
            <>
                <div className="flex justify-between items-center bg-void-surface p-4 rounded-lg border border-void-border">
                    <h2 className="text-xl font-mono font-bold text-white">{selectedFile}</h2>
                    <button
                        onClick={saveFile}
                        disabled={loading}
                        className="bg-cyber-green text-black px-6 py-2 rounded font-bold hover:brightness-110 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>

                <div className="flex-1 relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full bg-void-surface border border-void-border rounded-lg p-4 font-mono text-sm text-text-primary focus:border-cyber-red outline-none resize-none"
                        spellCheck="false"
                    />
                </div>

                <div className="flex items-start gap-2 text-yellow-500 text-xs bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <p>Atenção: A edição direta de arquivos JSON pode quebrar funcionalidades do sistema se a estrutura for alterada incorretamente. Faça backup antes de salvar.</p>
                </div>
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-dim border-2 border-dashed border-void-border rounded-lg">
                <FileJson size={48} className="mb-4 opacity-20" />
                <p>Selecione um arquivo para editar</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default UniversalConfig;
