"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, BarChart2, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
    title: "Interactive Lessons",
    description: "Markdown lessons made easy & visual with engaging content for kids."
  },
  {
    icon: <Award className="w-8 h-8 text-green-600" />,
    title: "Quizzes & Points",
    description: "Learn, play, earn rewards and unlock achievements as you progress."
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-purple-600" />,
    title: "Parent Dashboard",
    description: "Track progress, see results and monitor your child's learning journey."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-yellow-600" />,
    title: "Affordable & Safe",
    description: "Low-cost, private & trusted platform for secure learning."
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Why Choose Learnzaa?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;