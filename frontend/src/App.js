import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketConfig from './pages/TicketConfig';
import CargoConfig from './pages/CargoConfig';
import SaldoManager from './pages/SaldoManager';
import PaymentConfig from './pages/PaymentConfig';
import EntregaLogs from './pages/EntregaLogs';
import BotConfig from './pages/BotConfig';
import MobileShell from './components/MobileShell';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Verificar token
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-cyber-red font-mono animate-pulse">
          INICIALIZANDO SISTEMA...
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-void min-h-screen text-text-primary font-mono">
      <Router>
        {!isAuthenticated ? (
          <Login onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <MobileShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ticket" element={<TicketConfig />} />
              <Route path="/cargos" element={<CargoConfig />} />
              <Route path="/saldo" element={<SaldoManager />} />
              <Route path="/payments" element={<PaymentConfig />} />
              <Route path="/entregas" element={<EntregaLogs />} />
              <Route path="/bot" element={<BotConfig />} />
            </Routes>
          </MobileShell>
        )}
      </Router>
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: '#0A0A0A',
            border: '1px solid #FF003C',
            color: '#EDEDED',
          }
        }}
      />
    </div>
  );
}

export default App;