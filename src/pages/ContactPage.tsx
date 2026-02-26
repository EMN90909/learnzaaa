import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-600 dark:text-blue-400">Contact Us</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get in touch with the Learnzaa STEM team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Mail className="text-blue-600" /> Email Us
              </CardTitle>
              <CardDescription>We'd love to hear from you!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium">General Inquiries</p>
                    <a href="mailto:info@emtra.top" className="text-blue-600 hover:underline">info@emtra.top</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="font-medium">Support</p>
                    <a href="mailto:info@emtra.top" className="text-blue-600 hover:underline">info@emtra.top</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="font-medium">Partnerships</p>
                    <a href="mailto:info@emtra.top" className="text-blue-600 hover:underline">info@emtra.top</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  Follow Us
                </CardTitle>
                <CardDescription>Stay connected for STEM education updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                      <Instagram className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                    </div>
                    <div>
                      <p className="font-medium">Instagram</p>
                      <a href="https://www.instagram.com/emtra_co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@emtra_co</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Twitter className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium">Twitter/X</p>
                      <a href="https://search.brave.com/images?q=X+%28social+network%29&context=W3sic3JjIjoiaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi9jL2NlL1hfbG9nb18yMDIzLnN2Zy8yNTBweC1YX2xvZ29fMjAyMy5zdmcucG5nIiwidGV4dCI6IlggbG9nbyAyMDIzIiwicGFnZV91cmwiOiJodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ud2l0dGVyIn1d&sig=81c8455b9029b2d9d74f7cc05af02ef4eac20cfeefed68daf34cd547d60b67a3&nonce=2cc07c9496c249233e3ace50ac342198&source=infoboxImg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Follow us</a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">What STEM subjects do you cover?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  We cover Chemistry, Physics, Mathematics, Computer Science, Engineering, and Technology through interactive lessons and hands-on projects.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Is Learnzaa suitable for all ages?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! Our STEM content is adapted for different age groups, from elementary to high school, with age-appropriate challenges and projects.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">How do I get started?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply create a free account, add your learners, and start exploring our STEM lessons and projects immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Do you offer coding courses?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! We have comprehensive computer science courses including programming, web development, and computational thinking for all skill levels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Ready to Explore STEM?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join thousands of students discovering the exciting world of science, technology, engineering, and mathematics.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
            <Link to="/auth">Start Learning Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;