import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import './globals.css';

// Remove any import of './index.css' that might have been added
// import './index.css'; // Commented out to fix Vite import error

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Wrapper for main content to handle sidebar spacing */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/new" element={<div>New Lesson Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;