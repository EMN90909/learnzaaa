"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Microscope, Code, Trophy, FlaskConical, Cpu, Beaker, Star } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-blue-600" />,
    title: "Step 1: Sign Up",
    description: "Parent or educator creates an account and adds STEM learners."
  },
  {
    icon: <Microscope className="w-8 h-8 text-purple-600" />,
    title: "Step 2: Explore STEM",
    description: "Choose from engineering, tech, chemistry, physics, math, and more."
  },
  {
    icon: <Code className="w-8 h-8 text-green-600" />,
    title: "Step 3: Build & Create",
    description: "Complete interactive lessons, coding challenges, and hands-on projects."
  },
  {
    icon: <Trophy className="w-8 h-8 text-yellow-600" />,
    title: "Step 4: Earn & Progress",
    description: "Gain points, unlock achievements, and track STEM skill development."
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-300">{index + 1}</span>
                  </div>
                </div>
                <div className="flex justify-center mb-4">
                  {step.icon}
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;