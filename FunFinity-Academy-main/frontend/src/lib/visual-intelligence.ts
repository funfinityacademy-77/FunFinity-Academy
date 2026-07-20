/**
 * Visual Intelligence Service (VIS)
 *
 * A modular, API-driven system for generating and serving AI visuals.
 * Uses stable, publicly-accessible image CDNs so images are always visible
 * on any network and server, without any API key.
 */

export type VisualType = 'emoji' | 'reaction' | 'image' | 'icon' | 'illustration' | 'banner';
export type VisualStyle = '3d-fluent' | 'minimal-glass' | 'neo-brutalism' | 'soft-gradient';

export interface VisualContext {
  action?: string;
  state?: 'success' | 'warning' | 'error' | 'info' | 'loading' | 'celebration' | 'progress';
  userPreference?: string;
  topic?: string;
  mood?: 'playful' | 'professional' | 'energetic' | 'calm';
  style?: VisualStyle;
}

export interface VisualAsset {
  url: string;
  alt: string;
  type: VisualType;
  metadata?: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Curated stable image library — all publicly accessible, no API key required
// ─────────────────────────────────────────────────────────────────────────────

// Animated Fluent Emoji (raw GitHub CDN — always on)
const FLUENT = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';

// Unsplash direct image IDs (stable, require no API key)
const U = (id: string, w = 800, h = 500) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const CURATED: Record<string, string> = {
  // ── Emojis / reactions (using emoji symbols instead of images) ─────────────
  'emoji:celebration':      '',
  'emoji:success':          '',
  'emoji:progress':         '',
  'emoji:info':             '',
  'emoji:welcome':          '',
  'emoji:profile_complete': '',
  'emoji:error':            '',
  'reaction:high-five':     '',

  // ── Illustrations / images (replaced with symbols) ────────────────────────
  // Learning DNA questionnaire steps
  'illustration:brain':         '',
  'illustration:focus':         '',
  'illustration:eye':           '',
  'illustration:genetics':      '',
  'illustration:onboarding_start': '',
  'illustration:accessibility_setup': '',

  // Subjects / course banners
  'banner:mathematics':     '',
  'banner:science':         '',
  'banner:coding':          '',
  'banner:languages':       '',
  'banner:arts':            '',
  'banner:history':         '',
  'banner:default':         '',

  // Dashboard
  'image:xp_celebration':   '',
  'image:welcome':          '',

  // DNA step visuals  
  'illustration:learning_style':    '',
  'illustration:learning_pace':     '',
  'illustration:subjects':          '',
  'illustration:goals':             '',
  'illustration:collaboration':     '',
  'illustration:motivation':        '',
  'illustration:completion':        '',

  // General fallbacks
  'image:default':          '',
  'banner:course_banner':   '',
};

class VisualIntelligenceService {
  private static instance: VisualIntelligenceService;
  private cache: Map<string, VisualAsset> = new Map();

  private constructor() {}

  public static getInstance(): VisualIntelligenceService {
    if (!VisualIntelligenceService.instance) {
      VisualIntelligenceService.instance = new VisualIntelligenceService();
    }
    return VisualIntelligenceService.instance;
  }

  private generateKey(context: VisualContext, type: VisualType): string {
    return `${type}:${JSON.stringify(context)}`;
  }

  public async getVisual(context: VisualContext, type: VisualType): Promise<VisualAsset> {
    const key = this.generateKey(context, type);
    if (this.cache.has(key)) return this.cache.get(key)!;

    const asset = this.resolve(context, type);
    this.cache.set(key, asset);
    return asset;
  }

  private resolve(context: VisualContext, type: VisualType): VisualAsset {
    // Try exact context-state match
    const stateKey = `${type}:${context.state}`;
    if (CURATED[stateKey]) {
      return { url: CURATED[stateKey], alt: context.state ?? type, type };
    }

    // Try topic match
    const topicKey = `${type}:${context.topic}`;
    if (CURATED[topicKey]) {
      return { url: CURATED[topicKey], alt: context.topic ?? type, type };
    }

    // Try action match
    const actionKey = `${type}:${context.action}`;
    if (CURATED[actionKey]) {
      return { url: CURATED[actionKey], alt: context.action ?? type, type };
    }

    // Try banner for course topics
    if (type === 'banner' && context.topic) {
      const bannerKey = `banner:${context.topic.toLowerCase()}`;
      if (CURATED[bannerKey]) {
        return { url: CURATED[bannerKey], alt: context.topic, type };
      }
    }

    // Fallback to type default
    const defaultKey = `${type}:default`;
    if (CURATED[defaultKey]) {
      return { url: CURATED[defaultKey], alt: 'Visual asset', type };
    }

    // Ultimate fallback — always a real image
    return {
      url: U('1509062522246-430c0dc95a6c'),
      alt: 'Educational visual',
      type,
    };
  }
}

export const VIS = VisualIntelligenceService.getInstance();
