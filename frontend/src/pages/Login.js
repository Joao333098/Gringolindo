import React, { useEffect, useState } from 'react';
import { Smartphone, Monitor, AlertTriangle } from 'lucide-react';
import { useAuth } from '../App';
import axios from 'axios';

const Login = () => {
    const { login } = useAuth();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch public config to get Discord ID
        axios.get('/api/config/public')
            .then(res => setConfig(res.data))
            .catch(err => console.error("Config load failed", err))
            .finally(() => setLoading(false));
    }, []);

    const handleLogin = () => {
        if (!config?.discord_client_id) {
            // Dev Mode / First Run: Enter mock mode if no ID configured
            if (window.confirm("SISTEMA NÃO CONFIGURADO. Entrar em modo DEV/SETUP (Admin Mock)?")) {
                axios.post('/api/auth/discord', { code: "MOCK_DEV_CODE", redirect_uri: "mock" })
                    .then(res => {
                        login(res.data.token, res.data.user);
                    });
            }
            return;
        }

        const redirect = encodeURIComponent(window.location.origin + '/auth/callback');
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${config.discord_client_id}&redirect_uri=${redirect}&response_type=code&scope=identify`;
    };

    return (
        <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-red/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyber-green/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="z-10 w-full max-w-md">
                {/* Logo Animation Container */}
                <div className="flex justify-center mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-red to-cyber-green rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                        <div className="relative px-12 py-12 bg-black ring-1 ring-gray-900/5 rounded-lg leading-none flex items-center justify-center">
                            <span className="text-6xl font-black font-unbounded text-white tracking-tighter glitch-text" data-text="KS">
                                KS
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-xl border-t border-white/10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold font-unbounded text-white mb-2">KAELI SYSTEM</h2>
                        <p className="text-text-dim text-xs font-mono tracking-widest uppercase">Acesso Restrito // Discord Auth</p>
                    </div>

                    {!loading && !config?.discord_client_id && (
                        <div className="mb-4 bg-cyber-yellow/10 border border-cyber-yellow/20 p-3 rounded text-cyber-yellow text-xs font-mono flex items-center gap-2">
                            <AlertTriangle size={16} />
                            <span>SETUP MODE: CLIQUE ABAIXO PARA CONFIGURAR</span>
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full group relative px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded transition-all duration-200 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        <span className="relative flex items-center justify-center gap-3 font-mono">
                            {!config?.discord_client_id ? "ENTRAR (SETUP/DEV)" : "LOGIN COM DISCORD"}
                        </span>
                    </button>

                    <div className="mt-8 flex justify-center gap-8 text-text-dim text-xs">
                         <div className="flex flex-col items-center gap-2">
                             <Monitor size={16} />
                             <span>DESKTOP V2</span>
                         </div>
                         <div className="w-px h-8 bg-void-border"></div>
                         <div className="flex flex-col items-center gap-2">
                             <Smartphone size={16} />
                             <span>MOBILE APP</span>
                         </div>
                    </div>
                </div>

                <p className="text-center text-text-dim text-[10px] mt-8 font-mono">
                    SYSTEM_ID: {Math.random().toString(36).substring(7).toUpperCase()} <br/>
                    STATUS: <span className="text-cyber-green">OPERATIONAL</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
