import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Lock, Ban, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, liftRestriction } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function AdminRestrictions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await fetchUsers();
      return result.data || [];
    },
    refetchInterval: 30000,
  });

  // Filter users with restrictions (mock data for now)
  const restrictedUsers = (users || []).filter((u: any) => 
    u.status === 'restricted' || u.status === 'banned'
  );

  const liftRestrictionMutation = useMutation({
    mutationFn: liftRestriction,
    onSuccess: () => {
      toast({ title: "Restriction lifted", description: "User restriction has been removed." });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to lift restriction", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="platform-card p-12 text-center">
          <p className="text-muted-foreground">Loading restrictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/users" className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Restriction Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">View and manage user restrictions and bans</p>
          </div>
        </div>

        <div className="platform-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restrictedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Lock className="w-12 h-12 text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground text-sm">No active restrictions</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  restrictedUsers.map((user: any, i) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
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
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.status === 'banned' 
                            ? 'bg-destructive/10 text-destructive border-destructive/20' 
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {user.status === 'banned' ? <Ban className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {user.status === 'banned' ? 'Banned' : 'Restricted'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">Restricted by admin</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> N/A
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => liftRestrictionMutation.mutate(user.id)}
                          disabled={liftRestrictionMutation.isPending}
                          className="h-7 px-2 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Lift
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/20 bg-secondary/10">
            <p className="text-xs text-muted-foreground">Showing {restrictedUsers.length} active restrictions</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
