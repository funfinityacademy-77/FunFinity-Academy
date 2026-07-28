import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Clock, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunfinityIcon } from '@/components/brand/FunfinityLogo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const HOLD_DURATION = 10; // 10 seconds for immediate access

export default function SecurityHold() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(HOLD_DURATION);
  const [isReleased, setIsReleased] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Play audio ding when timer hits zero
  useEffect(() => {
    if (timeLeft === 0 && !isReleased) {
      setIsReleased(true);
      // Play a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [timeLeft, isReleased]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccessRelease = () => {
    if (isReleased) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-glow-cyan opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-glow-magenta opacity-15" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <FunfinityIcon size="xl" className="text-primary" />
        </motion.div>

        {/* Lock Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6"
        >
          <Lock className="w-12 h-12 text-primary" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card rounded-3xl border border-border/50 p-8 md:p-12"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Account Setup Complete
          </h1>

          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Thank you, <span className="font-semibold text-foreground">{user?.display_name || user?.email}</span>. 
            We have successfully accepted your registration request with FunFinity Academy!
          </p>

          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            We're preparing your personalized learning experience. This will only take a moment.
          </p>

          {/* Countdown Timer */}
          <div className="bg-secondary/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {isReleased ? 'Access Released' : 'Time Remaining'}
              </span>
            </div>

            <motion.div
              key={timeLeft}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className={`font-mono text-4xl md:text-5xl font-bold ${
                isReleased ? 'text-green-500' : 'text-foreground'
              }`}
            >
              {formatTime(timeLeft)}
            </motion.div>
          </div>

          {/* Release Button */}
          {isReleased ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={handleAccessRelease}
                size="lg"
                className="w-full group"
                variant="hero"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Access Your Dashboard
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Your dashboard will unlock automatically when the timer completes.</p>
              <p className="mt-2">You'll hear a notification sound when access is granted.</p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-xs text-muted-foreground mt-6"
        >
          Your dashboard will be ready in just a few seconds.
        </motion.p>
      </div>
    </div>
  );
}
