/**
 * Low Bandwidth Mode Toggle Component
 * Allows users to disable heavy assets for better performance on slow connections
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

export function LowBandwidthToggle() {
  const { lowBandwidthMode, toggleLowBandwidthMode } = useAppStore();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'medium' | 'slow' | null>(null);
  const { toast } = useToast();

  // Test connection speed
  const testConnectionSpeed = async () => {
    setIsTestingConnection(true);
    setConnectionSpeed(null);

    try {
      const startTime = performance.now();
      
      // Fetch a small resource to test speed
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-store'
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Categorize connection speed
      if (duration < 200) {
        setConnectionSpeed('fast');
      } else if (duration < 500) {
        setConnectionSpeed('medium');
      } else {
        setConnectionSpeed('slow');
      }

      toast({
        title: "Connection test complete",
        description: `Your connection speed is ${connectionSpeed === 'fast' ? 'fast' : connectionSpeed === 'medium' ? 'medium' : 'slow'}.`,
      });
    } catch (error) {
      setConnectionSpeed('slow');
      toast({
        title: "Connection test failed",
        description: "Unable to test connection speed. Assuming slow connection.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Auto-detect connection speed on mount
  useEffect(() => {
    const nav = navigator as any;
    if (nav.connection) {
      const connection = nav.connection;
      if (connection.effectiveType) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setConnectionSpeed('fast');
        } else if (effectiveType === '3g') {
          setConnectionSpeed('medium');
        } else {
          setConnectionSpeed('slow');
        }
      }
    }
  }, []);

  // Auto-enable low bandwidth mode if connection is slow
  useEffect(() => {
    if (connectionSpeed === 'slow' && !lowBandwidthMode) {
      toast({
        title: "Slow connection detected",
        description: "Low bandwidth mode has been enabled for better performance.",
      });
      toggleLowBandwidthMode();
    }
  }, [connectionSpeed, lowBandwidthMode, toggleLowBandwidthMode, toast]);

  const handleToggle = () => {
    toggleLowBandwidthMode();
    toast({
      title: lowBandwidthMode ? "Low bandwidth mode disabled" : "Low bandwidth mode enabled",
      description: lowBandwidthMode 
        ? "All features and assets are now enabled."
        : "Heavy assets are disabled for better performance.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
        <div className="flex items-center gap-3">
          {isTestingConnection ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : connectionSpeed === 'fast' ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : connectionSpeed === 'medium' ? (
            <Wifi className="w-5 h-5 text-yellow-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className="font-medium text-foreground text-sm">Connection Status</p>
            <p className="text-xs text-muted-foreground">
              {isTestingConnection ? 'Testing...' : connectionSpeed ? `${connectionSpeed.charAt(0).toUpperCase() + connectionSpeed.slice(1)} connection` : 'Unknown'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={testConnectionSpeed}
          disabled={isTestingConnection}
        >
          Test Speed
        </Button>
      </div>

      {/* Low Bandwidth Mode Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            lowBandwidthMode ? 'bg-primary/20' : 'bg-secondary/50'
          }`}>
            {lowBandwidthMode ? (
              <WifiOff className="w-5 h-5 text-primary" />
            ) : (
              <Wifi className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Low Bandwidth Mode</p>
            <p className="text-xs text-muted-foreground">
              {lowBandwidthMode 
                ? 'Heavy assets disabled for better performance' 
                : 'All features and assets enabled'}
            </p>
          </div>
        </div>
        <Switch
          checked={lowBandwidthMode}
          onCheckedChange={handleToggle}
        />
      </div>

      {/* What's Disabled */}
      {lowBandwidthMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <p className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Currently Disabled
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• High-resolution images and videos</li>
            <li>• Animated backgrounds and effects</li>
            <li>• Auto-loading media content</li>
            <li>• Real-time collaboration features</li>
            <li>• Background sync operations</li>
          </ul>
        </motion.div>
      )}

      {/* Recommendation */}
      {connectionSpeed === 'slow' && !lowBandwidthMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
        >
          <p className="font-medium text-foreground text-sm mb-1 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-yellow-500" />
            Recommendation
          </p>
          <p className="text-xs text-muted-foreground">
            Enable low bandwidth mode for better performance on your current connection.
          </p>
        </motion.div>
      )}
    </div>
  );
}
