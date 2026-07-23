import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/config/constants';
import { SupportChatWidget } from '@/components/chat/SupportChatWidget';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-secondary/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gradient-brand">
              FunFinity Academy
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Back to App</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Terms Content */}
          <div className="platform-card p-8 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Acceptance of Terms
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  By accessing and using FunFinity Academy, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
                </p>
                <p>
                  We reserve the right to modify these terms at any time. Your continued use of the platform after such modifications constitutes your acceptance of the updated terms.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Responsibilities
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p>
                  <strong className="text-foreground">Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>
                <p>
                  <strong className="text-foreground">Account Sharing:</strong> You may not share your account credentials with others. Each individual should have their own account.
                </p>
                <p>
                  <strong className="text-foreground">Notification of Breach:</strong> You must notify us immediately of any unauthorized use of your account or any other breach of security.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Acceptable Use Policy
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform for any illegal purpose or in violation of any applicable laws</li>
                  <li>Attempt to gain unauthorized access to any part of the platform</li>
                  <li>Interfere with or disrupt the platform's servers or networks</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Copy, modify, or distribute any content without permission</li>
                  <li>Use the platform to spam or send unsolicited messages</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                User Content
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Ownership:</strong> You retain ownership of any content you submit to the platform.
                </p>
                <p>
                  <strong className="text-foreground">License:</strong> By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content for the purpose of operating and improving the platform.
                </p>
                <p>
                  <strong className="text-foreground">Responsibility:</strong> You are solely responsible for the content you submit and ensure it does not violate any laws or third-party rights.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Terms (if applicable)
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Subscription Fees:</strong> Any subscription fees will be clearly displayed before purchase. You agree to pay all fees incurred under your account.
                </p>
                <p>
                  <strong className="text-foreground">Refund Policy:</strong> Refunds will be handled in accordance with our refund policy, which is available separately.
                </p>
                <p>
                  <strong className="text-foreground">Cancellation:</strong> You may cancel your subscription at any time through your account settings or by contacting support.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Intellectual Property</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Platform Content:</strong> All content on the platform, including courses, materials, videos, text, graphics, and software, is owned by FunFinity Academy or its licensors and is protected by intellectual property laws.
                </p>
                <p>
                  <strong className="text-foreground">Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes.
                </p>
                <p>
                  <strong className="text-foreground">Restrictions:</strong> You may not copy, modify, distribute, or create derivative works of any platform content without our express written permission.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Privacy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Your use of the platform is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. Please review our Privacy Policy carefully.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Disclaimer of Warranties</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  The platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, secure, or error-free.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  To the fullest extent permitted by law, FunFinity Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Termination</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.
                </p>
                <p>
                  Upon termination, your right to use the platform will immediately cease. All provisions of these terms shall survive termination.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Governing Law</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FunFinity Academy is based, without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="font-semibold text-foreground">
                  Email: {CONTACT_EMAIL}
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
      <SupportChatWidget />
    </div>
  );
}
