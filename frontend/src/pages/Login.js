import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import KSLogo from '../components/KSLogo';
import { Gamepad2 } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for URL query params (callback from Discord)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
        handleDiscordCallback(code);
    } else if (error) {
        toast.error("Erro na autenticação com Discord");
    }
  }, []);

  const handleDiscordLogin = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/auth/discord`);
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            // Fallback for demo mode
            if (data.url && data.url.includes("error=missing_client_id")) {
                toast.warning("Modo DEV: Login Simulado (Sem Client ID)");
                setTimeout(() => {
                    localStorage.setItem('admin_token', 'dev_token_123');
                    onLogin();
                    navigate('/');
                }, 1000);
            } else {
                toast.error("Erro ao iniciar login");
                setLoading(false);
            }
        }
    } catch (e) {
        console.error(e);
        toast.error("Erro de conexão");
        setLoading(false);
    }
  };

  const handleDiscordCallback = async (code) => {
    setLoading(true);
    try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/auth/discord/callback?code=${code}`);
        const data = await res.json();
        if (res.ok && data.access_token) {
            localStorage.setItem('admin_token', data.access_token);
            toast.success("Login realizado com sucesso!");
            onLogin();
            navigate('/');
        } else {
            toast.error("Falha na autenticação");
        }
    } catch (e) {
        toast.error("Erro ao processar login");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Glitch Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void"></div>

        <div className="z-10 w-full max-w-md bg-void-surface/80 backdrop-blur-md border border-void-border p-8 rounded-2xl shadow-2xl shadow-cyber-red/10 text-center">
            <div className="mb-10 flex justify-center">
                <KSLogo size="text-5xl" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Sistema</h2>
            <p className="text-text-secondary mb-8">Faça login para continuar</p>

            <button
                onClick={handleDiscordLogin}
                disabled={loading}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/20"
            >
                {loading ? (
                    <span className="animate-pulse">Aguarde...</span>
                ) : (
                    <>
                        <Gamepad2 size={24} />
                        <span>Entrar com Discord</span>
                    </>
                )}
            </button>

            <div className="mt-8 text-xs text-text-dim">
                <p>Acesso restrito a usuários autorizados.</p>
                <p>Kaeli System v2.0</p>
            </div>
        </div>
    </div>
  );
};

export default Login;
