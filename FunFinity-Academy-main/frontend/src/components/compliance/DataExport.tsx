import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, User, BookOpen, Award, Calendar, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface DataExportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportSection {
  id: string;
  label: string;
  description: string;
  icon: any;
  checked: boolean;
}

export function DataExport({ isOpen, onClose }: DataExportProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [sections, setSections] = useState<ExportSection[]>([
    {
      id: 'profile',
      label: 'Profile Information',
      description: 'Name, email, bio, and personal details',
      icon: User,
      checked: true
    },
    {
      id: 'enrollments',
      label: 'Course Enrollments',
      description: 'Enrolled courses and progress data',
      icon: BookOpen,
      checked: true
    },
    {
      id: 'quiz_results',
      label: 'Quiz Results',
      description: 'Quiz submissions and scores',
      icon: Award,
      checked: true
    },
    {
      id: 'activity',
      label: 'Activity History',
      description: 'Learning activity and timestamps',
      icon: Calendar,
      checked: true
    },
    {
      id: 'achievements',
      label: 'Achievements & Badges',
      description: 'Earned badges and milestones',
      icon: Award,
      checked: true
    }
  ]);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, checked: !section.checked } : section
    ));
  };

  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);
    const exportData: any = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      data: {}
    };

    try {
      // Export profile information
      if (sections.find(s => s.id === 'profile')?.checked) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        exportData.data.profile = profile;
      }

      // Export enrollments
      if (sections.find(s => s.id === 'enrollments')?.checked) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id);
        exportData.data.enrollments = enrollments;
      }

      // Export quiz results
      if (sections.find(s => s.id === 'quiz_results')?.checked) {
        const { data: quizResults } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id);
        exportData.data.quizResults = quizResults;
      }

      // Export activity history
      if (sections.find(s => s.id === 'activity')?.checked) {
        const { data: activity } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);
        exportData.data.activity = activity;
      }

      // Export achievements
      if (sections.find(s => s.id === 'achievements')?.checked) {
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);
        exportData.data.achievements = achievements;
      }

      // Create and download JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `funfinity-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setExportComplete(false);
    onClose();
  };

  if (exportComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleReset}>
        <DialogContent className="sm:max-w-md border-2 border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 rounded-full bg-green-500/10"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold">Export Complete</DialogTitle>
            <DialogDescription className="text-base">
              Your data has been successfully exported and downloaded. The file contains all the information you selected.
            </DialogDescription>
            <Alert className="w-full bg-blue-500/10 border-blue-500/20">
              <Shield className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                This export contains your personal data. Please store it securely and delete it when no longer needed.
              </AlertDescription>
            </Alert>
            <Button onClick={handleReset} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Data Export</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Exercise your right to data portability under GDPR Article 20. Export your data as a JSON file for your records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Data Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Data to Export</Label>
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="flex items-start gap-3 p-4 rounded-lg border-2 transition-all hover:bg-muted/50">
                    <Checkbox
                      id={section.id}
                      checked={section.checked}
                      onCheckedChange={() => toggleSection(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-primary" />
                        <Label htmlFor={section.id} className="font-semibold cursor-pointer">
                          {section.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Information Alert */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <FileText className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <strong>Data Format:</strong> Your data will be exported as a JSON file that can be opened in any text editor or imported into other systems. The file includes all selected data in a structured format.
            </AlertDescription>
          </Alert>

          {/* GDPR Information */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">GDPR Article 20 - Right to Data Portability</p>
                <p>You have the right to receive your personal data in a structured, commonly used, and machine-readable format. This export provides your data in JSON format for easy transfer to other services.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Button
            onClick={handleExport}
            disabled={isExporting || !sections.some(s => s.checked)}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="w- four h-4 mr-2 animate-spin" />
                Exporting Data...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Selected Data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
