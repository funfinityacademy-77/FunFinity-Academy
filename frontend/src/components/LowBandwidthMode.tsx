/**
 * Low-Bandwidth Mode Toggle Component
 * Allows students on slow global networks to disable heavy asset loading
 * while preserving structured study note interfaces
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface LowBandwidthConfig {
  enabled: boolean;
  disableImages: boolean;
  disableVideos: boolean;
  disableAnimations: boolean;
  disableAutoPlay: boolean;
  reduceQuality: boolean;
}

const defaultConfig: LowBandwidthConfig = {
  enabled: false,
  disableImages: false,
  disableVideos: false,
  disableAnimations: false,
  disableAutoPlay: false,
  reduceQuality: false,
};

export function LowBandwidthMode() {
  const [config, setConfig] = useState<LowBandwidthConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [bandwidthStatus, setBandwidthStatus] = useState<'good' | 'moderate' | 'poor'>('good');

  // Detect network status
  useEffect(() => {
    const checkBandwidth = () => {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
            setBandwidthStatus('poor');
          } else if (conn.effectiveType === '3g') {
            setBandwidthStatus('moderate');
          } else {
            setBandwidthStatus('good');
          }
        }
      }
    };

    checkBandwidth();
    
    // Listen for connection changes
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        conn.addEventListener('change', checkBandwidth);
        return () => conn.removeEventListener('change', checkBandwidth);
      }
    }
  }, []);

  // Auto-enable low bandwidth mode on poor connection
  useEffect(() => {
    if (bandwidthStatus === 'poor' && !config.enabled) {
      setConfig({
        ...defaultConfig,
        enabled: true,
        disableImages: true,
        disableVideos: true,
        disableAnimations: true,
        reduceQuality: true,
      });
    }
  }, [bandwidthStatus]);

  // Apply settings to document
  useEffect(() => {
    if (config.enabled) {
      document.body.classList.add('low-bandwidth-mode');
      
      // Disable animations
      if (config.disableAnimations) {
        document.body.classList.add('no-animations');
      }
      
      // Set data attribute for CSS
      document.body.dataset.lowBandwidth = 'true';
    } else {
      document.body.classList.remove('low-bandwidth-mode', 'no-animations');
      delete document.body.dataset.lowBandwidth;
    }
  }, [config]);

  const handleToggle = (key: keyof LowBandwidthConfig, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleEnableAll = () => {
    setConfig({
      enabled: true,
      disableImages: true,
      disableVideos: true,
      disableAnimations: true,
      disableAutoPlay: true,
      reduceQuality: true,
    });
  };

  const handleDisableAll = () => {
    setConfig(defaultConfig);
  };

  const bandwidthInfo = {
    good: {
      icon: Wifi,
      color: 'text-green-500',
      label: 'Good Connection',
      description: 'All features available',
    },
    moderate: {
      icon: Wifi,
      color: 'text-yellow-500',
      label: 'Moderate Connection',
      description: 'Some features may be slow',
    },
    poor: {
      icon: WifiOff,
      color: 'text-red-500',
      label: 'Poor Connection',
      description: 'Low bandwidth mode recommended',
    },
  };

  const currentBandwidth = bandwidthInfo[bandwidthStatus];

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        variant={config.enabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {config.enabled ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
        <span className="hidden sm:inline">Low Bandwidth</span>
        {config.enabled && <Badge variant="secondary" className="ml-1">ON</Badge>}
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50"
        >
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Low Bandwidth Mode
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bandwidth Status */}
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <currentBandwidth.icon className={`w-5 h-5 ${currentBandwidth.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{currentBandwidth.label}</p>
                  <p className="text-xs text-muted-foreground">{currentBandwidth.description}</p>
                </div>
              </div>

              {/* Main Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enabled">Enable Low Bandwidth Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce data usage for slower connections
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleToggle('enabled', checked)}
                />
              </div>

              {/* Detailed Settings */}
              {config.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-3 border-t"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="disableImages">Disable Images</Label>
                      <p className="text-xs text-muted-foreground">
                        Load placeholders instead of images
                      </p>
                    </div>
                    <Switch
                      id="disableImages"
                      checked={config.disableImages}
                      onCheckedChange={(checked) => handleToggle('disableImages', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="disableVideos">Disable Videos</Label>
                      <p className="text-xs text-muted-foreground">
                        Block video content
                      </p>
                    </div>
                    <Switch
                      id="disableVideos"
                      checked={config.disableVideos}
                      onCheckedChange={(checked) => handleToggle('disableVideos', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="disableAnimations">Disable Animations</Label>
                      <p className="text-xs text-muted-foreground">
                        Remove motion effects
                      </p>
                    </div>
                    <Switch
                      id="disableAnimations"
                      checked={config.disableAnimations}
                      onCheckedChange={(checked) => handleToggle('disableAnimations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="disableAutoPlay">Disable Auto-Play</Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent automatic media playback
                      </p>
                    </div>
                    <Switch
                      id="disableAutoPlay"
                      checked={config.disableAutoPlay}
                      onCheckedChange={(checked) => handleToggle('disableAutoPlay', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="reduceQuality">Reduce Quality</Label>
                      <p className="text-xs text-muted-foreground">
                        Lower image and video quality
                      </p>
                    </div>
                    <Switch
                      id="reduceQuality"
                      checked={config.reduceQuality}
                      onCheckedChange={(checked) => handleToggle('reduceQuality', checked)}
                    />
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableAll}
                  className="flex-1"
                  disabled={!config.enabled}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Enable All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableAll}
                  className="flex-1"
                  disabled={!config.enabled}
                >
                  Reset
                </Button>
              </div>

              {/* Info */}
              <div className="text-xs text-muted-foreground text-center pt-2">
                <p>Settings are saved locally and persist across sessions</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Hook to use low bandwidth mode settings in components
 */
export function useLowBandwidthMode() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkMode = () => {
      setIsEnabled(document.body.classList.contains('low-bandwidth-mode'));
    };

    checkMode();
    
    const observer = new MutationObserver(checkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return isEnabled;
}
