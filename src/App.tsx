import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisitPage from "./pages/VisitPage"; // Renamed from Index
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { SessionContextProvider } from "./integrations/supabase/supabaseContext";
import DashboardPage from "./pages/DashboardPage";
import LearnersPage from "./pages/LearnersPage";
import PrivateRoute from "./components/PrivateRoute"; // New component for protected routes
import Navbar from "./components/Navbar"; // New component for navigation

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Navbar /> {/* Add Navbar here */}
          <Routes>
            <Route path="/" element={<VisitPage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/learners" element={<LearnersPage />} />
              {/* Add other protected routes here */}
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;