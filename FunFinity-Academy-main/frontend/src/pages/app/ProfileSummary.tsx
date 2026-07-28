import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, ArrowRight, User, BookOpen, Target, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunfinityIcon } from '@/components/brand/FunfinityLogo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function ProfileSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [learningDNA, academicProfile] = await Promise.all([
        supabase.from('learning_dna_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('academic_profiles').select('*').eq('user_id', user.id).single()
      ]);

      return {
        learningDNA: learningDNA.data,
        academicProfile: academicProfile.data
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const data = editedData || profileData;

  const handleEdit = () => {
    setEditedData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Save edited data
    await Promise.all([
      supabase.from('learning_dna_profiles').update(editedData.learningDNA).eq('user_id', user!.id),
      supabase.from('academic_profiles').update(editedData.academicProfile).eq('user_id', user!.id)
    ]);
    setEditedData(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(null);
    setIsEditing(false);
  };

  const handleContinue = () => {
    navigate('/app/interactive-tour');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FunfinityIcon size="lg" className="text-primary" />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Profile Summary</h1>
            <p className="text-xs text-muted-foreground">Review your learning profile</p>
          </div>
        </div>

        {!isEditing ? (
          <Button variant="outline" onClick={handleEdit} className="gap-2">
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {/* Learning DNA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Learning DNA</h2>
              <p className="text-xs text-muted-foreground">Your unique learning style</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Learning Style</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {data?.learningDNA?.learning_style || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Study Preference</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {data?.learningDNA?.study_preference || 'Not set'}
              </span>
            </div>
            <div className="py-2">
              <span className="text-sm text-muted-foreground block mb-2">Interests</span>
              <div className="flex flex-wrap gap-2">
                {data?.learningDNA?.interests?.length > 0 ? (
                  (data.learningDNA.interests as string[]).map((interest: string) => (
                    <span key={interest} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No interests selected</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Goals</h2>
              <p className="text-xs text-muted-foreground">Your academic objectives</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {data?.learningDNA?.goals?.length > 0 ? (
              (data.learningDNA.goals as string[]).map((goal: string) => (
                <span key={goal} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium capitalize">
                  {goal}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No goals selected</span>
            )}
          </div>
        </motion.div>

        {/* Academic Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Academic Profile</h2>
              <p className="text-xs text-muted-foreground">Your educational background</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Grade Level</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {data?.academicProfile?.grade_level || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">School Type</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {data?.academicProfile?.school_type || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Intended Major</span>
              <span className="text-sm font-medium text-foreground capitalize">
                {data?.academicProfile?.intended_major || 'Not set'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-secondary/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium mb-1">Profile Complete</p>
              <p className="text-xs text-muted-foreground">
                Your learning profile has been saved. You can always update these settings later from your profile page.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full group"
            variant="hero"
          >
            Continue to Interactive Tour
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
