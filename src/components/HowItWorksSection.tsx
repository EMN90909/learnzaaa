"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, BookOpen, Award } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-blue-600" />,
    title: "Step 1: Sign Up",
    description: "Parent signs up and adds learners to the platform."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    title: "Step 2: Start Learning",
    description: "Learner starts lessons, reads content and takes quizzes."
  },
  {
    icon: <Award className="w-8 h-8 text-yellow-600" />,
    title: "Step 3: Earn & Progress",
    description: "Earn points, unlock hints and parent monitors progress."
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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