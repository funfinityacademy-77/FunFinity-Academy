import { motion } from 'framer-motion';
import { RefreshCw, CreditCard, Calendar, AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/config/constants';
import { SupportChatWidget } from '@/components/chat/SupportChatWidget';

export default function RefundPolicy() {
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
              <RefreshCw className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Refund Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Policy Content */}
          <div className="platform-card p-8 space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Overview
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  At FunFinity Academy, we want you to be completely satisfied with your learning experience. This refund policy outlines the conditions under which refunds are processed for subscription fees and other purchases.
                </p>
                <p>
                  By subscribing to or purchasing any of our services, you agree to the terms outlined in this policy.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Refund Eligibility
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Free Trial Period:</strong> New users may be eligible for a free trial period (typically 7-14 days) depending on the subscription plan. During this period, you can cancel at any time without being charged.
                </p>
                <p>
                  <strong className="text-foreground">Subscription Refunds:</strong> If you are not satisfied with your subscription, you may request a refund within 7 days of your initial payment. Refunds are processed only for the first billing cycle.
                </p>
                <p>
                  <strong className="text-foreground">Annual Subscriptions:</strong> For annual subscriptions, refund requests must be made within 14 days of purchase and before accessing more than 10% of the premium content.
                </p>
                <p>
                  <strong className="text-foreground">Ineligible Cases:</strong> Refunds are not available for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscriptions that have been active for more than the refund period</li>
                  <li>Partial months of service</li>
                  <li>Accounts that have violated our Terms of Service</li>
                  <li>Promotional or discounted subscriptions</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                How to Request a Refund
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contact our support team at {CONTACT_EMAIL}</li>
                  <li>Include your account email address and subscription details</li>
                  <li>Provide a brief explanation for your refund request</li>
                  <li>Our team will review your request within 3-5 business days</li>
                </ol>
                <p>
                  Refund requests are typically processed within 5-10 business days of approval. The refund will be credited back to the original payment method used for the purchase.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Cancellation Policy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Monthly Subscriptions:</strong> You may cancel your monthly subscription at any time through your account settings. Cancellation takes effect at the end of the current billing cycle, and you will retain access until that date.
                </p>
                <p>
                  <strong className="text-foreground">Annual Subscriptions:</strong> Annual subscriptions may be cancelled at any time. Upon cancellation, you will retain access for the remainder of the paid term. No partial refunds will be issued for the remaining time.
                </p>
                <p>
                  <strong className="text-foreground">Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the next billing date. You will receive a reminder email 7 days before renewal.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Exceptions</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We reserve the right to deny refund requests in cases of:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Suspected fraudulent activity or abuse of our refund policy</li>
                  <li>Multiple refund requests from the same account</li>
                  <li>Accounts that have been terminated for Terms of Service violations</li>
                  <li>Requests made after the specified refund period</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Changes to This Policy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We may update this refund policy from time to time. Changes will be effective immediately upon posting to this page. Your continued use of our services after any changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact Us
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  If you have any questions about this refund policy or need assistance with a refund request, please contact us at:
                </p>
                <p className="font-semibold text-foreground">
                  Email: {CONTACT_EMAIL}
                </p>
                <p className="text-sm">
                  We typically respond to all inquiries within 24-48 business hours.
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
