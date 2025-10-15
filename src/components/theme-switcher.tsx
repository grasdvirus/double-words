
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex flex-col items-center">
      <div className="theme-switcher-circle-container">
        <div className="theme-switcher-circle">
          <div className="theme-switcher-crescent"></div>
        </div>
      </div>
      
      <div className="theme-switcher-container w-48">
        <input 
          id="theme-switch" 
          type="checkbox" 
          className="hidden"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <label htmlFor="theme-switch">
          <div className="toggle"></div>
          <div className="names">
            <p className="light">Clair</p>
            <p className="dark">Sombre</p>
          </div>
        </label>
      </div>
    </div>
  );
}
