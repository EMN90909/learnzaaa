import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisitPage from "./pages/VisitPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { SessionContextProvider } from "./integrations/supabase/supabaseContext";
import ParentDashboardPage from "./pages/ParentDashboardPage"; // New parent dashboard
import LessonsPage from "./pages/LessonsPage"; // Renamed from LearnersPage
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import LearnerLoginPage from "./pages/LearnerLoginPage"; // New learner login
import LearnerDashboardPage from "./pages/LearnerDashboardPage"; // New learner dashboard
import ManageLearnersPage from "./pages/ManageLearnersPage"; // New page to manage learners

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
            <Route path="/learner-login" element={<LearnerLoginPage />} />
            <Route path="/lessons" element={<LessonsPage />} /> {/* Public lessons page */}
            <Route path="/lessons/:lessonId" element={<LessonsPage />} /> {/* Route for individual lesson details */}

            {/* Protected Routes for Parents/Admins */}
            <Route element={<PrivateRoute allowedRoles={['parent']} />}>
              <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
              <Route path="/manage-learners" element={<ManageLearnersPage />} />
              {/* Add other parent/admin protected routes here */}
            </Route>

            {/* Protected Routes for Learners (using local storage for session) */}
            <Route element={<PrivateRoute allowedRoles={['learner']} />}>
              <Route path="/learner-dashboard" element={<LearnerDashboardPage />} />
              {/* Add other learner protected routes here */}
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