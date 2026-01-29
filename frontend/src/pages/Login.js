import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key } from 'lucide-react';
import { toast } from 'sonner';
import KSLogo from '../components/KSLogo';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  const handleDiscordLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || ''}/api/auth/discord/login`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.access_token);
        toast.success('ACESSO AUTORIZADO');
        if (onLogin) onLogin(true); // IsAdmin
        navigate('/admin/dashboard');
      } else {
        toast.error('CREDENCIAIS INVÁLIDAS');
      }
    } catch (error) {
      toast.error('ERRO DE CONEXÃO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-red to-transparent opacity-50" />

        <div className="w-full max-w-md z-10 space-y-8">
            <div className="text-center">
                <KSLogo className="mb-6 scale-150" />
                <p className="text-text-secondary font-mono text-sm tracking-[0.5em] mt-4">KAELI SYSTEM</p>
            </div>

            <div className="bg-void-surface border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative">
                {/* Decoration */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyber-red" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyber-red" />

                {!isAdminMode ? (
                    <div className="space-y-6">
                        <button
                            onClick={handleDiscordLogin}
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-lg shadow-[#5865F2]/20"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.56 13.56 0 0 0-1.84 2.895 18.068 18.068 0 0 0-7.014 0 13.586 13.586 0 0 0-1.84-2.895.077.077 0 0 0-.08-.037 19.728 19.728 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.085 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z"/>
                            </svg>
                            ENTRAR COM DISCORD
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-text-dim text-xs">OU ADMIN</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <button
                            onClick={() => setIsAdminMode(true)}
                            className="w-full bg-void-highlight hover:bg-white/5 text-text-secondary py-3 rounded-lg flex items-center justify-center gap-2 border border-white/5 hover:border-white/20 transition-all"
                        >
                            <Shield className="w-4 h-4" />
                            Acesso Administrativo
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="space-y-4">
                            <div>
                                <label className="text-xs text-text-dim block mb-2 ml-1">USUÁRIO</label>
                                <input
                                    type="text"
                                    className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyber-red outline-none transition-colors"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                                    required
                                />
                            </div>
                             <div>
                                <label className="text-xs text-text-dim block mb-2 ml-1">SENHA</label>
                                <input
                                    type="password"
                                    className="w-full bg-void border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyber-red outline-none transition-colors"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                                    required
                                />
                            </div>
                         </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyber-red hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Key className="w-4 h-4" /> ACESSAR PAINEL</>}
                        </button>

                         <button
                            type="button"
                            onClick={() => setIsAdminMode(false)}
                            className="w-full text-text-dim text-xs hover:text-white transition-colors"
                        >
                            Voltar para Login de Usuário
                        </button>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
};

export default Login;
