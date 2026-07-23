import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAsset } from './AIAsset';
import { VisualContext } from '@/lib/visual-intelligence';

interface Reaction {
  id: string;
  context: VisualContext;
  x: number;
  y: number;
}

/**
 * Intelligent Reaction System
 * Triggers AI-generated reactions at specific locations or globally.
 */
export const ReactionSystem: React.FC = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const triggerReaction = useCallback((context: VisualContext, x?: number, y?: number) => {
    const id = Math.random().toString(36).substring(7);
    const newReaction = {
      id,
      context,
      x: x ?? Math.random() * 80 + 10, // Default to random horizontal spread
      y: y ?? Math.random() * 40 + 20  // Default to upper half of screen
    };

    setReactions(prev => [...prev, newReaction]);

    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  }, []);

  // Expose trigger to window for easy global access (or use a context provider)
  useEffect(() => {
    (window as any).triggerAIReaction = triggerReaction;
    return () => { delete (window as any).triggerAIReaction; };
  }, [triggerReaction]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 100, scale: 0, x: `${reaction.x}%` }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: [100, -200], 
              scale: [0.5, 1.5, 1],
              rotate: [0, Math.random() * 20 - 10]
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ 
              position: 'absolute', 
              left: 0, 
              bottom: '10%'
            }}
          >
            <AIAsset 
              context={reaction.context} 
              type="emoji" 
              size="lg" 
              animate={false} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const useAIReactions = () => {
  const trigger = (window as any).triggerAIReaction as (context: VisualContext, x?: number, y?: number) => void;
  return { trigger };
};
