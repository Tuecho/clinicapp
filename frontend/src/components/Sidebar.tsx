import { useState, useEffect } from 'react';
import { Home, Wallet, User, Shield, LogOut, Settings, Stethoscope } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { UserRole } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Profile {
  name: string;
  avatar: string | null;
  family_name: string;
  enabled_modules: string | null;
}

interface SidebarProps {
  activePage: 'dashboard' | 'accounting' | 'budgets' | 'profile' | 'admin' | 'modules' | 'clinic' | 'reports';
  onNavigate: (page: 'dashboard' | 'accounting' | 'budgets' | 'profile' | 'admin' | 'modules' | 'clinic' | 'reports') => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  role?: UserRole;
  isMobile?: boolean;
}

interface SidebarProps {
  activePage: 'dashboard' | 'accounting' | 'profile' | 'admin' | 'modules' | 'clinic';
  onNavigate: (page: 'dashboard' | 'accounting' | 'profile' | 'admin' | 'modules' | 'clinic') => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  isMobile?: boolean;
}

export function Sidebar({ activePage, onNavigate, onLogout, isAdmin, role, isMobile }: SidebarProps) {
  const [profile, setProfile] = useState<Profile>({ name: '', avatar: null, family_name: 'Mi Familia', enabled_modules: null });
  const [globalModules, setGlobalModules] = useState<string[] | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchProfile = () => {
      fetch(`${API_URL}/api/profile`, { headers: getAuthHeaders() })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Error fetching profile');
          setProfile(data);
        })
        .catch(console.error);
    };

    const fetchGlobalModules = () => {
      fetch(`${API_URL}/api/settings/global-modules`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data?.enabled_modules)) {
            setGlobalModules(data.enabled_modules);
          } else {
            setGlobalModules(null);
          }
        })
        .catch(() => setGlobalModules(null));
    };
    
    fetchProfile();
    fetchGlobalModules();
    
    const interval = setInterval(() => {
      fetchProfile();
      fetchGlobalModules();
    }, 2000);
    
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'profile_refresh') {
        fetchProfile();
        fetchGlobalModules();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('profile_updated', handleProfileUpdate);
    
    const handleCompanyNameUpdate = () => {
      window.dispatchEvent(new CustomEvent('company_name_update_sidebar'));
    };
    window.addEventListener('company_name_updated', handleCompanyNameUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('profile_updated', handleProfileUpdate);
      window.removeEventListener('company_name_updated', handleCompanyNameUpdate);
      clearInterval(interval);
    };
  }, []);

  const defaultModules = ['dashboard', 'accounting', 'clinic'];

  const isModuleEnabled = (key: string) => {
    const userRole = role || 'worker';
    if (key === 'dashboard') return true;
    
    const roleModules: Record<string, string[]> = {
      worker: [],
      administrative: ['accounting', 'clinic'],
      admin: ['accounting', 'clinic']
    };
    
    if (!roleModules[userRole].includes(key)) return false;
    
    if (Array.isArray(globalModules)) {
      if (!globalModules.includes(key)) return false;
    }
    if (!profile.enabled_modules) return defaultModules.includes(key);
    return profile.enabled_modules.split(',').includes(key);
  };

  const getModuleOrder = (): string[] => {
    const userRole = role || 'worker';
    
    const roleModules: Record<string, string[]> = {
      worker: [],
      administrative: ['accounting', 'clinic'],
      admin: ['accounting', 'clinic']
    };
    
    const allowedModules = roleModules[userRole] || roleModules.worker;
    
    if (Array.isArray(globalModules)) {
      const profileOrder = profile.enabled_modules ? profile.enabled_modules.split(',').filter(Boolean) : [];
      const enabledGlobalModuleKeys = globalModules.filter(key => key !== 'dashboard' && allowedModules.includes(key));
      
      if (profileOrder.length > 0) {
        const ordered: string[] = [];
        const seen = new Set<string>();
        
        for (const key of profileOrder) {
          if ((key === 'dashboard' || enabledGlobalModuleKeys.includes(key)) && allowedModules.includes(key)) {
            ordered.push(key);
            seen.add(key);
          }
        }
        
        for (const key of enabledGlobalModuleKeys) {
          if (!seen.has(key)) {
            ordered.push(key);
          }
        }
        
        return ordered;
      }
      
      return enabledGlobalModuleKeys;
    }
    if (!profile.enabled_modules) return allowedModules;
    return profile.enabled_modules.split(',').filter(Boolean).filter(key => allowedModules.includes(key));
  };

const moduleMap: Record<string, { page: string; icon: any; label: string }> = {
    dashboard: { page: 'dashboard', icon: Home, label: 'Dashboard' },
    accounting: { page: 'accounting', icon: Wallet, label: 'Contabilidad' },
    clinic: { page: 'clinic', icon: Stethoscope, label: 'Mi Clínica' },
  };

  // Removed premium pages effect as tabs are now always visible

  const isExpanded = isMobile || isHovered;

  return (
    <aside
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className={`bg-[var(--color-surface)] border-r border-[var(--color-border)] h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-60' : 'w-16'
      } ${isMobile ? 'w-64 shadow-xl' : ''}`}
    >
      <div className={`border-b border-[var(--color-border)] transition-all duration-200 ${isExpanded ? 'p-4' : 'p-3'}`}>
        {isExpanded ? (
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">{profile.family_name || 'Mi Clínica'}</h1>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {profile.family_name?.[0]?.toUpperCase() || 'M'}
          </div>
        )}
      </div>
      
      <nav className={`flex-1 transition-all duration-200 overflow-y-auto ${isExpanded ? 'p-3' : 'p-2'}`}>
        <ul className="space-y-1.5">
          {(isAdmin || role === 'admin') && (
            <li>
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                  activePage === 'admin'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-border)]'
                } ${isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
                title={isExpanded ? undefined : 'Admin'}
              >
                <Shield size={18} />
                {isExpanded && <span className="text-sm font-medium">Admin</span>}
              </button>
            </li>
          )}
          
          <li>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                activePage === 'dashboard'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              } ${isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
              title={isExpanded ? undefined : 'Dashboard'}
            >
              <Home size={18} />
              {isExpanded && <span className="text-sm font-medium">Dashboard</span>}
            </button>
          </li>
          
          {getModuleOrder().filter(key => key !== 'dashboard' && isModuleEnabled(key)).map((moduleKey) => {
            const module = moduleMap[moduleKey];
            if (!module) return null;
            const Icon = module.icon;
            return (
              <li key={moduleKey}>
                <button
                  onClick={() => onNavigate(module.page as any)}
                  className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                    activePage === module.page
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  } ${isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
                  title={isExpanded ? undefined : module.label}
                >
                  <Icon size={18} />
                  {isExpanded && <span className="text-sm font-medium">{module.label}</span>}
                </button>
              </li>
            );
          })}
          
          <li>
            <button
              onClick={() => onNavigate('modules')}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 ${
                activePage === 'modules'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              } ${isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
              title={isExpanded ? undefined : 'Módulos'}
            >
              <Settings size={18} />
              {isExpanded && <span className="text-sm font-medium">Módulos</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('profile')}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                activePage === 'profile'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
              } ${isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'}`}
              title={isExpanded ? undefined : (profile.name || 'Mi perfil')}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50" />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activePage === 'profile' ? 'bg-white/20' : 'bg-primary/10'
                }`}>
                  <User size={16} className={activePage === 'profile' ? 'text-white' : 'text-primary'} />
                </div>
              )}
              {isExpanded && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{profile.name || 'Mi perfil'}</p>
                  <p className="text-xs opacity-60 truncate">{profile.family_name}</p>
                </div>
              )}
              {isExpanded && onLogout && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className={`ml-auto p-1.5 rounded-lg transition-colors ${
                    activePage === 'profile'
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                  }`}
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              )}
            </button>
          </li>
          {!isMobile && onLogout && !isExpanded && (
            <li>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-2.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
