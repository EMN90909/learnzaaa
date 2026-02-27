"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Learnzaa has transformed how my kids learn! They actually look forward to their lessons now.",
    author: "Sarah M., Parent"
  },
  {
    quote: "As a teacher, I love how Learnzaa makes learning interactive and fun for students.",
    author: "John K., Educator"
  },
  {
    quote: "The points and rewards system keeps my child motivated to learn every day.",
    author: "Mary W., Parent"
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">What People Are Saying</h2>

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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">15-year-old founder making learning fun!</h3>
          <p className="text-gray-600 dark:text-gray-400">Loved by parents & kids in Kenya!</p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;