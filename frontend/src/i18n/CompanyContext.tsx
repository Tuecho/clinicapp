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
  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'Clínica Valencia';
  });

  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const response = await fetch('/api/settings/company-name');
        if (response.ok) {
          const data = await response.json();
          const name = data.companyName || 'Clínica Valencia';
          setCompanyName(name);
          localStorage.setItem(STORAGE_KEY, name);
        }
      } catch (error) {
        console.error('Error fetching company name:', error);
      }
    };

    fetchCompanyName();
  }, []);

  return (
    <CompanyContext.Provider value={{ companyName, setCompanyName }}>
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
