import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketConfig from './pages/TicketConfig';
import CargoConfig from './pages/CargoConfig';
import SaldoManager from './pages/SaldoManager';
import PaymentConfig from './pages/PaymentConfig';
import EntregaLogs from './pages/EntregaLogs';
import BotConfig from './pages/BotConfig';
import ProjectDownload from './pages/ProjectDownload';
import Store from './pages/Store';
import UniversalConfig from './pages/UniversalConfig';
import ShellSelector from './components/ShellSelector';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    // Simple check, real app would verify token validity with backend
    if (token) {
        setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className="App bg-void min-h-screen text-text-primary font-mono">
      <Router>
        <Routes>
            <Route path="/auth/callback" element={<Login onLogin={() => setIsAuthenticated(true)} />} />

            {!isAuthenticated ? (
                <Route path="*" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            ) : (
                <Route path="*" element={
                    <ShellSelector>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/store" element={<Store />} />
                            <Route path="/ticket" element={<TicketConfig />} />
                            <Route path="/cargos" element={<CargoConfig />} />
                            <Route path="/saldo" element={<SaldoManager />} />
                            <Route path="/payments" element={<PaymentConfig />} />
                            <Route path="/entregas" element={<EntregaLogs />} />
                            <Route path="/bot" element={<BotConfig />} />
                            <Route path="/download" element={<ProjectDownload />} />
                            <Route path="/admin/universal" element={<UniversalConfig />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </ShellSelector>
                } />
            )}
        </Routes>
      </Router>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
