import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calculator, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
}

const GRADE_SCALE: Record<string, number> = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "D-": 0.7,
  "F": 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_SCALE);

/**
 * Fully functional GPA Calculator
 * Mathematically accurate with support for weighted courses
 */
export default function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Mathematics", credits: 4, grade: "A", gradePoints: 4.0 },
    { id: "2", name: "Science", credits: 3, grade: "B+", gradePoints: 3.3 },
  ]);

  const { totalCredits, totalGradePoints, gpa, letterGrade } = useMemo(() => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const totalGradePoints = courses.reduce(
      (sum, course) => sum + course.credits * course.gradePoints,
      0
    );
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    // Convert GPA to letter grade
    let letterGrade = "N/A";
    if (gpa >= 4.0) letterGrade = "A";
    else if (gpa >= 3.7) letterGrade = "A-";
    else if (gpa >= 3.3) letterGrade = "B+";
    else if (gpa >= 3.0) letterGrade = "B";
    else if (gpa >= 2.7) letterGrade = "B-";
    else if (gpa >= 2.3) letterGrade = "C+";
    else if (gpa >= 2.0) letterGrade = "C";
    else if (gpa >= 1.7) letterGrade = "C-";
    else if (gpa >= 1.3) letterGrade = "D+";
    else if (gpa >= 1.0) letterGrade = "D";
    else if (gpa >= 0.7) letterGrade = "D-";
    else letterGrade = "F";

    return { totalCredits, totalGradePoints, gpa, letterGrade };
  }, [courses]);

  const addCourse = () => {
    const newId = Date.now().toString();
    setCourses([
      ...courses,
      {
        id: newId,
        name: `Course ${courses.length + 1}`,
        credits: 3,
        grade: "B",
        gradePoints: 3.0,
      },
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(
      courses.map((course) => {
        if (course.id === id) {
          const updated = { ...course, [field]: value };
          if (field === "grade") {
            updated.gradePoints = GRADE_SCALE[value as string] || 0;
          }
          return updated;
        }
        return course;
      })
    );
  };

  const clearAll = () => {
    setCourses([]);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">GPA Calculator</h3>
            <p className="text-xs text-muted-foreground">Track your academic performance</p>
          </div>
        </div>

        {/* GPA Display */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mb-6 border border-border/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current GPA</p>
              <p className="text-2xl font-bold text-foreground">{gpa.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Letter Grade</p>
              <p className="text-2xl font-bold text-primary">{letterGrade}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-foreground">{totalCredits}</p>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-3 mb-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30"
            >
              <div className="flex-1">
                <Input
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Course name"
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, "credits", parseFloat(e.target.value) || 0)}
                  className="h-8 text-sm"
                  min="1"
                  max="10"
                  placeholder="Credits"
                />
              </div>
              <div className="w-24">
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                  className="w-full h-8 px-2 text-sm rounded-md border border-border/30 bg-background"
                >
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCourse(course.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addCourse}
            className="flex-1 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-destructive hover:text-destructive"
          >
            Clear All
          </Button>
        </div>

        {/* GPA Scale Reference */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <p className="text-xs font-semibold text-muted-foreground mb-2">GPA Scale Reference</p>
          <div className="grid grid-cols-4 gap-1 text-xs">
            {GRADE_OPTIONS.map((grade) => (
              <div
                key={grade}
                className="flex justify-between px-2 py-1 rounded bg-secondary/30"
              >
                <span>{grade}</span>
                <span className="font-mono">{GRADE_SCALE[grade].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
