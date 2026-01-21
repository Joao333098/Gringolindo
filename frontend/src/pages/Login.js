import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KSLogo from '../components/KSLogo';
import { ShieldAlert, Terminal } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for 'code' query param (Discord Callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      handleDiscordCallback(code);
    }
  }, [location]);

  const handleLoginClick = async () => {
    setLoading(true);
    try {
      // Fetch Discord Auth URL from Backend
      const response = await fetch('/api/auth/discord/login');
      if (!response.ok) throw new Error('Falha ao iniciar login');
      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError('Erro ao conectar com servidor de autenticação.');
      setLoading(false);
    }
  };

  const handleDiscordCallback = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/discord/callback?code=${code}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Falha na autenticação');

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError('Falha ao processar login do Discord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Glitch Elements */}
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z5eGZ4bmF6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKsAds57h7c7jxu/giphy.gif')] opacity-[0.02] bg-cover mix-blend-overlay pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-red to-transparent opacity-50 animate-pulse"></div>

      <div className="z-10 w-full max-w-md p-8 relative">
        {/* Card Border Effect */}
        <div className="absolute inset-0 border border-void-border bg-void-surface/50 backdrop-blur-sm transform skew-x-[-2deg] shadow-[0_0_50px_rgba(0,0,0,0.8)]"></div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="mb-12 scale-125">
            <KSLogo size="large" />
          </div>

          <div className="w-full space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-mono text-text-primary tracking-widest uppercase">Acesso Restrito</h2>
              <p className="text-xs text-text-dim font-mono">SYSTEM_SECURE_V2.0 // AUTHENTICATION_REQUIRED</p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 mb-4 flex items-center gap-3 text-red-400 text-sm font-mono">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleLoginClick}
              disabled={loading}
              className="group w-full relative h-14 overflow-hidden bg-void-highlight border border-void-border hover:border-cyber-red transition-all duration-300"
            >
              <div className="absolute inset-0 bg-cyber-red/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center gap-3 h-full">
                {loading ? (
                    <Terminal className="animate-spin text-cyber-red" />
                ) : (
                    <svg className="w-6 h-6 text-[#5865F2] group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1432-.1064.2868-.2132.4333-.3213a.0756.0756 0 01.0817-.0095c3.9453 1.8016 8.2178 1.8016 12.1152 0a.0754.0754 0 01.0822.0102c.1457.1082.2886.215.4322.3213a.076.076 0 01-.0071.1278c-.5969.3427-1.2185.6446-1.8718.8916a.0758.0758 0 00-.0416.1056c.3556.699.7675 1.3638 1.2256 1.9932a.076.076 0 00.0841.0284c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
                    </svg>
                )}
                <span className="font-bold tracking-wider text-text-primary group-hover:text-white">
                  {loading ? 'CONECTANDO...' : 'LOGIN VIA DISCORD'}
                </span>
              </div>
            </button>

            <div className="text-center pt-8 opacity-40 hover:opacity-100 transition-opacity">
                 <p className="text-[10px] font-mono text-cyber-red">
                     <span className="animate-pulse">●</span> DISCORD API: ONLINE
                 </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
