import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  // Default theme = system
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  // Default font size = medium
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "medium";
  });

  // Save theme whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save font size whenever it changes
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
}
