"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Rocket, Star, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="text-blue-600 dark:text-blue-400">Learnzaa</span> – Fun Learning for Kids
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Interactive lessons, quizzes, points & rewards
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 btn-statement">
            <Link to="/auth">Sign Up / Start Free Trial</Link>
          </Button>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 btn-statement">
            <Link to="#features">Learn More</Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-200 to-green-200 rounded-full flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="flex justify-center space-x-4 mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <Rocket className="w-8 h-8 text-green-600" />
                  <Star className="w-8 h-8 text-yellow-500" />
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-lg font-semibold text-gray-800">Learning Made Fun!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;