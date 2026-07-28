import { motion } from 'framer-motion';
import { Shield, Eye, Lock, User, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/config/constants';
import { SupportChatWidget } from '@/components/chat/SupportChatWidget';

export default function PrivacyPolicy() {
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Policy Content */}
          <div className="platform-card p-8 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Information We Collect
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Personal Information:</strong> When you create an account, we collect your name, email address, and any information you voluntarily provide in your profile.
                </p>
                <p>
                  <strong className="text-foreground">Learning Data:</strong> We collect information about your learning progress, quiz results, course completions, and interaction with educational content.
                </p>
                <p>
                  <strong className="text-foreground">Usage Data:</strong> We collect data on how you use our platform, including pages visited, features used, and time spent on activities.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                How We Use Your Information
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Personalized Learning:</strong> To customize your learning experience and provide relevant course recommendations.
                </p>
                <p>
                  <strong className="text-foreground">Account Management:</strong> To manage your account, provide support, and communicate with you about our services.
                </p>
                <p>
                  <strong className="text-foreground">Platform Improvement:</strong> To analyze usage patterns and improve our educational content and features.
                </p>
                <p>
                  <strong className="text-foreground">Security:</strong> To protect our platform and prevent fraudulent activity.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Data Sharing & Disclosure
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">We do not sell your personal data.</strong> We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With trusted service providers who assist in operating our platform</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Your Rights
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Export your data</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at {CONTACT_EMAIL}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Data Security</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We implement industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Children's Privacy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Our platform is designed for educational purposes. We do not knowingly collect personal information from children under 13 without parental consent. If we become aware that we have collected such information, we will take steps to delete it.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Changes to This Policy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions about this privacy policy or our data practices, please contact us at:
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
