"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';

const pricingPlans = [
  {
    title: "Free Plan",
    price: "$0",
    description: "Perfect for trying out Learnzaa",
    features: [
      "5 learners max",
      "Limited lessons",
      "Basic progress tracking",
      "Community support"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline"
  },
  {
    title: "Premium Plan",
    price: "$12",
    description: "Full access for serious learners",
    features: [
      "Unlimited learners",
      "All lessons & content",
      "Advanced progress tracking",
      "Priority support",
      "10% discount for 2+ learners"
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default"
  }
];

const PricingSection: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">Simple, Transparent Pricing</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Choose the plan that works best for your family. No hidden fees, no surprises.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`flex flex-col ${plan.title === "Premium Plan" ? "border-2 border-blue-500" : ""}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription className="text-center">{plan.description}</CardDescription>
                <div className="text-center my-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.title === "Premium Plan" && <span className="text-gray-500 dark:text-gray-400">/month per learner</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.buttonVariant as any}>
                  <Link to="/auth">{plan.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Trusted & Safe</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learnzaa is built with privacy and security in mind. Your data is protected and your learning experience is safe.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;