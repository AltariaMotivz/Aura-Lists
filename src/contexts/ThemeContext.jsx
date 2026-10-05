import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);
const readPreference = (key, options, fallback) => {
  try { const value = localStorage.getItem(key); return options.includes(value) ? value : fallback; }
  catch { return fallback; }
};
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => readPreference('theme', ['dark', 'light'], 'dark'));
  const [palette, setPalette] = useState(() => readPreference('aura-palette', ['prism', 'aurora', 'sunset'], 'prism'));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.palette = palette;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('theme', theme); localStorage.setItem('aura-palette', palette); } catch { /* Appearance still works without storage. */ }
  }, [theme, palette]);
  const value = useMemo(() => ({theme, setTheme, palette, setPalette, toggleTheme: () => setTheme(previous => previous === 'dark' ? 'light' : 'dark')}), [theme, palette]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
