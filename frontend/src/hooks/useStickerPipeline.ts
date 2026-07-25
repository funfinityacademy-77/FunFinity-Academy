import { useState, useCallback } from 'react';

interface StickerGenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

interface GeneratedSticker {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;
  createdAt: Date;
  metadata?: {
    width: number;
    height: number;
    format: string;
  };
}

interface UseStickerPipelineReturn {
  state: StickerGenerationState;
  generateSticker: (prompt: string, style: string, creativity: number) => Promise<GeneratedSticker>;
  injectStickerToCanvas: (sticker: GeneratedSticker, canvasCenter: { x: number; y: number }) => void;
  resetState: () => void;
}

export function useStickerPipeline(): UseStickerPipelineReturn {
  const [state, setState] = useState<StickerGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
  });

  const generateSticker = useCallback(async (
    prompt: string,
    style: string,
    creativity: number
  ): Promise<GeneratedSticker> => {
    setState({ isGenerating: true, progress: 0, error: null });

    try {
      // Simulate AI generation with progress updates
      const steps = [
        { progress: 10, message: 'Analyzing prompt...' },
        { progress: 30, message: 'Generating concept...' },
        { progress: 50, message: 'Creating artwork...' },
        { progress: 70, message: 'Applying style...' },
        { progress: 90, message: 'Finalizing...' },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setState(prev => ({ ...prev, progress: step.progress }));
      }

      // Generate SVG sticker based on style
      const colors = {
        sticker: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'],
        badge: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        icon: ['#2C3E50', '#E74C3C', '#3498DB', '#1ABC9C', '#9B59B6'],
        emoji: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
        decoration: ['#FF6B6B', '#C44569', '#F8B500', '#00B894', '#6C5CE7'],
      };

      const styleColors = colors[style as keyof typeof colors] || colors.sticker;
      const color1 = styleColors[Math.floor(Math.random() * styleColors.length)];
      const color2 = styleColors[Math.floor(Math.random() * styleColors.length)];

      const svgTemplate = `
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
          </defs>
          <rect width="128" height="128" rx="${style === 'badge' ? '64' : '20'}" fill="url(#grad)" filter="url(#shadow)" />
          <text x="64" y="64" font-size="48" text-anchor="middle" fill="white" font-family="Arial" dominant-baseline="middle">
            ${style === 'sticker' ? '✨' : style === 'badge' ? '🏆' : style === 'icon' ? '⚡' : style === 'emoji' ? '😊' : '🎨'}
          </text>
        </svg>
      `;

      const sticker: GeneratedSticker = {
        id: `sticker-${Date.now()}`,
        prompt,
        style,
        imageUrl: `data:image/svg+xml,${encodeURIComponent(svgTemplate)}`,
        createdAt: new Date(),
        metadata: {
          width: 128,
          height: 128,
          format: 'svg+xml',
        },
      };

      setState({ isGenerating: false, progress: 100, error: null });
      return sticker;
    } catch (error) {
      setState({
        isGenerating: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Failed to generate sticker',
      });
      throw error;
    }
  }, []);

  const injectStickerToCanvas = useCallback((
    sticker: GeneratedSticker,
    canvasCenter: { x: number; y: number }
  ) => {
    // This will be called by the parent component to add the sticker to the canvas
    // The actual injection logic will be handled in the DigitalNotebook component
    const event = new CustomEvent('sticker-injected', {
      detail: {
        sticker,
        position: canvasCenter,
      },
    });
    window.dispatchEvent(event);
  }, []);

  const resetState = useCallback(() => {
    setState({ isGenerating: false, progress: 0, error: null });
  }, []);

  return {
    state,
    generateSticker,
    injectStickerToCanvas,
    resetState,
  };
}
