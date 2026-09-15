import { useEffect, useState } from "react";
import { ThemeContext } from "./theme";
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  return (
    <ThemeContext.Provider
      value={{ darkMode, toggleTheme: () => setDarkMode((value) => !value) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
