import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName = 'default' | 'ocean' | 'forest' | 'night';

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
      },
    }),
    {
      name: 'family-agent-theme',
    }
  )
);
