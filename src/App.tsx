import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisitPage from "./pages/VisitPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { SessionContextProvider } from "./integrations/supabase/supabaseContext";
import DashboardPage from "./pages/DashboardPage";
import LessonsPage from "./pages/LessonsPage";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import LearnersDashboard from "./pages/LearnersDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<VisitPage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/learners" element={<LearnersDashboard />} />
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