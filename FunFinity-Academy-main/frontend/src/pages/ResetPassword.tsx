import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { SupportChatWidget } from "@/components/chat/SupportChatWidget";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, "") || "");
    const hashType = hashParams.get("type");

    const initialize = async () => {
      if (!isMounted) return;
      setCanReset(Boolean(user) || hashType === "recovery");
      setLoading(false);
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [user, location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (password.length < 8) {
      toast({ title: "Password too short", description: "Please use at least 8 characters.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Re-enter the same password in both fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.put('/api/auth/reset-password', { password });

      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Reset failed", description: error.message || "Failed to reset password", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass-card-heavy max-w-md rounded-[2rem] border border-border/50 p-8 text-center shadow-heavy">
          <Lock className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground">Reset link required</h1>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Open the password reset link from your email, then come back here to set your new password.
          </p>
          <Button variant="hero" onClick={() => navigate("/auth")}>Back to sign in</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute left-[12%] top-[14%] h-[380px] w-[380px] bg-glow-cyan opacity-60" />
      <div className="absolute bottom-[10%] right-[10%] h-[380px] w-[380px] bg-glow-accent opacity-50" />

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="glass-card-heavy rounded-[2rem] border border-border/50 p-8 shadow-heavy md:p-10">
          <Lock className="mx-auto mb-4 h-16 w-16 text-primary" />
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Set a new password</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Choose a secure new password, then sign in again with your updated credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} className="h-12 rounded-xl border-border/50 bg-secondary/40 pl-10" />
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-foreground">Confirm new password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.currentTarget.value)} className="h-12 rounded-xl border-border/50 bg-secondary/40 pl-10" />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="h-12 w-full rounded-xl" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Update password
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </motion.div>
      <SupportChatWidget />
    </div>
  );
}
