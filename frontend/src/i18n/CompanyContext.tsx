import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface CompanyContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
}

export const CompanyContext = createContext<CompanyContextType>({
  companyName: 'Clínica Valencia',
  setCompanyName: () => {},
});

interface CompanyProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'companyName';

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [companyName, setCompanyName] = useState('Clínica Valencia');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await fetch('/api/settings/company-name');
        if (response.ok) {
          const data = await response.json();
          const name = data.companyName || 'Clínica Valencia';
          setCompanyName(name);
          localStorage.setItem(STORAGE_KEY, name);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching company name:', error);
        setIsLoaded(true);
      }
    };

    const handleCompanyNameUpdate = () => {
      fetchCompanyName();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setCompanyName(e.newValue);
      }
    };

    window.addEventListener('company_name_updated', handleCompanyNameUpdate);
    window.addEventListener('storage', handleStorageChange);
    fetchCompanyName();

    return () => {
      window.removeEventListener('company_name_updated', handleCompanyNameUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateCompanyName = (name: string) => {
    setCompanyName(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  return (
    <CompanyContext.Provider value={{ companyName, setCompanyName: updateCompanyName }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = React.useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe usarse dentro de CompanyProvider');
  }
  return context;
}
