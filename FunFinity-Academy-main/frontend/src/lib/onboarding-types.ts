/**
 * Onboarding Engine Schema & Types
 * Defines the structure for dynamic, config-driven onboarding flows.
 */

export type InputType = 
  | 'text' 
  | 'select' 
  | 'multi-select' 
  | 'toggle' 
  | 'radio' 
  | 'checkbox' 
  | 'file'
  | 'date';

export interface ValidationRule {
  type: 'required' | 'regex' | 'min' | 'max';
  value?: any;
  message: string;
}

export interface OnboardingOption {
  label: string;
  value: string;
  icon?: string; // AI prompt or keyword
  description?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'input' | 'choice' | 'completion';
  inputs?: {
    id: string;
    type: InputType;
    label: string;
    placeholder?: string;
    options?: OnboardingOption[];
    validations?: ValidationRule[];
    defaultValue?: any;
  }[];
  media?: {
    type: 'ai-image' | 'ai-emoji' | 'video';
    context: any; // Passed to VIS
  };
  logic?: {
    showIf?: {
      fieldId: string;
      operator: 'equals' | 'contains' | 'exists';
      value: any;
    };
    nextStepId?: string; // Override default sequence
  };
  metadata?: Record<string, any>;
}

export interface OnboardingConfig {
  id: string;
  version: string;
  steps: OnboardingStep[];
  theme?: {
    primaryColor?: string;
    style?: '3d-fluent' | 'minimal-glass' | 'neo-brutalism';
  };
}

export interface OnboardingState {
  currentStepId: string;
  completedSteps: string[];
  data: Record<string, any>;
  isFinished: boolean;
}

/**
 * Example Mock Configuration (JSON format)
 * In production, this would be fetched from the API.
 */
export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  id: 'student-onboarding-v1',
  version: '1.0.0',
  theme: { style: '3d-fluent' },
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Funfinity Academy',
      description: 'The future of learning is personalized. Let\'s build your Learning DNA.',
      type: 'info',
      media: { type: 'ai-image', context: { action: 'welcome', topic: 'education', mood: 'playful' } }
    },
    {
      id: 'role-selection',
      title: 'What brings you here?',
      description: 'We tailor the experience based on your goals.',
      type: 'choice',
      inputs: [{
        id: 'user_intent',
        type: 'radio',
        label: 'I want to...',
        options: [
          { label: 'Master New Skills', value: 'skills', description: 'Focus on practical knowledge' },
          { label: 'Prepare for Career', value: 'career', description: 'Professional roadmap' },
          { label: 'Just Explore', value: 'explore', description: 'Curiosity-driven learning' }
        ]
      }]
    },
    {
      id: 'career-focus',
      title: 'Career Aspirations',
      description: 'Which industry excites you most?',
      type: 'choice',
      logic: {
        showIf: { fieldId: 'user_intent', operator: 'equals', value: 'career' }
      },
      inputs: [{
        id: 'industry',
        type: 'select',
        label: 'Select Industry',
        options: [
          { label: 'Artificial Intelligence', value: 'ai' },
          { label: 'Space Technology', value: 'space' },
          { label: 'Biotechnology', value: 'bio' },
          { label: 'Creative Arts', value: 'arts' }
        ]
      }]
    },
    {
      id: 'dna-setup',
      title: 'Learning Preferences',
      description: 'How do you process information best?',
      type: 'input',
      inputs: [
        {
          id: 'learning_style',
          type: 'multi-select',
          label: 'I learn best with...',
          options: [
            { label: 'Visual Aids', value: 'visual' },
            { label: 'Interactive Quizzes', value: 'interactive' },
            { label: 'Audio Content', value: 'audio' },
            { label: 'Reading Material', value: 'reading' }
          ]
        },
        {
          id: 'daily_goal',
          type: 'toggle',
          label: 'Daily Reminders',
          defaultValue: true
        }
      ]
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Your personalized learning path is ready.',
      type: 'completion',
      media: { type: 'ai-emoji', context: { state: 'celebration', action: 'onboarding_complete' } }
    }
  ]
};
