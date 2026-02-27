"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Microscope, Calculator, Atom, Cpu, Rocket, Beaker, Code, Gauge, FlaskConical, Binary, Network, Cable } from 'lucide-react';

const features = [
  {
    icon: <Microscope className="w-8 h-8 text-purple-600" />,
    title: "Chemistry Explorations",
    description: "Safe, interactive chemistry experiments and concepts for young scientists."
  },
  {
    icon: <Calculator className="w-8 h-8 text-blue-600" />,
    title: "Math Mastery",
    description: "From basic arithmetic to advanced concepts, make math fun and accessible."
  },
  {
    icon: <Atom className="w-8 h-8 text-red-600" />,
    title: "Physics Adventures",
    description: "Discover the laws of motion, energy, and matter through engaging simulations."
  },
  {
    icon: <Cpu className="w-8 h-8 text-green-600" />,
    title: "Computer Science",
    description: "Learn coding, algorithms, and computational thinking with hands-on projects."
  },
  {
    icon: <Rocket className="w-8 h-8 text-orange-600" />,
    title: "Engineering Challenges",
    description: "Design, build, and test solutions to real-world engineering problems."
  },
  {
    icon: <Beaker className="w-8 h-8 text-pink-600" />,
    title: "STEM Projects",
    description: "Cross-disciplinary projects that combine multiple STEM fields creatively."
  },
  {
    icon: <Code className="w-8 h-8 text-indigo-600" />,
    title: "Programming Labs",
    description: "Interactive coding environments with instant feedback and guidance."
  },
  {
    icon: <Gauge className="w-8 h-8 text-yellow-600" />,
    title: "Scientific Method",
    description: "Learn to think like a scientist with hypothesis testing and data analysis."
  },
  {
    icon: <FlaskConical className="w-8 h-8 text-cyan-600" />,
    title: "Lab Simulations",
    description: "Virtual laboratories for safe experimentation and discovery."
  },
  {
    icon: <Binary className="w-8 h-8 text-violet-600" />,
    title: "Digital Logic",
    description: "Understand how computers work at the fundamental level."
  },
  {
    icon: <Network className="w-8 h-8 text-emerald-600" />,
    title: "Networks & Connectivity",
    description: "Explore how devices communicate and connect in the modern world."
  },
  {
    icon: <Cable className="w-8 h-8 text-amber-600" />,
    title: "Electronics Basics",
    description: "Introduction to circuits, components, and electronic systems."
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Why Choose Learnzaa for STEM?</h2>

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