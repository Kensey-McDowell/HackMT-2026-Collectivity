import { createContext, useContext, useState } from "react";

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");

  return (
    <SettingsContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
}
