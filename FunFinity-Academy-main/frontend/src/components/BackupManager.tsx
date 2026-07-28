import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Upload, CloudDownload, RefreshCw, AlertCircle,
  CheckCircle2, FileJson, Shield, Calendar, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { exportBackup, downloadBackup, importBackup, restoreBackup, getBackupFileInfo } from "@/lib/backup-service";

export function BackupManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any>(null);

  const handleExport = async () => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      const backupData = await exportBackup(user.id);
      downloadBackup(backupData);
      toast({
        title: "Backup Created",
        description: "Your data has been successfully exported to your device.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Preview the backup file
      importBackup(file)
        .then((data) => {
          setRestorePreview(data);
        })
        .catch(() => {
          toast({
            title: "Invalid File",
            description: "Please select a valid backup file.",
            variant: "destructive",
          });
          setSelectedFile(null);
          setRestorePreview(null);
        });
    }
  };

  const handleRestore = async () => {
    if (!selectedFile || !user?.id) return;

    setIsRestoring(true);
    try {
      const backupData = await importBackup(selectedFile);
      await restoreBackup(backupData, user.id);
      
      toast({
        title: "Restore Complete",
        description: "Your data has been successfully restored.",
      });
      
      // Clear the file selection
      setSelectedFile(null);
      setRestorePreview(null);
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore backup. Please check the file and try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const fileInfo = selectedFile ? getBackupFileInfo(selectedFile) : null;

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="platform-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">Export Data</h3>
              <p className="text-sm text-muted-foreground">
                Download all your data as a backup file
              </p>
            </div>
          </div>
          <Button
            variant="hero"
            size="default"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <CloudDownload className="w-4 h-4 mr-2" />
                Export Backup
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/30">
          {[
            { icon: FileJson, label: "Notes", count: "All" },
            { icon: Shield, label: "Profile", count: "Yes" },
            { icon: Calendar, label: "Progress", count: "Yes" },
            { icon: HardDrive, label: "Bookmarks", count: "All" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import Section */}
      <div className="platform-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">Import Data</h3>
              <p className="text-sm text-muted-foreground">
                Restore your data from a backup file
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/30">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="backup-file-input"
              />
              <label
                htmlFor="backup-file-input"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <FileJson className="w-12 h-12 text-muted-foreground/50" />
                <div>
                  <p className="font-semibold text-foreground">Select Backup File</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a .json backup file from your device
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* File Info */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <FileJson className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">{fileInfo?.name}</p>
                      <p className="text-xs text-muted-foreground">{fileInfo?.size} · {fileInfo?.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setRestorePreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Preview */}
                {restorePreview && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Valid Backup File</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-medium">{restorePreview.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {new Date(restorePreview.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notes:</span>
                        <span className="font-medium">{restorePreview.notes?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bookmarks:</span>
                        <span className="font-medium">{restorePreview.bookmarks?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Restore Warning
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will replace your current data with the backup data. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Restore Button */}
                <Button
                  variant="hero"
                  size="default"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="w-full"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restore Backup
                    </>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Backup Security</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your backup files are encrypted and stored locally on your device. 
              Only you have access to your backup data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
