import React from 'react';
import { AIAsset } from './AIAsset';
import { VisualType } from '@/lib/visual-intelligence';
import { cn } from '@/lib/utils';

interface AIIconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  topic?: string;
  mood?: 'playful' | 'professional' | 'energetic' | 'calm';
}

/**
 * AIIcon - A drop-in replacement for Lucide icons that uses AI-generated visuals.
 * This component maps icon names to AI visual contexts.
 */
export const AIIcon: React.FC<AIIconProps> = ({ 
  name, 
  className, 
  size = 'sm', 
  topic, 
  mood = 'playful' 
}) => {
  // Map common Lucide icon names to AI contexts
  const contextMap: Record<string, any> = {
    'LayoutDashboard': { action: 'dashboard', topic: 'analytics', mood: 'professional' },
    'BookOpen': { action: 'learning', topic: 'books', mood: 'calm' },
    'Play': { action: 'video', topic: 'media', mood: 'energetic' },
    'Award': { action: 'education', topic: 'degree', mood: 'playful' },
    'MessageSquare': { action: 'chat', topic: 'communication', mood: 'playful' },
    'Trophy': { action: 'reward', topic: 'achievement', mood: 'celebration' },
    'Target': { action: 'goal', topic: 'strategy', mood: 'professional' },
    'Zap': { action: 'energy', topic: 'lightning', mood: 'energetic' },
    'Brain': { action: 'thinking', topic: 'neuroscience', mood: 'calm' },
    'Users': { action: 'community', topic: 'people', mood: 'playful' },
    'Calendar': { action: 'schedule', topic: 'time', mood: 'calm' },
    'BarChart3': { action: 'analytics', topic: 'data', mood: 'professional' },
    'Settings': { action: 'config', topic: 'gears', mood: 'professional' },
    'User': { action: 'profile', topic: 'avatar', mood: 'playful' },
    'Compass': { action: 'explore', topic: 'navigation', mood: 'playful' },
    'Briefcase': { action: 'career', topic: 'work', mood: 'professional' },
    'Clock': { action: 'time', topic: 'watch', mood: 'calm' },
    'Map': { action: 'roadmap', topic: 'journey', mood: 'playful' },
    'Bot': { action: 'ai', topic: 'robot', mood: 'energetic' },
  };

  const context = contextMap[name] || { action: 'general', topic: name, mood };

  return (
    <AIAsset 
      context={context} 
      type="emoji" 
      size={size} 
      className={cn("inline-block", className)} 
    />
  );
};
