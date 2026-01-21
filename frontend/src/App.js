import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Store from './pages/Store';
import ConfigEditor from './pages/Admin/ConfigEditor';
import UserManager from './pages/Admin/UserManager';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    }

    return children;
};

const DeviceDetector = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/discord/callback" element={<Login />} />

        <Route element={
            <PrivateRoute>
                <DeviceDetector />
            </PrivateRoute>
        }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/store" element={<Store />} />
            <Route path="/admin" element={<Navigate to="/admin/config" replace />} />
            <Route path="/admin/config" element={<ConfigEditor />} />
            <Route path="/admin/users" element={<UserManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
