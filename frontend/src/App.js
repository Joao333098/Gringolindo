import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

// Components
import MobileShell from './components/MobileShell';
import DesktopShell from './components/DesktopShell';
import './App.css';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token) => {
      try {
          const res = await axios.get('/api/user/me', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
      } catch (e) {
          console.error("Auth check failed", e);
          localStorage.removeItem('token');
          setUser(null);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          fetchUser(token);
      } else {
          setLoading(false);
      }
  }, []);

  const login = (token, userData) => {
      localStorage.setItem('token', token);
      setUser(userData);
  };

  const logout = () => {
      localStorage.removeItem('token');
      setUser(null);
  };

  return (
      <AuthContext.Provider value={{ user, login, logout, loading }}>
          {children}
      </AuthContext.Provider>
  );
};

// Auth Callback Handler
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            axios.post('/api/auth/discord', {
                code,
                redirect_uri: window.location.origin + '/auth/callback'
            })
            .then(res => {
                login(res.data.token, res.data.user);
            })
            .catch(err => {
                console.error(err);
                setError('Falha na autenticação via Discord. Tente novamente.');
            });
        }
    }, [searchParams, login]);

    if (error) return <div className="p-8 text-cyber-red font-mono text-center"><AlertTriangle className="mx-auto mb-4" />{error}</div>;

    return (
        <div className="flex h-screen w-full items-center justify-center bg-void">
            <div className="flex flex-col items-center gap-4 text-cyber-red">
                <Loader2 className="h-12 w-12 animate-spin" />
                <span className="font-mono text-xl animate-pulse">AUTENTICANDO NO DISCORD...</span>
            </div>
        </div>
    );
};

// Main Layout Wrapper (Responsive Split)
const MainLayout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        return <MobileShell>{children}</MobileShell>;
    }
    return <DesktopShell>{children}</DesktopShell>;
};

function App() {
  return (
    <div className="App bg-void min-h-screen text-text-primary font-mono selection:bg-cyber-red selection:text-white">
      <AuthProvider>
          <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route path="/*" element={
                    <ProtectedRoute>
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                            </Routes>
                        </MainLayout>
                    </ProtectedRoute>
                } />
            </Routes>
          </Router>
      </AuthProvider>
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: '#050505',
            border: '1px solid #FF003C',
            color: '#EDEDED',
            fontFamily: 'JetBrains Mono'
          }
        }}
      />
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

export default App;
