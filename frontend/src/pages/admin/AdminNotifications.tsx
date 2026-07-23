import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Check, X, AlertTriangle, Info, CheckCircle, Calendar, Settings, Send, Clock, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  target: "all" | "students" | "admins" | "teachers";
  active: boolean;
  created_at: string;
  expires_at?: string;
}

const typeIcons: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: X,
};

const typeColors: Record<string, string> = {
  info: "bg-cyan/10 text-cyan border-cyan/20",
  success: "bg-emerald/10 text-emerald border-emerald/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate/10 text-slate-foreground border-slate/20",
  medium: "bg-blue/10 text-blue border-blue/20",
  high: "bg-orange/10 text-orange border-orange/20",
  urgent: "bg-red/10 text-red border-red/20",
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as const,
    priority: "medium" as const,
    target: "all" as const,
    expires_at: "",
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiClient.get<Notification[]>("/api/notifications");
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Unable to load notifications. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and message for the notification.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newNotification = {
        ...formData,
        active: true,
        created_at: new Date().toISOString(),
      };
      
      await apiClient.post("/api/notifications", newNotification);
      
      toast({
        title: "Notification Created",
        description: "Your notification has been successfully created and is now active.",
      });
      
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        target: "all",
        expires_at: "",
      });
      
      loadNotifications();
    } catch (error) {
      toast({
        title: "Failed to Create",
        description: "There was an error creating your notification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (notification: Notification) => {
    try {
      await apiClient.put(`/api/notifications/${notification.id}`, {
        active: !notification.active
      });
      
      toast({
        title: notification.active ? "Notification Deactivated" : "Notification Activated",
        description: notification.active 
          ? "The notification has been deactivated and will no longer be displayed."
          : "The notification has been activated and is now visible to users.",
      });
      
      loadNotifications();
    } catch (error) {
      toast({
        title: "Failed to Update",
        description: "There was an error updating the notification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      
      toast({
        title: "Notification Deleted",
        description: "The notification has been permanently deleted.",
      });
      
      loadNotifications();
    } catch (error) {
      toast({
        title: "Failed to Delete",
        description: "There was an error deleting the notification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || (filter === "active" && notification.active) || (filter === "inactive" && !notification.active);
    const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase()) || 
                         notification.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-700/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notification Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and broadcast notifications to platform users
          </p>
        </div>
        <Button 
          variant="hero" 
          size="sm" 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                <p className="text-xs text-muted-foreground">Total Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.active).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.priority === "high" || n.priority === "urgent").length}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notifications.filter(n => n.expires_at && new Date(n.expires_at) > new Date()).length}</p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/30 flex-1">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[140px] bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="glass-card border-border/30">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications Found</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Create your first notification to start broadcasting messages to users."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification, index) => {
            const TypeIcon = typeIcons[notification.type];
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "glass-card border-border/30 transition-all",
                  !notification.active && "opacity-60"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          typeColors[notification.type]
                        )}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{notification.title}</h3>
                            <Badge className={cn("text-[10px]", priorityColors[notification.priority])}>
                              {notification.priority}
                            </Badge>
                            <Badge variant={notification.active ? "default" : "secondary"} className="text-[10px]">
                              {notification.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                            {notification.expires_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires: {new Date(notification.expires_at).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Settings className="w-3 h-3" />
                              Target: {notification.target}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(notification)}
                          className={cn(
                            notification.active ? "text-orange-500 hover:text-orange-600" : "text-emerald-500 hover:text-emerald-600"
                          )}
                        >
                          {notification.active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Notification Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass-card border-border/30 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Create Notification</h2>
                <p className="text-sm text-muted-foreground">Broadcast a message to platform users</p>
              </div>

              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., System Maintenance Scheduled"
                    className="bg-secondary/50 border-border/30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your notification message..."
                    rows={4}
                    className="bg-secondary/50 border-border/30 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger id="type" className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger id="priority" className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Audience</Label>
                    <Select value={formData.target} onValueChange={(value: any) => setFormData(prev => ({ ...prev, target: value }))}>
                      <SelectTrigger id="target" className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="teachers">Teachers</SelectItem>
                        <SelectItem value="admins">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                      className="bg-secondary/50 border-border/30"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create Notification
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
