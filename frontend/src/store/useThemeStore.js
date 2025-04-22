import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEMES } from '../constants';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (newTheme) => {
        if (!THEMES.includes(newTheme)) {
          console.error(`Invalid theme: ${newTheme}`);
          return;
        }
        set({ theme: newTheme });
        // Apply theme to both document and html elements
        document.documentElement.setAttribute("data-theme", newTheme);
        document.querySelector('html').setAttribute("data-theme", newTheme);
      },
      initTheme: () => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        document.querySelector('html').setAttribute("data-theme", savedTheme);
        set({ theme: savedTheme });
      }
    }),
    {
      name: "theme-storage",
      getStorage: () => localStorage,
    }
  )
);