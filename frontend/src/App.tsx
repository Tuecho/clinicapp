import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { getAuthHeaders } from './utils/auth';
import { Dashboard } from './pages/Dashboard';
import { Accounting } from './pages/Accounting';
import { ClinicManager } from './pages/ClinicManager';
import { Profile } from './pages/Profile';

import { AdminPage } from './pages/AdminPage';

import { Login, useAuth, AuthProvider } from './components/Auth';
import { UserRole } from './types';
import { Menu, X } from 'lucide-react';
import { ModuleManager } from './pages/ModuleManager';


type PageType = 'dashboard' | 'accounting' | 'profile' | 'admin' | 'sales' | 'modules' | 'work_hours' | 'clinic';

function AppContent() {
  const [activePage, setActivePage] = useState<PageType>(() => {
    const saved = localStorage.getItem('clinica_lastPage');
    return (saved as PageType) || 'dashboard';
  });
  const { isAuthenticated, isAdmin, role, login, logout } = useAuth();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page: PageType) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('clinica_lastPage', activePage);
  }, [activePage]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      handleNavigate(hash as PageType);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        handleNavigate(hash as PageType);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  }, [activePage]);

  const heartbeatInterval = useRef<number>();
  useEffect(() => {
    if (isAuthenticated) {
      const sendHeartbeat = async () => {
        try {
          const headers = getAuthHeaders();
          const userId = headers.userId;
          if (userId) {
            await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/heartbeat`, {
              method: 'POST',
              headers: { userId }
            });
          }
        } catch (e) {
          // Ignorar errores de heartbeat
        }
      };
      
      sendHeartbeat();
      heartbeatInterval.current = window.setInterval(sendHeartbeat, 60000);
      
      return () => {
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
        }
      };
    }
  }, [isAuthenticated]);

  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const inactivityTimeout = useRef<number>();
  const warningTimeout = useRef<number>();

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetInactivityTimer = () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
      setShowInactivityModal(false);

      const WARNING_TIME = 28 * 60 * 1000;
      const LOGOUT_TIME = 30 * 60 * 1000;

      warningTimeout.current = window.setTimeout(() => {
        setShowInactivityModal(true);
      }, WARNING_TIME);

      inactivityTimeout.current = window.setTimeout(() => {
        logout();
      }, LOGOUT_TIME);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      if (warningTimeout.current) clearTimeout(warningTimeout.current);
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [isAuthenticated, logout]);

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="min-h-screen">
      <div className="relative min-h-screen">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      
      <div className="lg:hidden fixed top-3 left-3 z-50 flex gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-primary text-white p-2.5 rounded-lg shadow-lg active:bg-primary/90"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 hidden lg:block fixed inset-y-0 left-0 transition-transform duration-200 z-50`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <Sidebar 
          activePage={activePage} 
          onNavigate={handleNavigate} 
          onLogout={logout} 
          isAdmin={isAdmin}
          role={role}
        />
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64">
          <Sidebar 
            activePage={activePage} 
            onNavigate={handleNavigate} 
            onLogout={logout} 
            isAdmin={isAdmin}
            role={role}
            isMobile={true}
          />
        </div>
      )}
      
      <main className={`transition-all duration-300 pt-14 lg:pt-0 ${isSidebarHovered ? 'lg:ml-60' : 'lg:ml-16'} ml-0 min-h-screen relative z-10`}>
        <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
          {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} role={role} />}
          {activePage === 'accounting' && <Accounting role={role} />}

          {activePage === 'profile' && <Profile />}
          {activePage === 'admin' && isAdmin && <AdminPage />}
          {activePage === 'clinic' && <ClinicManager />}
          {activePage === 'modules' && <ModuleManager />}
        </div>
</main>

        {showInactivityModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Sesión por vencer</h3>
                <button
                  onClick={() => setShowInactivityModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Tu sesión se cerrará en <strong>2 minutos</strong> por inactividad.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Mueve el ratón o presiona cualquier tecla para mantener la sesión activa.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => logout()}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar sesión
                </button>
                <button
                  onClick={() => setShowInactivityModal(false)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Mantener activo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
