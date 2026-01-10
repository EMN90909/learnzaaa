import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-600 dark:text-blue-400">About Learnzaa</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Making learning fun, interactive, and accessible for kids in Kenya and beyond
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <BookOpen className="text-blue-600" /> Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                At Learnzaa, we believe that every child deserves access to quality education that is engaging, interactive, and fun.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Our mission is to transform traditional learning into an exciting adventure where kids can explore, discover, and grow at their own pace.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Users className="text-green-600" /> Our Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Learnzaa was founded by a passionate 15-year-old developer who wanted to make learning more engaging for students in Kenya.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                What started as a small project has grown into a platform that helps hundreds of learners discover the joy of learning through interactive lessons, quizzes, and rewards.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">What Makes Us Unique</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-semibold mb-2">Interactive Learning</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our lessons are designed to be engaging and interactive, making learning fun and effective.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="font-semibold mb-2">Gamified Experience</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earn points, level up, and unlock achievements as you complete lessons and quizzes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="font-semibold mb-2">Accessible Anywhere</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access your learning materials from any device, anytime, anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
                </div>
                <h3 className="font-semibold mb-2">Parent-Friendly</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Parents can easily track their child's progress and see their learning journey.
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
                <div className="w-24 h-24 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">L</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Learnzaa Founder</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">15-year-old Developer & Educator</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A passionate young developer who believes in the power of technology to transform education in Kenya.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-green-600 dark:bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Our Community</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Parents, Teachers & Learners</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A growing community of educators, parents, and students who believe in making learning fun and accessible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Join Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Be part of the learning revolution. Whether you're a parent, teacher, or student, you can help us make education more engaging and accessible.
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