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
import LearnerAuthPage from "./pages/LearnerAuthPage";
import LearnerDashboard from "./pages/LearnerDashboard";
import AddLearnerPage from "./pages/AddLearnerPage";
import LearnerPage from "./pages/LearnerPage";
import BillingPage from "./pages/BillingPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";

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
            <Route path="/learner-auth" element={<LearnerAuthPage />} />
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/learners" element={<LearnersDashboard />} />
              <Route path="/learners/add" element={<AddLearnerPage />} />
              <Route path="/billing" element={<BillingPage />} />
              {/* Add other protected routes here */}
            </Route>
            {/* Learner Dashboard Route - Not protected by PrivateRoute */}
            <Route path="/learner-dashboard" element={<LearnerDashboard />} />
            <Route path="/learner-page" element={<LearnerPage />} />
            {/* Public Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;