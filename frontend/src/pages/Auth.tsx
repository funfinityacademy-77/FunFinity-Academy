import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, Heart, Loader2, Lock, Mail,
  Sparkles, User, ShieldCheck, UserCheck
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FeatureSlideshow } from "@/components/auth/FeatureSlideshow";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { supabase } from "@/lib/supabase";
import { useGamification } from "@/hooks/use-gamification";
import { SupportChatWidget } from "@/components/chat/SupportChatWidget";
import { z } from "zod";

type Role = "student";
type AuthMode = "signin" | "signup" | "reset";

// Zod validation schemas for secure form validation
const SignupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  role: z.literal("student"),
});

const SigninSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

const ResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .email("Please enter a valid email address"),
});

type SignupFormData = z.infer<typeof SignupSchema>;
type SigninFormData = z.infer<typeof SigninSchema>;
type ResetFormData = z.infer<typeof ResetSchema>;

const roles: { key: Role; label: string; icon: React.ReactNode; desc: string; tone: string; path: string }[] = [
  { key: "student", label: "Student", icon: <User className="w-4 h-4" />, desc: "Learn & grow", tone: "border-primary/30 bg-primary/10 text-primary", path: "/app" },
];

const copy: Record<AuthMode, { title: string; body: string; cta: string }> = {
  signin: {
    title: "Welcome Back",
    body: "Sign in to continue learning, tracking progress, and exploring the platform.",
    cta: "Sign In",
  },
  signup: {
    title: "Create Your Account",
    body: "Start with a secure account and get instant access to your learning space.",
    cta: "Create Account",
  },
  reset: {
    title: "Reset Your Password",
    body: "We’ll send you a secure recovery link so you can get back into your account.",
    cta: "Send Reset Link",
  },
};

export default function Auth() {
  const { updateStreak, addPoints, earnBadge } = useGamification();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const navigate = useNavigate();
  const { user, role: userRole, signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();

  const isSignUp = mode === "signup";
  const isReset = mode === "reset";

  const activeCopy = useMemo(() => copy[mode], [mode]);

  // Validation functions using Zod schemas
  const validateEmail = (email: string): boolean => {
    const result = z.string().email().safeParse(email);
    return result.success;
  };

  const validateName = (name: string): boolean => {
    const result = z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/).safeParse(name);
    return result.success;
  };

  const validatePassword = (password: string): boolean => {
    const result = z.string().min(8).max(128).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
    ).safeParse(password);
    return result.success;
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isReset) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (isSignUp && !validatePassword(password)) {
        newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)";
      }
    }

    if (isSignUp && (!name || !validateName(name))) {
      newErrors.name = "Please enter a valid name (2-50 characters, letters only)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (user && userRole) {
      console.log('Auth: User logged in with role:', userRole, 'Email:', user.email);

      // Update gamification streak on login
      if (userRole === "student") {
        updateStreak();
        addPoints(10, "Daily login bonus");
        
        // Check for early bird/night owl badges based on login time
        const hour = new Date().getHours();
        if (hour < 8) {
          earnBadge("early-bird");
        } else if (hour >= 22) {
          earnBadge("night-owl");
        }
      }

      // For students, check if they've completed DNA assessment
      if (userRole === "student") {
        const checkDNAProfile = async () => {
          try {
            // Check learning_dna_profiles table first
            const { data: dnaProfile } = await supabase
              .from('learning_dna_profiles')
              .select('completed')
              .eq('user_id', user.id)
              .single();
            
            // Also check profiles table for dna_complete flag
            const { data: profile } = await supabase
              .from('profiles')
              .select('dna_complete')
              .eq('id', user.id)
              .single();
            
            // Check localStorage as fallback
            const lsKey = `funfinity_onboarding_${user.id}`;
            const localStorageComplete = localStorage.getItem(lsKey);
            
            const isCompleted = dnaProfile?.completed || profile?.dna_complete || (localStorageComplete && JSON.parse(localStorageComplete).dna_complete);
            
            if (isCompleted) {
              navigate("/app");
            } else {
              navigate("/app/learning-dna");
            }
          } catch (error) {
            console.error("Unable to verify your learning profile. Redirecting to setup.");
            // If check fails, default to learning-dna to be safe
            navigate("/app/learning-dna");
          }
        };
        checkDNAProfile();
      } else if (userRole === "admin") {
        console.log('Auth: Redirecting admin to /admin');
        navigate("/admin");
      } else {
        console.log('Auth: Unknown role, redirecting to /app');
        navigate("/app");
      }
    }
  }, [user, userRole, navigate, updateStreak, addPoints, earnBadge]);

  const validateInputs = (): string | null => {
    const trimmedEmail = email.trim();
    const emailResult = z.string().email().safeParse(trimmedEmail);
    if (!trimmedEmail || !emailResult.success) return "Please enter a valid email address.";
    if (trimmedEmail.length > 255) return "Email must be less than 255 characters.";
    if (isReset) return null;
    if (!password) return "Please enter your password.";
    if (password.length > 128) return "Password must be less than 128 characters.";
    if (isSignUp) {
      const passwordResult = z.string().min(8).max(128).regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
      ).safeParse(password);
      if (!passwordResult.success) return "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&).";
    }
    if (isSignUp) {
      const trimmedName = name.trim();
      const nameResult = z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/).safeParse(trimmedName);
      if (!trimmedName || !nameResult.success) return "Please enter a valid name (2-50 characters, letters only).";
      if (trimmedName.length > 100) return "Name must be less than 100 characters.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const validationError = validateInputs();
    if (validationError) {
      toast({ title: "Validation error", description: validationError, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (isReset) {
        const { error } = await resetPassword(email.trim());
        if (error) {
          toast({ title: "Reset failed", description: error.message, variant: "destructive" });
          return;
        }
        toast({ title: "Reset link sent", description: "Check your email for the secure recovery link." });
        setMode("signin");
        return;
      }
      if (isSignUp) {
        const { error } = await signUp(email.trim(), password, name.trim(), role);
        if (error) {
          if (error.code === "user_already_exists" || /already registered/i.test(error.message ?? "")) {
            toast({ title: "Account already exists", description: "Use sign in instead." });
            setMode("signin");
            setPassword("");
            return;
          }
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
          return;
        }
        toast({ title: "Account created", description: "You can now sign in immediately." });
        setMode("signin");
        setPassword("");
        return;
      }
      const { error } = await signIn(email.trim(), password);
      if (error) {
        const description = /invalid login credentials/i.test(error.message ?? "")
          ? "Invalid email or password."
          : error.message;
        toast({ title: "Sign in failed", description, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden relative">
      {/* Left Section: Feature Slideshow (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary/5 border-r border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />
        <FeatureSlideshow />
      </div>

      {/* Right Section: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Glow Backgrounds */}
        <div className="absolute top-[10%] right-[10%] h-[300px] w-[300px] bg-glow-cyan opacity-20 -z-10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[300px] w-[300px] bg-glow-magenta opacity-10 -z-10 blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-card-heavy rounded-[2.5rem] border border-border/50 p-8 lg:p-10 shadow-heavy overflow-hidden">
            <div className="mb-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shadow-lg transition-transform hover:scale-105">
                  <FunfinityIcon size="lg" className="text-primary" />
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
                    {activeCopy.title}
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeCopy.body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trust Signals */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Privacy Protected</span>
                </div>
                {isSignUp && (
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Free to Start</span>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 mb-4">
                      <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="h-12 rounded-xl border-border/50 bg-secondary/40 pl-11 focus:bg-background transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-border/50 bg-secondary/40 pl-11 focus:bg-background transition-all"
                  />
                </div>
              </div>

              {!isReset && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-70 transition-opacity"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-border/50 bg-secondary/40 pl-11 pr-11 focus:bg-background transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="h-14 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-5 w-5 mr-2" />
                )}
                {activeCopy.cta}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setMode(isSignUp ? "signin" : (mode === "reset" ? "signin" : "signup"))}
                className="group inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-primary group-hover:underline">Sign In</span></>
                ) : mode === "reset" ? (
                  <><ArrowLeft className="h-4 w-4" /> Back to Sign In</>
                ) : (
                  <>Don't have an account? <span className="text-primary group-hover:underline">Join Now</span></>
                )}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <UserCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <SupportChatWidget />
    </div>
  );
}


