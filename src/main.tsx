import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import { SessionContextProvider } from "./integrations/supabase/supabaseContext";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SessionContextProvider>
      <App />
    </SessionContextProvider>
  </ThemeProvider>
);