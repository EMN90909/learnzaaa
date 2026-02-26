"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "My son finally loves science! The chemistry experiments are safe and fascinating.",
    author: "Parent of 12-year-old"
  },
  {
    quote: "As a teacher, I use Learnzaa's physics simulations to make abstract concepts tangible.",
    author: "STEM Educator, Nairobi"
  },
  {
    quote: "The coding challenges helped me build my first app. Now I'm studying computer science!",
    author: "16-year-old student"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">What STEM Learners Are Saying</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Quote className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-center text-lg">"{testimonial.quote}"</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center font-semibold text-gray-800 dark:text-gray-200">– {testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Teen founder making STEM accessible!</h3>
          <p className="text-gray-600 dark:text-gray-400">Empowering young minds in Kenya and beyond with quality STEM education.</p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;