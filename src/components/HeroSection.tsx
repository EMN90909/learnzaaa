"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Rocket, Star, Users, Microscope, Calculator, Atom, Cpu } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="text-blue-600 dark:text-blue-400">Learnzaa</span> – STEM Learning for Future Innovators
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore Engineering, Technology, Chemistry, Physics, Math & Computer Science
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <Link to="/auth">Start Free Trial</Link>
          </Button>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <Link to="#features">Explore STEM</Link>
          </Button>
        </div>

        <div className="flex justify-center gap-8 flex-wrap">
          <div className="flex flex-col items-center">
            <Microscope className="w-12 h-12 text-purple-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chemistry</span>
          </div>
          <div className="flex flex-col items-center">
            <Calculator className="w-12 h-12 text-blue-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Math</span>
          </div>
          <div className="flex flex-col items-center">
            <Atom className="w-12 h-12 text-red-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Physics</span>
          </div>
          <div className="flex flex-col items-center">
            <Cpu className="w-12 h-12 text-green-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Computer Science</span>
          </div>
          <div className="flex flex-col items-center">
            <Rocket className="w-12 h-12 text-orange-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Engineering</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;