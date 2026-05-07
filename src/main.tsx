import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { I18nProvider } from "@/lib/i18n";

// Default site to dark mode unless user has explicitly chosen otherwise
(function applyInitialTheme() {
  try {
    const saved = localStorage.getItem("bb:dark-mode");
    const dark = saved === null ? true : JSON.parse(saved);
    document.documentElement.classList.toggle("dark", !!dark);
    if (saved === null) localStorage.setItem("bb:dark-mode", "true");
  } catch {
    document.documentElement.classList.add("dark");
  }
})();

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);

