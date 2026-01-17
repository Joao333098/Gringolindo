import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Terminal } from 'lucide-react';
import { toast } from 'sonner';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.access_token);
        toast.success('ACESSO AUTORIZADO');
        onLogin();
        navigate('/');
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
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1767477665606-a29603e1c479?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxnbGl0Y2glMjBhcnQlMjByZWQlMjBibGFjayUyMGFic3RyYWN0JTIwdGV4dHVyZXxlbnwwfHx8fDE3Njg2NzMxNDJ8MA&ixlib=rb-4.1.0&q=85)'
        }}
      />
      
      {/* Glitch overlay */}
      <div className="absolute inset-0 bg-void-overlay" />
      
      <div className="mobile-container w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Terminal className="w-8 h-8 text-cyber-red" />
              <Shield className="w-10 h-10 text-cyber-red" />
              <Zap className="w-8 h-8 text-cyber-red" />
            </div>
            <h1 
              className="text-3xl font-unbounded font-black text-cyber-red glitch-text tracking-tight"
              data-text="SISTEMA E1"
            >
              SISTEMA E1
            </h1>
            <p className="text-text-secondary font-mono text-sm mt-2 tracking-wider">
              PAINEL ADMINISTRATIVO
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                USUÁRIO
              </label>
              <input
                id="username"
                type="text"
                data-testid="login-input-username"
                className="form-input"
                placeholder="Digite seu usuário"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                SENHA DE ACESSO
              </label>
              <input
                id="password"
                type="password"
                data-testid="login-input-password"
                className="form-input"
                placeholder="Digite sua senha"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full cyber-btn py-4 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  VERIFICANDO...
                </span>
              ) : (
                'ACESSAR SISTEMA'
              )}
            </button>
          </form>

          {/* Status Info */}
          <div className="mt-8 pt-6 border-t border-void-border">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-text-secondary">
              <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              <span className="status-online">SISTEMA OPERACIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;