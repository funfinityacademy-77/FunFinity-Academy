import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, UserPlus, Shield, User,
  MoreVertical, CheckCircle, XCircle, X, Mail, User as UserIcon,
  Ban, Trash2, Eye, Lock, FileText, Download, Clock, Activity,
  Brain, Sparkles, Lightbulb, Target, BookOpen, Zap, Award
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { AdminUsersSkeleton } from "@/components/skeletons/AdminUsersSkeleton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, createUser, restrictUser, banUser, deleteUser, generateLearningPlan } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const roleIcon: Record<string, React.ReactNode> = {
  Admin:           <Shield className="w-3 h-3" />,
  "Admin-Instructor": <Award className="w-3 h-3" />,
  Student:         <User className="w-3 h-3" />,
  Teacher:         <BookOpen className="w-3 h-3" />,
  Parent:          <UserIcon className="w-3 h-3" />,
};
const roleColor: Record<string, string> = {
  Admin:           "bg-destructive/10 text-destructive border-destructive/20",
  "Admin-Instructor": "bg-primary/10 text-primary border-primary/20",
  Student:         "bg-cyan/10 text-cyan border-cyan/20",
  Teacher:         "bg-emerald/10 text-emerald border-emerald/20",
  Parent:          "bg-magenta/10 text-magenta border-magenta/20",
};

// Permissions matrix
const permissionsMatrix = {
  Admin: {
    "User Management": { create: true, read: true, update: true, delete: true },
    "Course Management": { create: true, read: true, update: true, delete: true },
    "Content Management": { create: true, read: true, update: true, delete: true },
    "Analytics & Reports": { create: true, read: true, update: true, delete: true },
    "System Settings": { create: true, read: true, update: true, delete: true },
    "Billing & Payments": { create: true, read: true, update: true, delete: true },
    "Security & Compliance": { create: true, read: true, update: true, delete: true },
  },
  "Admin-Instructor": {
    "User Management": { create: false, read: true, update: true, delete: false },
    "Course Management": { create: true, read: true, update: true, delete: true },
    "Content Management": { create: true, read: true, update: true, delete: true },
    "Analytics & Reports": { create: false, read: true, update: false, delete: false },
    "System Settings": { create: false, read: true, update: false, delete: false },
    "Billing & Payments": { create: false, read: false, update: false, delete: false },
    "Security & Compliance": { create: false, read: true, update: false, delete: false },
  },
  Teacher: {
    "User Management": { create: false, read: true, update: false, delete: false },
    "Course Management": { create: true, read: true, update: true, delete: false },
    "Content Management": { create: true, read: true, update: true, delete: false },
    "Analytics & Reports": { create: false, read: true, update: false, delete: false },
    "System Settings": { create: false, read: false, update: false, delete: false },
    "Billing & Payments": { create: false, read: false, update: false, delete: false },
    "Security & Compliance": { create: false, read: false, update: false, delete: false },
  },
  Student: {
    "User Management": { create: false, read: false, update: false, delete: false },
    "Course Management": { create: false, read: true, update: false, delete: false },
    "Content Management": { create: false, read: true, update: false, delete: false },
    "Analytics & Reports": { create: false, read: true, update: false, delete: false },
    "System Settings": { create: false, read: false, update: false, delete: false },
    "Billing & Payments": { create: false, read: false, update: false, delete: false },
    "Security & Compliance": { create: false, read: false, update: false, delete: false },
  },
  Parent: {
    "User Management": { create: false, read: true, update: false, delete: false },
    "Course Management": { create: false, read: true, update: false, delete: false },
    "Content Management": { create: false, read: true, update: false, delete: false },
    "Analytics & Reports": { create: false, read: true, update: false, delete: false },
    "System Settings": { create: false, read: false, update: false, delete: false },
    "Billing & Payments": { create: false, read: true, update: false, delete: false },
    "Security & Compliance": { create: false, read: false, update: false, delete: false },
  },
};

type ActionMenu = { userId: string; x: number; y: number } | null;
type AddUserModal = { isOpen: boolean } | null;
type ProfileModal = { isOpen: boolean; userId: string; activeTab: 'overview' | 'reports' | 'learning-dna' } | null;
type RestrictModal = { isOpen: boolean; userId: string; type: 'restrict' | 'ban' | 'delete' } | null;
type LearningPlanState = { isGenerating: boolean; plan: any; error: string | null };

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [menu, setMenu] = useState<ActionMenu>(null);
  const [addUserModal, setAddUserModal] = useState<AddUserModal>({ isOpen: false });
  const [profileModal, setProfileModal] = useState<ProfileModal>(null);
  const [restrictModal, setRestrictModal] = useState<RestrictModal>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', display_name: '', role: 'Student' });
  const [restrictReason, setRestrictReason] = useState('');
  const [restrictDuration, setRestrictDuration] = useState(24);
  const [learningPlanState, setLearningPlanState] = useState<LearningPlanState>({ isGenerating: false, plan: null, error: null });
  const [userLearningDNA, setUserLearningDNA] = useState<any>(null);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await fetchUsers();
      return result.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast({ title: "User created successfully", description: "The new user has been added to the platform." });
      setAddUserModal({ isOpen: false });
      setNewUser({ email: '', password: '', display_name: '', role: 'Student' });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create user", description: error.message, variant: "destructive" });
    }
  });

  const restrictUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { reason?: string; duration_hours?: number } }) =>
      restrictUser(userId, data),
    onSuccess: () => {
      toast({ title: "User restricted successfully", description: "The user has been restricted." });
      setRestrictModal(null);
      setRestrictReason('');
      setRestrictDuration(24);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to restrict user", description: error.message, variant: "destructive" });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => banUser(userId, reason),
    onSuccess: () => {
      toast({ title: "User banned successfully", description: "The user has been banned." });
      setRestrictModal(null);
      setRestrictReason('');
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to ban user", description: error.message, variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast({ title: "User deleted successfully", description: "The user has been permanently deleted." });
      setRestrictModal(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    }
  });

  // Fetch user's Learning DNA data when profile modal opens
  const fetchUserLearningDNA = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('learning_dna_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      setUserLearningDNA(data);
      
      // Also check if there's an existing system suggested plan
      const { data: planData } = await supabase
        .from('system_suggested_plans')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (planData) {
        setLearningPlanState({ isGenerating: false, plan: planData, error: null });
      }
    } catch (error) {
      console.error('Failed to fetch Learning DNA:', error);
      setUserLearningDNA(null);
    }
  };

  // Generate learning plan using custom algorithm
  const handleApplyIdea = async () => {
    if (!profileModal?.userId) return;
    
    setLearningPlanState({ isGenerating: true, plan: null, error: null });
    
    try {
      // Call the data service function to generate the plan
      const plan = await generateLearningPlan(profileModal.userId, userLearningDNA);
      
      setLearningPlanState({ isGenerating: false, plan, error: null });
      toast({ 
        title: "Learning Plan Generated", 
        description: "System suggested plan has been created and applied to the user's Learning DNA page." 
      });
    } catch (error: any) {
      setLearningPlanState({ isGenerating: false, plan: null, error: error.message });
      toast({ 
        title: "Failed to Generate Plan", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  const filtered = (users || []).filter((u: any) =>
    (roleFilter === "All" || u.user_roles?.role === roleFilter) &&
    (u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const openMenu = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ userId, x: rect.left, y: rect.bottom + 4 });
  };

  if (isLoading) {
    return <AdminUsersSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" onClick={() => setMenu(null)}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Users & Roles</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all platform users and permissions</p>
          </div>
          <Button variant="hero" size="default" onClick={() => setAddUserModal({ isOpen: true })}>
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search users..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Student", "Teacher", "Parent", "Admin-Instructor", "Admin"].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${roleFilter === r ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)} className="ml-auto">
            <Shield className="w-4 h-4 mr-2" />
            {showPermissionsMatrix ? "Hide" : "View"} Permissions
          </Button>
        </div>

        {/* Permissions Matrix */}
        {showPermissionsMatrix && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="platform-card p-6 mb-4">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Permissions Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Module</th>
                    <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Admin</th>
                    <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Admin-Instructor</th>
                    <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Teacher</th>
                    <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Student</th>
                    <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Parent</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(permissionsMatrix.Admin).map(module => (
                    <tr key={module} className="border-b border-border/10">
                      <td className="py-2 px-3 font-medium text-foreground">{module}</td>
                      {Object.keys(permissionsMatrix).map(role => (
                        <td key={role} className="py-2 px-2">
                          <div className="flex justify-center gap-1">
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                              permissionsMatrix[role as keyof typeof permissionsMatrix][module as keyof typeof permissionsMatrix.Admin].create ? 'bg-emerald-500 text-white' : 'bg-secondary/30 text-muted-foreground'
                            }`}>C</span>
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                              permissionsMatrix[role as keyof typeof permissionsMatrix][module as keyof typeof permissionsMatrix.Admin].read ? 'bg-emerald-500 text-white' : 'bg-secondary/30 text-muted-foreground'
                            }`}>R</span>
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                              permissionsMatrix[role as keyof typeof permissionsMatrix][module as keyof typeof permissionsMatrix.Admin].update ? 'bg-emerald-500 text-white' : 'bg-secondary/30 text-muted-foreground'
                            }`}>U</span>
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                              permissionsMatrix[role as keyof typeof permissionsMatrix][module as keyof typeof permissionsMatrix.Admin].delete ? 'bg-destructive text-white' : 'bg-secondary/30 text-muted-foreground'
                            }`}>D</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">C</span>
                <span>Create</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">R</span>
                <span>Read</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">U</span>
                <span>Update</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-destructive text-white flex items-center justify-center text-[9px] font-bold">D</span>
                <span>Delete</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div className="platform-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Info</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground text-sm">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user: any, i) => {
                    const role = user.user_roles?.role || "Student";
                    return (
                      <motion.tr key={user.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-brand">
                              {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{user.display_name || "Unknown"}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleColor[role]}`}>
                            {roleIcon[role]} {role}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">{user.grade || "N/A"}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
                        </td>
                        <td className="px-4 py-3 relative">
                          <button onClick={e => openMenu(e, user.user_id)}
                            className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/20 bg-secondary/10">
            <p className="text-xs text-muted-foreground">Showing {filtered.length} of {users?.length || 0} users</p>
          </div>
        </div>
      </motion.div>

      {/* ── Floating action menu ── */}
      {menu && (() => {
        const u = (users || []).find((x: any) => x.user_id === menu.userId)!;
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            style={{ position: "fixed", top: menu.y, left: Math.min(menu.x, window.innerWidth - 220) }}
            className="z-50 w-52 platform-card p-1.5 shadow-xl"
          >
            <p className="text-[10px] px-2 py-1 text-muted-foreground font-semibold uppercase tracking-widest">{u.display_name || "Unknown"}</p>
            <div className="h-px bg-border/30 my-1" />
            <button onClick={() => { setProfileModal({ isOpen: true, userId: menu.userId, activeTab: 'overview' }); fetchUserLearningDNA(menu.userId); setMenu(null); }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/60 transition-colors">
              <Eye className="w-4 h-4" /> View Profile
            </button>
            <button onClick={() => { setRestrictModal({ isOpen: true, userId: menu.userId, type: 'restrict' }); setMenu(null); }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-amber-600 hover:bg-amber-500/10 transition-colors">
              <Lock className="w-4 h-4" /> Restrict
            </button>
            <button onClick={() => { setRestrictModal({ isOpen: true, userId: menu.userId, type: 'ban' }); setMenu(null); }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <Ban className="w-4 h-4" /> Ban User
            </button>
            <div className="h-px bg-border/30 my-1" />
            <button onClick={() => { setRestrictModal({ isOpen: true, userId: menu.userId, type: 'delete' }); setMenu(null); }} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/60 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </motion.div>
        );
      })()}

      {/* ── Add User Modal ── */}
      <AnimatePresence>
        {addUserModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md p-4"
            onClick={() => setAddUserModal({ isOpen: false })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="platform-card p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Add New User</h2>
                  <p className="text-sm text-muted-foreground">Create a new user account</p>
                </div>
                <button
                  onClick={() => setAddUserModal({ isOpen: false })}
                  className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={newUser.display_name}
                    onChange={e => setNewUser({ ...newUser, display_name: e.target.value })}
                    required
                    className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                  >
                    <option value="Student">Student</option>
                    <option value="Admin-Instructor">Admin-Instructor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddUserModal({ isOpen: false })}
                    className="flex-1 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile Modal ── */}
      <AnimatePresence>
        {profileModal?.isOpen && (() => {
          const u = (users || []).find((x: any) => x.user_id === profileModal.userId);
          if (!u) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md p-4"
              onClick={() => setProfileModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="platform-card p-6 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">User Profile</h2>
                    <p className="text-sm text-muted-foreground">Overview and activity for {u.display_name}</p>
                  </div>
                  <button
                    onClick={() => setProfileModal(null)}
                    className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-border/30">
                  <button
                    onClick={() => setProfileModal({ ...profileModal, activeTab: 'overview' })}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${profileModal.activeTab === 'overview' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Overview & Activity
                  </button>
                  <button
                    onClick={() => setProfileModal({ ...profileModal, activeTab: 'learning-dna' })}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${profileModal.activeTab === 'learning-dna' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Learning DNA
                  </button>
                  <button
                    onClick={() => setProfileModal({ ...profileModal, activeTab: 'reports' })}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${profileModal.activeTab === 'reports' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Report Files
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {profileModal.activeTab === 'overview' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="platform-card p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                            {u.display_name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-foreground">{u.display_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{u.email || "No email"}</p>
                        </div>
                        <div className="platform-card p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Role</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleColor[u.user_roles?.role || 'Student']}`}>
                            {roleIcon[u.user_roles?.role || 'Student']} {u.user_roles?.role || 'Student'}
                          </span>
                        </div>
                        <div className="platform-card p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Joined</p>
                          <p className="text-sm text-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                          <Activity className="w-5 h-5" /> Account Activity
                        </h3>
                        <div className="platform-card p-4">
                          <p className="text-sm text-muted-foreground mb-4">User activity tracking will be displayed here. This includes course enrollments, quiz submissions, forum posts, and other platform interactions.</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Activity tracking coming soon</p>
                                <p className="text-xs text-muted-foreground">Detailed audit logs will be available in the next update</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-display text-lg font-bold text-foreground">Account Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="platform-card p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Grade</p>
                            <p className="text-sm text-foreground">{u.grade || "N/A"}</p>
                          </div>
                          <div className="platform-card p-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : profileModal.activeTab === 'learning-dna' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                          <Brain className="w-5 h-5" /> Learning DNA Profile
                        </h3>
                        <Button
                          onClick={handleApplyIdea}
                          disabled={learningPlanState.isGenerating}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                        >
                          {learningPlanState.isGenerating ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Your Plan is getting ready...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="w-4 h-4 mr-2" />
                              Apply Idea
                            </>
                          )}
                        </Button>
                      </div>

                      {!userLearningDNA ? (
                        <div className="platform-card p-6 text-center">
                          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No Learning DNA profile found for this user.</p>
                          <p className="text-xs text-muted-foreground mt-2">The user needs to complete the Learning DNA assessment first.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Learning Needs */}
                          <div className="platform-card p-4">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4" /> Learning Needs
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {userLearningDNA.has_adhd && <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded">ADHD</span>}
                              {userLearningDNA.has_dyslexia && <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded">Dyslexia</span>}
                              {userLearningDNA.has_anxiety && <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded">Anxiety</span>}
                              {userLearningDNA.has_dyscalculia && <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">Dyscalculia</span>}
                              {userLearningDNA.has_asd && <span className="text-xs bg-pink-500/10 text-pink-600 px-2 py-1 rounded">ASD</span>}
                              {!userLearningDNA.has_adhd && !userLearningDNA.has_dyslexia && !userLearningDNA.has_anxiety && !userLearningDNA.has_dyscalculia && !userLearningDNA.has_asd && (
                                <span className="text-xs text-muted-foreground col-span-2">No specific learning needs identified</span>
                              )}
                            </div>
                          </div>

                          {/* Learning Styles */}
                          <div className="platform-card p-4">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" /> Learning Styles
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {userLearningDNA.style_visual && <span className="text-xs bg-cyan-500/10 text-cyan-600 px-2 py-1 rounded">Visual</span>}
                              {userLearningDNA.style_reading && <span className="text-xs bg-indigo-500/10 text-indigo-600 px-2 py-1 rounded">Reading</span>}
                              {userLearningDNA.style_auditory && <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded">Auditory</span>}
                              {userLearningDNA.style_kinesthetic && <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded">Kinesthetic</span>}
                              {userLearningDNA.style_social && <span className="text-xs bg-rose-500/10 text-rose-600 px-2 py-1 rounded">Social</span>}
                              {userLearningDNA.style_solo && <span className="text-xs bg-violet-500/10 text-violet-600 px-2 py-1 rounded">Solo</span>}
                            </div>
                          </div>

                          {/* Focus & Session */}
                          <div className="platform-card p-4">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                              <Zap className="w-4 h-4" /> Focus & Session
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Focus Mode</p>
                                <p className="text-sm font-medium text-foreground capitalize">{userLearningDNA.focus_mode || 'Not set'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Session Length</p>
                                <p className="text-sm font-medium text-foreground capitalize">{userLearningDNA.session_length || 'Not set'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Break Frequency</p>
                                <p className="text-sm font-medium text-foreground capitalize">{userLearningDNA.break_frequency || 'Not set'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-sm font-medium text-foreground">{userLearningDNA.completed ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </div>

                          {/* System Suggested Plan */}
                          {learningPlanState.plan && (
                            <div className="platform-card p-4 border-2 border-primary/30 bg-primary/5">
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> System Suggested Plan
                              </h4>
                              <div className="text-sm text-foreground whitespace-pre-line">
                                {learningPlanState.plan.plan_content}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Generated: {new Date(learningPlanState.plan.created_at).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Report Files
                      </h3>
                      <div className="platform-card p-4">
                        <p className="text-sm text-muted-foreground mb-4">System reports associated with this user will be displayed here.</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">No reports available</p>
                              <p className="text-xs text-muted-foreground">Report file tracking will be available in the next update</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Restrict/Ban/Delete Modal ── */}
      <AnimatePresence>
        {restrictModal?.isOpen && (() => {
          const u = (users || []).find((x: any) => x.user_id === restrictModal.userId);
          if (!u) return null;
          const isBan = restrictModal.type === 'ban';
          const isDelete = restrictModal.type === 'delete';
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md p-4"
              onClick={() => setRestrictModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="platform-card p-6 w-full max-w-md space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBan ? 'bg-destructive/10' : isDelete ? 'bg-muted' : 'bg-amber-500/10'}`}>
                    {isBan ? <Ban className="w-5 h-5 text-destructive" /> : isDelete ? <Trash2 className="w-5 h-5 text-muted-foreground" /> : <Lock className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">
                      {isBan ? `Ban ${u.display_name || "User"}` : isDelete ? 'Delete Account' : 'Restrict User'}
                    </h2>
                    <p className="text-xs text-muted-foreground">{u.email || "No email"}</p>
                  </div>
                </div>

                {isBan && (
                  <p className="text-sm text-muted-foreground bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    The user will see a full-screen ban notice and be unable to access any part of the platform.
                  </p>
                )}

                {restrictModal.type === 'restrict' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Access will be automatically restored after the duration ends.</p>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Duration (hours)</label>
                      <input
                        type="number"
                        min={1}
                        max={720}
                        value={restrictDuration}
                        onChange={e => setRestrictDuration(Number(e.target.value))}
                        className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                      />
                    </div>
                  </div>
                )}

                {isDelete && (
                  <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 border border-border/30">
                    This action cannot be undone. The account will be permanently deleted.
                  </p>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Reason (optional)</label>
                  <textarea
                    value={restrictReason}
                    onChange={e => setRestrictReason(e.target.value)}
                    rows={2}
                    placeholder="State the reason for this action..."
                    className="w-full bg-secondary/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setRestrictModal(null); setRestrictReason(''); setRestrictDuration(24); }}
                    className="flex-1 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (restrictModal.type === 'restrict') {
                        restrictUserMutation.mutate({
                          userId: restrictModal.userId,
                          data: { reason: restrictReason || undefined, duration_hours: restrictDuration }
                        });
                      } else if (restrictModal.type === 'ban') {
                        banUserMutation.mutate({
                          userId: restrictModal.userId,
                          reason: restrictReason || undefined
                        });
                      } else if (restrictModal.type === 'delete') {
                        deleteUserMutation.mutate(restrictModal.userId);
                      }
                    }}
                    disabled={restrictUserMutation.isPending || banUserMutation.isPending || deleteUserMutation.isPending}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${isBan ? 'bg-destructive hover:bg-destructive/80' : isDelete ? 'bg-muted-foreground hover:bg-muted-foreground/80' : 'bg-amber-500 hover:bg-amber-600'}`}
                  >
                    {restrictUserMutation.isPending || banUserMutation.isPending || deleteUserMutation.isPending ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
