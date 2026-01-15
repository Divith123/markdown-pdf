"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Target, Trophy, Flame, TrendingUp, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStats } from "@/lib/hooks";
import { useEditorStore } from "@/stores/editor-store";

interface WritingGoal {
  type: "words" | "characters" | "time";
  target: number;
  deadline?: string;
  createdAt: string;
  dailyTarget?: number;
}

interface WritingStats {
  totalWords: number;
  todayWords: number;
  streak: number;
  lastWritingDate: string;
  dailyHistory: { date: string; words: number }[];
}

export function WritingGoalsDialog() {
  const { editor } = useEditorStore();
  const stats = useDocumentStats(editor);
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<WritingGoal>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("writingGoal");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      type: "words",
      target: 500,
      createdAt: new Date().toISOString(),
    };
  });

  const [writingStats, setWritingStats] = useState<WritingStats>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("writingStats");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      totalWords: 0,
      todayWords: 0,
      streak: 0,
      lastWritingDate: "",
      dailyHistory: [],
    };
  });

  const [showNotifications, setShowNotifications] = useState(true);

  // Calculate progress
  const progress = useMemo(() => {
    switch (goal.type) {
      case "words":
        return Math.min(100, (stats.words / goal.target) * 100);
      case "characters":
        return Math.min(100, (stats.characters / goal.target) * 100);
      case "time":
        // readingTime is already in minutes
        return Math.min(100, (stats.readingTime / goal.target) * 100);
      default:
        return 0;
    }
  }, [stats, goal]);

  const isGoalComplete = progress >= 100;

  // Update goal in localStorage
  const updateGoal = (updates: Partial<WritingGoal>) => {
    const updated = { ...goal, ...updates };
    setGoal(updated);
    localStorage.setItem("writingGoal", JSON.stringify(updated));
  };

  // Save writing stats
  const saveStats = (newStats: WritingStats) => {
    setWritingStats(newStats);
    localStorage.setItem("writingStats", JSON.stringify(newStats));
  };

  // Check and update streak
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = writingStats.lastWritingDate;

    if (stats.words > 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastDate === yesterday.toDateString() || lastDate === today;

      const newStats = {
        ...writingStats,
        totalWords: writingStats.totalWords + (stats.words - writingStats.todayWords),
        todayWords: stats.words,
        lastWritingDate: today,
        streak: lastDate === today 
          ? writingStats.streak 
          : isConsecutive 
            ? writingStats.streak + 1 
            : 1,
      };

      if (lastDate !== today) {
        saveStats(newStats);
      }
    }
  }, [stats.words]);

  const getCurrentValue = () => {
    switch (goal.type) {
      case "words":
        return stats.words;
      case "characters":
        return stats.characters;
      case "time":
        return stats.readingTime;
      default:
        return 0;
    }
  };

  const getUnit = () => {
    switch (goal.type) {
      case "words":
        return "words";
      case "characters":
        return "characters";
      case "time":
        return "minutes";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-2",
            isGoalComplete && "text-green-600"
          )}
          title="Writing Goals"
        >
          <Target className="h-4 w-4" />
          <span className="text-xs">
            {getCurrentValue()}/{goal.target}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Writing Goals
          </DialogTitle>
          <DialogDescription>
            Set and track your writing goals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Display */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className="stroke-muted"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  className={cn(
                    "transition-all duration-500",
                    isGoalComplete ? "stroke-green-500" : "stroke-primary"
                  )}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {getCurrentValue()} / {goal.target}
                  </p>
                </div>
              </div>
            </div>

            {isGoalComplete && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Trophy className="h-5 w-5" />
                <span className="font-medium">Goal Complete!</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted rounded-lg text-center">
              <Flame className="h-5 w-5 mx-auto text-orange-500" />
              <p className="text-lg font-bold mt-1">{writingStats.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-blue-500" />
              <p className="text-lg font-bold mt-1">{writingStats.todayWords}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <Calendar className="h-5 w-5 mx-auto text-purple-500" />
              <p className="text-lg font-bold mt-1">
                {writingStats.totalWords.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {/* Goal Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium">Goal Settings</h4>

            <div className="space-y-2">
              <Label>Goal Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["words", "characters", "time"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateGoal({ type })}
                    className={cn(
                      "p-2 border rounded-lg text-sm capitalize transition-all",
                      goal.type === type
                        ? "border-primary bg-primary/10"
                        : "hover:border-muted-foreground"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target ({getUnit()})</Label>
              <Input
                id="target"
                type="number"
                min={1}
                value={goal.target}
                onChange={(e) => updateGoal({ target: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={goal.deadline || ""}
                onChange={(e) => updateGoal({ deadline: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get reminded when you reach milestones
                </p>
              </div>
              <Switch
                id="notifications"
                checked={showNotifications}
                onCheckedChange={setShowNotifications}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Quick Presets</Label>
            <div className="flex gap-2 flex-wrap">
              {[250, 500, 1000, 2000, 5000].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => updateGoal({ type: "words", target: preset })}
                  className={cn(
                    goal.type === "words" && goal.target === preset && "border-primary"
                  )}
                >
                  {preset} words
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple progress indicator for the status bar
export function WritingGoalProgress() {
  const { editor } = useEditorStore();
  const stats = useDocumentStats(editor);
  const [goal, setGoal] = useState<WritingGoal | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("writingGoal");
      if (saved) {
        try {
          setGoal(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  if (!goal) return null;

  const current = goal.type === "words" ? stats.words : stats.characters;
  const progress = Math.min(100, (current / goal.target) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            progress >= 100 ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {current}/{goal.target}
      </span>
    </div>
  );
}
