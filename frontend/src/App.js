import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
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
import GratianManager from './pages/GratianManager';
import ShellSelector from './components/ShellSelector';
import StoreHome from './pages/StoreHome';
import StoreProfile from './pages/StoreProfile';
import AdminProductManager from './pages/AdminProductManager';
import AdminUserManager from './pages/AdminUserManager';
import AdminJsonEditor from './pages/AdminJsonEditor';
import './App.css';

// Auth Callback Component
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            localStorage.setItem('user_token', token);
            window.location.href = '/';
        } else {
            window.location.href = '/login';
        }
    }, [token, searchParams]);

    return (
        <div className="min-h-screen bg-void flex items-center justify-center">
            <div className="text-cyber-green font-mono animate-pulse">AUTENTICANDO ACESSO...</div>
        </div>
    );
};

// Protected Admin Route
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('admin_token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic init check or verification could go here
    setLoading(false);
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
        <Routes>
            {/* Public / Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Store Routes (Wrapped in Shell) */}
            <Route path="/" element={
                <ShellSelector>
                    <StoreHome />
                </ShellSelector>
            } />
             <Route path="/profile" element={
                <ShellSelector>
                    <StoreProfile />
                </ShellSelector>
            } />

            {/* Admin Routes (Protected & Wrapped) - Hierarchical */}
            <Route path="/admin/dashboard" element={<AdminRoute><ShellSelector><Dashboard /></ShellSelector></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><ShellSelector><AdminProductManager /></ShellSelector></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><ShellSelector><AdminUserManager /></ShellSelector></AdminRoute>} />
            <Route path="/admin/json" element={<AdminRoute><ShellSelector><AdminJsonEditor /></ShellSelector></AdminRoute>} />
            <Route path="/admin/saldo" element={<AdminRoute><ShellSelector><SaldoManager /></ShellSelector></AdminRoute>} />
            <Route path="/admin/system" element={<AdminRoute><ShellSelector><TicketConfig /></ShellSelector></AdminRoute>} />
            <Route path="/admin/bot" element={<AdminRoute><ShellSelector><BotConfig /></ShellSelector></AdminRoute>} />

            {/* Legacy/Direct Admin Routes (Mapped for backward compat or direct access) */}
             <Route path="/ticket" element={<AdminRoute><ShellSelector><TicketConfig /></ShellSelector></AdminRoute>} />
             <Route path="/cargos" element={<AdminRoute><ShellSelector><CargoConfig /></ShellSelector></AdminRoute>} />
             <Route path="/saldo" element={<AdminRoute><ShellSelector><SaldoManager /></ShellSelector></AdminRoute>} />
             <Route path="/payments" element={<AdminRoute><ShellSelector><PaymentConfig /></ShellSelector></AdminRoute>} />
             <Route path="/entregas" element={<AdminRoute><ShellSelector><EntregaLogs /></ShellSelector></AdminRoute>} />
             <Route path="/bot" element={<AdminRoute><ShellSelector><BotConfig /></ShellSelector></AdminRoute>} />
             <Route path="/download" element={<AdminRoute><ShellSelector><ProjectDownload /></ShellSelector></AdminRoute>} />
             <Route path="/gratian" element={<AdminRoute><ShellSelector><GratianManager /></ShellSelector></AdminRoute>} />

             {/* Catch all redirect to Store */}
             <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: '#050505',
            border: '1px solid #333',
            color: '#EDEDED',
          }
        }}
      />
    </div>
  );
}

export default App;
