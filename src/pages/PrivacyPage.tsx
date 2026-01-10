import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, EyeOff, Database, UserCheck } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-600 dark:text-blue-400">Privacy Policy</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your privacy is important to us. This policy explains how we handle your information.
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
                Learnzaa ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                By using Learnzaa, you consent to the data practices described in this policy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Database className="text-green-600" /> Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Personal Information</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may collect personal information that you provide to us, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Learner information (for parents/guardians)</li>
              </ul>

              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Usage Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We automatically collect certain information about your device and usage of our platform, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Learning progress and activity</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Lock className="text-purple-600" /> How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Providing and maintaining our platform</li>
                <li>Personalizing your learning experience</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Tracking learning progress and providing feedback</li>
                <li>Improving our services and developing new features</li>
                <li>Communicating with you about your account and updates</li>
                <li>Ensuring the security of our platform</li>
                <li>Complying with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <UserCheck className="text-yellow-600" /> Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell your personal information. We may share your information in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>With service providers who help us operate our platform (e.g., Stripe for payments, Supabase for hosting)</li>
                <li>With parents/guardians for learner accounts (with appropriate permissions)</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transaction (e.g., merger, acquisition)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                All third-party service providers are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <EyeOff className="text-red-600" /> Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Learnzaa is designed for children's education, and we take children's privacy very seriously.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Children under 13 can only use Learnzaa with parental consent</li>
                <li>Parent/guardian accounts have full control over child accounts</li>
                <li>We never share children's personal information without parental consent</li>
                <li>Children's accounts are created and managed by parents/guardians</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Parents can review, modify, or delete their child's information at any time through their parent account.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-100">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <ShieldCheck className="text-indigo-600" /> Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication and authorization mechanisms</li>
                <li>Regular security audits and vulnerability testing</li>
                <li>Access controls and data minimization practices</li>
                <li>Compliance with industry standards and regulations</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-100">
            <CardHeader className="bg-teal-50">
              <CardTitle className="flex items-center gap-2 text-teal-600">
                <UserCheck className="text-teal-600" /> Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your information (subject to legal requirements)</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Database className="text-orange-600" /> Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-4">
                <li>Providing our services to you</li>
                <li>Complying with legal obligations</li>
                <li>Resolving disputes</li>
                <li>Enforcing our agreements</li>
                <li>Maintaining appropriate business records</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-100">
            <CardHeader className="bg-pink-50">
              <CardTitle className="flex items-center gap-2 text-pink-600">
                <ShieldCheck className="text-pink-600" /> Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our platform and updating the "Last updated" date at the top of this policy.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We encourage you to review this policy periodically to stay informed about how we are protecting your information.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <UserCheck className="text-gray-600" /> Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>Email: privacy@learnzaa.com</p>
                <p>Address: Learnzaa, Nairobi, Kenya</p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                For privacy-related concerns, you may also contact our Data Protection Officer at dpo@learnzaa.com.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thank you for trusting Learnzaa with your information. We are committed to protecting your privacy and providing a safe learning environment.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;