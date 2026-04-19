import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Accounting } from './pages/Accounting';
import { ClinicManager } from './pages/ClinicManager';
import { ClinicPackages } from './pages/ClinicPackages';
import { Budgets } from './pages/Budgets';
import { Profile } from './pages/Profile';
import { Agenda } from './pages/Agenda';
import { ShoppingList } from './pages/ShoppingList';
import { FamilyTasks } from './pages/FamilyTasks';
import { Notes } from './pages/Notes';
import { Birthdays } from './pages/Birthdays';
import { AdminPage } from './pages/AdminPage';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { Premium } from './pages/Premium';
import { ChatBotPage } from './pages/ChatBotPage';
import { ChatWidget } from './components/ChatWidget';
import { Login, useAuth, AuthProvider } from './components/Auth';
import { CompanyProvider } from './i18n/CompanyContext';
import { Menu, X } from 'lucide-react';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { ModuleManager } from './pages/ModuleManager';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';
import { HomeMaintenance } from './pages/HomeMaintenance';
import { UtilityBills } from './pages/UtilityBills';

type PageType = 'dashboard' | 'accounting' | 'budgets' | 'profile' | 'agenda' | 'shopping' | 'tasks' | 'notes' | 'admin' | 'about' | 'howitworks' | 'contacts' | 'terms' | 'privacy' | 'contact' | 'birthdays' | 'chatbot' | 'sales' | 'home_maintenance' | 'utility_bills' | 'modules' | 'work_hours' | 'clinic' | 'reports';

function AppContent() {
  const [activePage, setActivePage] = useState<PageType>(() => {
    const saved = localStorage.getItem('clinica_lastPage');
    return (saved as PageType) || 'dashboard';
  });
  const { isAuthenticated, isAdmin, login, logout } = useAuth();
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
        />
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64">
          <Sidebar 
            activePage={activePage} 
            onNavigate={handleNavigate} 
            onLogout={logout} 
            isAdmin={isAdmin}
            isMobile={true}
          />
        </div>
      )}
      
      <main className={`transition-all duration-300 pt-14 lg:pt-0 ${isSidebarHovered ? 'lg:ml-60' : 'lg:ml-16'} ml-0 min-h-screen relative z-10`}>
        <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
          {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activePage === 'accounting' && <Accounting />}
          {activePage === 'budgets' && <Budgets />}

          {activePage === 'profile' && <Profile />}
          {activePage === 'agenda' && <Agenda />}
          {activePage === 'shopping' && <ShoppingList />}
          {activePage === 'tasks' && <FamilyTasks />}
          {activePage === 'notes' && <Notes />}
          {activePage === 'birthdays' && <Birthdays />}
          {activePage === 'admin' && isAdmin && <AdminPage />}
          {activePage === 'clinic' && <ClinicManager />}
          {activePage === 'clinic_packages' && <ClinicPackages />}
          {activePage === 'about' && <About />}
          {activePage === 'howitworks' && <HowItWorks />}
          {activePage === 'contacts' && <Premium />}
          {activePage === 'chatbot' && <ChatBotPage />}
          {activePage === 'terms' && <Terms />}
          {activePage === 'privacy' && <Privacy />}
          {activePage === 'contact' && <Contact />}
          {activePage === 'home_maintenance' && <HomeMaintenance />}
          {activePage === 'utility_bills' && <UtilityBills />}
          {activePage === 'modules' && <ModuleManager />}
          {activePage === 'reports' && <ReportsAnalytics />}
        </div>
      </main>

      <ChatWidget hidden={activePage === 'contacts'} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <AppContent />
      </CompanyProvider>
    </AuthProvider>
  );
}
