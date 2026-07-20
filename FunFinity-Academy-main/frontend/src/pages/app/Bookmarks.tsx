import { motion } from "framer-motion";
import { Trash2, Loader2, Bookmark, BookOpen, FileText, Video, HelpCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks, useRemoveBookmark } from "@/hooks/use-bookmarks";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const typeIcons: Record<string, typeof BookOpen> = {
  course: BookOpen, lesson: Play, video: Video, resource: FileText, quiz: HelpCircle,
};

export default function Bookmarks() {
  const { data: bookmarks, isLoading } = useBookmarks();
  const removeBookmark = useRemoveBookmark();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          <span className="text-gradient-brand">Bookmarks</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your saved content</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !bookmarks?.length ? (
        <div className="platform-card p-16 text-center border-dashed">
          <Bookmark className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground">Save content across the platform to find it here!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((item, i) => {
            const Icon = typeIcons[item.resource_type] || Bookmark;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="platform-card p-4 flex items-center gap-4 group hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.resource_type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Remove bookmark"
                  onClick={() => removeBookmark.mutate(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
