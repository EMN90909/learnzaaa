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
import LearnerAuthPage from "./pages/LearnerAuthPage";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearnersDashboard from "./pages/LearnersDashboard";
import LearnerPage from "./pages/LearnerPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminAuthPage from "./pages/SuperAdminAuthPage";
import SuperAdmin1415Page from "./pages/SuperAdmin1415Page";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SessionContextProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<VisitPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/learner-auth" element={<LearnerAuthPage />} />
            <Route path="/super-admin-auth" element={<SuperAdminAuthPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/learners-dashboard" element={<LearnersDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="/(1415emn)2010" element={<SuperAdmin1415Page />} />
            <Route path="/learner-dashboard" element={<LearnerDashboard />} />
            <Route path="/learner-page" element={<LearnerPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;