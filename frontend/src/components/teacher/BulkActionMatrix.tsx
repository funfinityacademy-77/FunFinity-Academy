/**
 * Zero-Friction Teacher Bulk-Action Matrix
 * Ultra-efficient data matrix dashboard for managing 30+ students simultaneously
 * Two-click bulk operations with optimistic updates and visual feedback
 */

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X, Lock, Unlock, Send, MoreVertical, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  currentModule: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'locked';
}

interface BulkActionMatrixProps {
  students: Student[];
  onBulkAction: (action: string, studentIds: string[]) => Promise<void>;
}

type BulkAction = 'unlock_module' | 'lock_module' | 'send_notification' | 'reset_progress' | 'assign_course';

export function BulkActionMatrix({ students, onBulkAction }: BulkActionMatrixProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'locked'>('all');
  const [showActionMenu, setShowActionMenu] = useState(false);

  const filteredStudents = useMemo(() => {
    if (filterStatus === 'all') return students;
    return students.filter(s => s.status === filterStatus);
  }, [students, filterStatus]);

  const allSelected = filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length;
  const someSelected = selectedStudents.size > 0 && !allSelected;

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (allSelected) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!selectedAction || selectedStudents.size === 0) return;

    setIsProcessing(true);
    const studentIds = Array.from(selectedStudents);

    try {
      await onBulkAction(selectedAction, studentIds);
      setSelectedStudents(new Set());
      setSelectedAction(null);
      setShowActionMenu(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const actionLabels: Record<BulkAction, string> = {
    unlock_module: 'Unlock Module',
    lock_module: 'Lock Module',
    send_notification: 'Send Notification',
    reset_progress: 'Reset Progress',
    assign_course: 'Assign Course',
  };

  const actionIcons: Record<BulkAction, React.ReactNode> = {
    unlock_module: <Unlock className="w-4 h-4" />,
    lock_module: <Lock className="w-4 h-4" />,
    send_notification: <Send className="w-4 h-4" />,
    reset_progress: <X className="w-4 h-4" />,
    assign_course: <Check className="w-4 h-4" />,
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with Bulk Actions */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* Select All */}
          <button
            onClick={toggleAllSelection}
            disabled={filteredStudents.length === 0}
            className={cn(
              "w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all",
              allSelected
                ? "bg-blue-500 border-blue-500 text-white"
                : someSelected
                ? "bg-blue-100 border-blue-500 text-blue-600"
                : "border-gray-300 text-gray-400 hover:border-gray-400"
            )}
            aria-label={allSelected ? "Deselect all" : "Select all"}
          >
            {allSelected ? <Check className="w-5 h-5" /> : <div className="w-5 h-5" />}
          </button>

          <div className="h-8 w-px bg-gray-200" />

          {/* Selection Count */}
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{selectedStudents.size}</span>
            <span className="text-gray-600"> selected</span>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {filterStatus === 'all' ? 'All Students' : filterStatus}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          <AnimatePresence>
            {showActionMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
              >
                {(['all', 'active', 'inactive', 'locked'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowActionMenu(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors",
                      filterStatus === status
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {status === 'all' ? 'All Students' : status}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedStudents.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <p className="font-semibold">
                    {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-white/80">
                    Choose an action to apply
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {Object.entries(actionLabels).map(([action, label]) => (
                  <button
                    key={action}
                    onClick={() => setSelectedAction(action as BulkAction)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                      selectedAction === action
                        ? "bg-white text-blue-600 font-semibold"
                        : "bg-white/20 text-white hover:bg-white/30"
                    )}
                  >
                    {actionIcons[action as BulkAction]}
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Action Button */}
            {selectedAction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-sm">
                    Apply "{actionLabels[selectedAction]}" to {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={handleBulkAction}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                  >
                    {isProcessing ? 'Processing...' : 'Execute'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-1">Select</div>
          <div className="col-span-3">Student</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-3">Current Module</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Student Rows */}
        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 items-center hover:bg-blue-50 transition-colors",
                  selectedStudents.has(student.id) && "bg-blue-50"
                )}
              >
                {/* Select Checkbox */}
                <div className="col-span-1">
                  <button
                    onClick={() => toggleStudentSelection(student.id)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                      selectedStudents.has(student.id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 hover:border-blue-400"
                    )}
                    aria-label={`Select ${student.name}`}
                  >
                    {selectedStudents.has(student.id) && <Check className="w-4 h-4" />}
                  </button>
                </div>

                {/* Student Info */}
                <div className="col-span-3">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600 truncate">{student.email}</p>
                </div>

                {/* Progress Bar */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${student.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {student.progress}%
                    </span>
                  </div>
                </div>

                {/* Current Module */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-900 truncate">{student.currentModule}</p>
                  <p className="text-xs text-gray-600">{student.lastActive}</p>
                </div>

                {/* Status Badge */}
                <div className="col-span-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                      student.status === 'active'
                        ? "bg-green-100 text-green-700"
                        : student.status === 'inactive'
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {student.status === 'active' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    {student.status}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="col-span-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-600">No students found matching the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Quick Action Button Component
 * For single-student quick actions
 */
export function QuickActionButton({
  icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}) {
  const variantStyles = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-100 hover:bg-red-200 text-red-700',
    success: 'bg-green-100 hover:bg-green-200 text-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        variantStyles[variant]
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
