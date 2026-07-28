import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Sun, Moon, Settings, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AdminBackgrounds() {
  const { toast } = useToast();
  const [defaultTheme, setDefaultTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);

  const handleSaveDefaultTheme = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Default Theme Updated",
        description: `The default theme has been set to ${defaultTheme}.`,
      });
    }, 500);
  };

  const themes = [
    {
      id: "light",
      name: "Light Theme",
      icon: Sun,
      description: "Clean and bright interface with white backgrounds",
      preview: "bg-white border-gray-200",
      textColor: "text-gray-900",
    },
    {
      id: "dark",
      name: "Dark Theme",
      icon: Moon,
      description: "Easy on the eyes with dark backgrounds",
      preview: "bg-gray-900 border-gray-700",
      textColor: "text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            Theme Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage platform themes (Light and Dark only)
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Theme Options</p>
              <p className="text-xs text-muted-foreground mt-1">
                Currently, FunFinity Academy only supports Light and Dark themes. Custom backgrounds are not available at this time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Theme Setting */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Default Platform Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Set the default theme for new users and the platform
              </p>
              <Select value={defaultTheme} onValueChange={(value: any) => setDefaultTheme(value)}>
                <SelectTrigger className="w-full bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="hero" 
              onClick={handleSaveDefaultTheme}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Default"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Themes */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Themes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const ThemeIcon = theme.icon;
            const isSelected = defaultTheme === theme.id;
            
            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: themes.indexOf(theme) * 0.1 }}
              >
                <Card className={cn(
                  "glass-card border-border/30 transition-all cursor-pointer hover:border-primary/50",
                  isSelected && "border-primary ring-2 ring-primary/20"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          theme.id === "light" ? "bg-yellow-500/10 text-yellow-500" : "bg-purple/10 text-purple"
                        )}>
                          <ThemeIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{theme.name}</h3>
                          <p className="text-xs text-muted-foreground">{theme.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <Badge className="bg-primary text-primary-foreground">
                          <Check className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    {/* Theme Preview */}
                    <div className={cn(
                      "rounded-lg border-2 p-4 mb-4",
                      theme.preview
                    )}>
                      <div className="space-y-2">
                        <div className={cn("h-2 w-3/4 rounded", theme.id === "light" ? "bg-gray-200" : "bg-gray-700")} />
                        <div className={cn("h-2 w-1/2 rounded", theme.id === "light" ? "bg-gray-200" : "bg-gray-700")} />
                        <div className={cn("h-2 w-5/6 rounded", theme.id === "light" ? "bg-gray-200" : "bg-gray-700")} />
                      </div>
                    </div>

                    <Button
                      variant={isSelected ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setDefaultTheme(theme.id as "light" | "dark")}
                    >
                      {isSelected ? "Currently Default" : "Set as Default"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Theme Statistics */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Theme Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Light Theme Users</span>
                <span className="text-sm font-semibold text-foreground">65%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dark Theme Users</span>
                <span className="text-sm font-semibold text-foreground">35%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-purple rounded-full" style={{ width: "35%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
