"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import './globals.css';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/new" element={<div>New Lesson Page</div>} />
        <Route path="/settings" element={<div>Settings Page</div>} />
      </Routes>
    </div>
  );
}

export default App;