import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, BookOpen, Users, CreditCard, Gavel, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-600 dark:text-blue-400">Terms of Service</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Please read these terms carefully before using Learnzaa STEM
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last updated: January 9, 2026
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="text-blue-600" /> Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to Learnzaa STEM! These Terms of Service ("Terms") govern your access to and use of our STEM education platform, including our website, mobile applications, and related services.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing or using Learnzaa, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our platform.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Learnzaa STEM is designed for educational purposes and is intended for use by parents, guardians, educators, and learners interested in science, technology, engineering, and mathematics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <BookOpen className="text-green-600" /> Use of Our Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Eligibility</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To use Learnzaa STEM, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Be at least 18 years old to create a parent/educator account</li>
                <li>Have parental consent if you are under 18 and using a learner account</li>
                <li>Have the legal capacity to enter into binding agreements</li>
                <li>Not be prohibited from using our platform under applicable laws</li>
              </ul>

              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Account Responsibilities</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Providing accurate and complete information when creating your account</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring that children using learner accounts have appropriate supervision</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Users className="text-purple-600" /> User Conduct
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                When using Learnzaa STEM, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Use the platform only for lawful purposes</li>
                <li>Respect the rights and privacy of other users</li>
                <li>Not interfere with or disrupt the platform</li>
                <li>Not attempt to gain unauthorized access to any part of the platform</li>
                <li>Not use the platform to transmit harmful or malicious content</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Prohibited Activities</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Violate any intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Transmit any viruses, worms, or harmful code</li>
                <li>Attempt to reverse engineer or hack our systems</li>
                <li>Use automated means to access or scrape our platform</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <CreditCard className="text-yellow-600" /> Payments and Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Subscription Plans</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Learnzaa STEM offers both free and premium subscription plans. By subscribing to a premium plan, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Pay the applicable fees for the selected plan</li>
                <li>Provide valid payment information</li>
                <li>Authorize us to charge your payment method for the subscription fees</li>
                <li>Understand that subscriptions auto-renew unless canceled</li>
              </ul>

              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Payment Processing</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                All payments are processed securely through Stripe. We do not store your full payment information on our servers.
              </p>

              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Refunds and Cancellations</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may cancel your subscription at any time through your account settings. Refunds are subject to our refund policy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>No refunds for partial subscription periods</li>
                <li>Refund requests must be made within 14 days of purchase</li>
                <li>Refunds are at our sole discretion</li>
                <li>Contact info@emtra.top for refund requests</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Lock className="text-red-600" /> Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                All content on Learnzaa STEM, including text, graphics, logos, images, and software, is the property of Learnzaa or its licensors and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our trademarks or logos without authorization</li>
                <li>Remove or alter any copyright notices</li>
                <li>Use our content for commercial purposes</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                We respect the intellectual property rights of others and expect our users to do the same.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-100">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Gavel className="text-indigo-600" /> Termination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may terminate or suspend your account and access to Learnzaa STEM at our sole discretion, without notice, for any reason, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Violation of these Terms</li>
                <li>Engaging in prohibited activities</li>
                <li>Non-payment of fees</li>
                <li>Security concerns</li>
                <li>Inactivity for an extended period</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Upon termination, your right to use the platform will immediately cease. We may, but are not obligated to, provide you with an opportunity to retrieve your data before termination.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You may terminate your own account at any time through your account settings.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-100">
            <CardHeader className="bg-teal-50">
              <CardTitle className="flex items-center gap-2 text-teal-600">
                <ShieldCheck className="text-teal-600" /> Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Disclaimer of Warranties</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Learnzaa STEM is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties that the platform will be uninterrupted or error-free</li>
                <li>Warranties that the platform is free of viruses or harmful components</li>
                <li>Warranties regarding the accuracy or completeness of STEM content</li>
              </ul>

              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Limitation of Liability</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To the fullest extent permitted by law, Learnzaa STEM shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Loss of profits, revenue, or data</li>
                <li>Business interruption</li>
                <li>Cost of substitute services</li>
                <li>Any damages arising from your use of the platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Calendar className="text-orange-600" /> Changes to These Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may modify these Terms from time to time. We will notify you of any significant changes by posting the new Terms on our platform and updating the "Last updated" date at the top of this document.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your continued use of Learnzaa STEM after any changes constitutes your acceptance of the new Terms. If you do not agree to the changes, you must stop using the platform.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We encourage you to review these Terms periodically to stay informed about your rights and obligations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-100">
            <CardHeader className="bg-pink-50">
              <CardTitle className="flex items-center gap-2 text-pink-600">
                <Gavel className="text-pink-600" /> Governing Law and Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law principles.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Any disputes arising from or relating to these Terms or your use of Learnzaa STEM shall be resolved through good faith negotiations. If we cannot resolve the dispute amicably, it shall be submitted to the courts of Nairobi, Kenya.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                The United Nations Convention on Contracts for the International Sale of Goods shall not apply to these Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <Users className="text-gray-600" /> Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about these Terms or our platform, please contact us:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>Email: info@emtra.top</p>
                <p>Address: Learnzaa STEM, Nairobi, Kenya</p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                For legal inquiries, please contact our legal team at info@emtra.top.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thank you for choosing Learnzaa STEM. We are committed to providing a safe, engaging, and effective STEM learning platform.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;