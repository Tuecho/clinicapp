import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Accounting } from './pages/Accounting';

import { Budgets } from './pages/Budgets';
import { Profile } from './pages/Profile';
import { Agenda } from './pages/Agenda';
import { ShoppingList } from './pages/ShoppingList';
import { FamilyTasks } from './pages/FamilyTasks';
import { Notes } from './pages/Notes';
import { MealPlanning } from './pages/MealPlanning';
import { Birthdays } from './pages/Birthdays';
import { BooksMovies } from './pages/BooksMovies';
import { AdminPage } from './pages/AdminPage';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { FavoriteRestaurants } from './pages/FavoriteRestaurants';
import { FamilyGallery } from './pages/FamilyGallery';
import { Premium } from './pages/Premium';
import { ChatBotPage } from './pages/ChatBotPage';
import { SalesContact } from './pages/SalesContact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';
import { Gifts } from './pages/Gifts';
import { HomeInventory } from './pages/HomeInventory';
import { HomeMaintenance } from './pages/HomeMaintenance';
import { SubscriptionManager } from './pages/SubscriptionManager';
import { PetTracker } from './pages/PetTracker';
import { TravelManager } from './pages/TravelManager';
import { SavingsGoals } from './pages/SavingsGoals';
import { InternalDebts } from './pages/InternalDebts';
import { UtilityBills } from './pages/UtilityBills';
import { FamilyLibrary } from './pages/FamilyLibrary';
import { ExtraSchoolManager } from './pages/ExtraSchoolManager';
import { HabitTracker } from './pages/HabitTracker';
import { ModuleManager } from './pages/ModuleManager';
import { WorkHours } from './pages/WorkHours';
import { ChatWidget } from './components/ChatWidget';
import { Login, useAuth, AuthProvider } from './components/Auth';
import { Menu, X } from 'lucide-react';

type PageType = 'dashboard' | 'accounting' | 'budgets' | 'profile' | 'agenda' | 'shopping' | 'tasks' | 'notes' | 'admin' | 'about' | 'restaurants' | 'howitworks' | 'gallery' | 'contacts' | 'terms' | 'privacy' | 'contact' | 'meals' | 'birthdays' | 'books_movies' | 'chatbot' | 'sales' | 'gifts' | 'habits' | 'home_inventory' | 'home_maintenance' | 'subscriptions' | 'pet_tracker' | 'travel_manager' | 'savings_goals' | 'internal_debts' | 'utility_bills' | 'family_library' | 'extra_school' | 'modules' | 'work_hours';

function AppContent() {
  const [activePage, setActivePage] = useState<PageType>(() => {
    const saved = localStorage.getItem('lastPage');
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
    localStorage.setItem('lastPage', activePage);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
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
      
      <main className={`transition-all duration-200 pt-14 lg:pt-0 ${isSidebarHovered ? 'lg:ml-60' : 'lg:ml-16'} ml-0 min-h-screen`}>
        <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto overflow-x-hidden">
          {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activePage === 'accounting' && <Accounting />}
          {activePage === 'budgets' && <Budgets />}

          {activePage === 'profile' && <Profile />}
          {activePage === 'agenda' && <Agenda />}
          {activePage === 'shopping' && <ShoppingList />}
          {activePage === 'tasks' && <FamilyTasks />}
          {activePage === 'notes' && <Notes />}
          {activePage === 'meals' && <MealPlanning />}
          {activePage === 'birthdays' && <Birthdays />}
          {activePage === 'books_movies' && <BooksMovies />}
          {activePage === 'admin' && isAdmin && <AdminPage />}
          {activePage === 'about' && <About />}
          {activePage === 'howitworks' && <HowItWorks />}
          {activePage === 'restaurants' && <FavoriteRestaurants />}
          {activePage === 'gallery' && <FamilyGallery />}
          {activePage === 'contacts' && <Premium />}
          {activePage === 'chatbot' && <ChatBotPage />}
          {activePage === 'gifts' && <Gifts />}
          {activePage === 'habits' && <HabitTracker />}
          {activePage === 'sales' && <SalesContact />}
          {activePage === 'terms' && <Terms />}
          {activePage === 'privacy' && <Privacy />}
          {activePage === 'contact' && <Contact />}
          {activePage === 'home_inventory' && <HomeInventory />}
          {activePage === 'home_maintenance' && <HomeMaintenance />}
          {activePage === 'subscriptions' && <SubscriptionManager />}
          {activePage === 'pet_tracker' && <PetTracker />}
          {activePage === 'travel_manager' && <TravelManager />}
          {activePage === 'savings_goals' && <SavingsGoals />}
          {activePage === 'internal_debts' && <InternalDebts />}
          {activePage === 'utility_bills' && <UtilityBills />}
          {activePage === 'family_library' && <FamilyLibrary />}
          {activePage === 'extra_school' && <ExtraSchoolManager />}
          {activePage === 'modules' && <ModuleManager />}
          {activePage === 'work_hours' && <WorkHours />}
        </div>
      </main>

      <ChatWidget hidden={activePage === 'contacts'} />
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
