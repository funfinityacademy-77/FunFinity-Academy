import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CountUpProps {
  end: number | string;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function CountUp({ 
  end, 
  duration = 2, 
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number>();
  const animationRef = useRef<number>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = performance.now();
      
      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;
        
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const targetValue = typeof end === 'string' ? parseFloat(end.replace(/[^0-9.]/g, '')) : end;
        const currentValue = targetValue * easeOutQuart;
        
        setCount(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration, delay, decimals]);

  const formatNumber = (num: number) => {
    if (typeof end === 'string' && end.includes('+')) {
      return `${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}+`;
    }
    if (typeof end === 'string' && end.includes('/')) {
      const parts = end.split('/');
      return `${num.toFixed(decimals)}${parts[1]}`;
    }
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <motion.span
      className={`font-display font-bold ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {prefix}{formatNumber(count)}{suffix}
    </motion.span>
  );
}
