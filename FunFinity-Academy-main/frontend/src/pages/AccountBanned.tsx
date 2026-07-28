import { motion } from "framer-motion";
import { Shield, Lock, AlertTriangle, Mail, X } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_EMAIL } from "@/config/constants";

export default function AccountBanned() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-destructive/50 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-destructive" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Header */}
            <div className="text-center space-y-2">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-display font-bold text-foreground"
              >
                Account Suspended
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground"
              >
                Your account has been temporarily restricted due to a violation of our terms of service.
              </motion.p>
            </div>

            {/* Warning Box */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="text-foreground font-medium">What this means:</p>
                  <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                    <li>You cannot access the platform features</li>
                    <li>Your account is under review by administrators</li>
                    <li>This restriction may be temporary or permanent</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-foreground">Next Steps:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>Review our Terms of Service and Community Guidelines</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>Contact our support team if you believe this is an error</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>Wait for administrator review and decision</span>
                </div>
              </div>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-secondary/50 border border-border/30 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Contact Support</p>
              </div>
              <p className="text-sm text-muted-foreground">
                If you believe this suspension is in error, please contact our support team at:
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm text-primary hover:underline break-all"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="text-xs text-muted-foreground">
                Please include your account email and any relevant details in your message.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-3"
            >
              <Button variant="outline" className="w-full" asChild>
                <a href="/privacy">View Terms of Service</a>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-4 border-t border-border/30"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <FunfinityIcon size="sm" className="text-primary" />
                <span className="text-sm font-medium text-foreground">FunFinity Academy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} FunFinity Academy. All rights reserved.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
