import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, 
  Brain, BookOpen, Users, Shield, Zap, ChevronLeft, ChevronRight,
  Star, Heart, Trophy, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useRateLimit } from '@/hooks/use-rate-limit';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Learning",
    description: "Personalized education with intelligent tutoring",
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Real-Time Collaboration",
    description: "Learn together with peers and instructors",
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "Bank-level security for your data and privacy",
    color: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Lightning Fast",
    description: "Optimized performance for seamless learning",
    color: "from-yellow-500/20 to-orange-500/20"
  }
];

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { isLocked, lockTimeRemaining, checkRateLimit, recordAttempt, resetAttempts } = useRateLimit({ maxAttempts: 5, windowMs: 60000 });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    agreeToTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleArray: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particleArray.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(147, 51, 234, 0.1)';
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limiting for sign-in only (not sign-up)
    if (!isSignUp) {
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        setError(`Too many attempts. Please wait ${Math.ceil(lockTimeRemaining / 1000)} seconds before trying again.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.fullName, 'student');
      } else {
        const result = await signIn(formData.email, formData.password);
        if (result.error) {
          recordAttempt(); // Record failed attempt
          throw result.error;
        }
        // Reset attempts on successful sign-in
        resetAttempts();
      }
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                Welcome to the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Future
                </span>{' '}
                of Learning
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Experience education transformed by AI, real-time collaboration, and cutting-edge technology.
              </p>
            </motion.div>

            {/* Feature Carousel */}
            <div className="relative h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Card className={`bg-gradient-to-br ${features[currentFeature].color} border-white/20 backdrop-blur-sm`}>
                    <CardContent className="p-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6"
                      >
                        {features[currentFeature].icon}
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-white/80 text-lg">
                        {features[currentFeature].description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentFeature
                        ? 'bg-white w-8'
                        : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-8"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white text-sm">10K+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white text-sm">Bank-Level Security</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Authentication Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5">
                    <TabsTrigger
                      value="signin"
                      onClick={() => setIsSignUp(false)}
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      onClick={() => setIsSignUp(true)}
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sign Up Fields */}
                    {isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-white/80">
                            Full Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                            <Input
                              id="fullName"
                              type="text"
                              placeholder="Enter your full name"
                              value={formData.fullName}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                              autoComplete="name"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/80">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/80">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                          autoComplete={isSignUp ? 'new-password' : 'current-password'}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms Checkbox for Sign Up - REMOVED - No confirmation required */}
                    {false && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                            required
                          />
                          <Label htmlFor="terms" className="text-white/80 text-sm">
                            I agree to the Terms of Service and Privacy Policy
                          </Label>
                        </div>
                      </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <span className="flex items-center justify-center">
                          {isSignUp ? 'Create Account' : 'Sign In'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      )}
                    </Button>

                    {/* Forgot Password Link */}
                    {!isSignUp && (
                      <div className="text-center">
                        <Link
                          to="/reset-password"
                          className="text-white/60 hover:text-white/80 text-sm transition-colors"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    )}
                  </form>

                  {/* Social Login Options */}
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="text-center text-white/60 text-sm mb-4">
                      Or continue with
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        GitHub
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Mobile Feature Indicators */}
            <div className="lg:hidden mt-8 space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg bg-gradient-to-r ${feature.color} border border-white/20`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{feature.title}</h4>
                      <p className="text-white/80 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
