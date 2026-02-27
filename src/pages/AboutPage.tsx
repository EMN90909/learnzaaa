import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Globe, Heart, Microscope, Code, Atom, Cpu, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-600 dark:text-blue-400">About Learnzaa STEM</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Transforming STEM education for the next generation of innovators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Microscope className="text-blue-600" /> Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                At Learnzaa STEM, we believe every child deserves access to high-quality science, technology, engineering, and mathematics education that is engaging, interactive, and relevant to the modern world.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Our mission is to make STEM subjects accessible and exciting, preparing young learners for the challenges and opportunities of the 21st century.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Code className="text-green-600" /> Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Learnzaa was founded by a passionate teen developer who saw the need for better STEM education resources in Kenya and beyond.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What started as a small project has grown into a comprehensive STEM platform that helps hundreds of learners discover the joy of scientific exploration, coding, engineering, and mathematics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Our STEM Focus Areas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Microscope className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="font-semibold mb-2">Chemistry</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive chemistry lessons and virtual experiments
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-semibold mb-2">Mathematics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From arithmetic to calculus, made engaging and understandable
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Atom className="w-8 h-8 text-red-600 dark:text-red-300" />
                </div>
                <h3 className="font-semibold mb-2">Physics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore motion, energy, and matter through simulations
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="font-semibold mb-2">Computer Science</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Coding, algorithms, and computational thinking skills
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Our Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img 
                    src="https://copilot.microsoft.com/th/id/BCO.afb4078d-a26d-47e4-9f13-cb94534c117f.png" 
                    alt="EMN Founder" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">EMN</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Teen Founder & Lead Developer</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A passionate young developer dedicated to making quality STEM education accessible to all students in Kenya and beyond.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Our Community</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">STEM Educators & Learners</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A growing community of educators, parents, and students passionate about STEM education.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Join Our STEM Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Be part of the STEM education revolution. Whether you're a parent, teacher, or student, you can help us make science, technology, engineering, and mathematics more engaging and accessible.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
              <Link to="/auth">Sign Up Now</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;