"use client";

import { useMemo } from "react";
import { useDocumentStats } from "@/lib/hooks";
import { useEditorStore } from "@/stores/editor-store";
import { useDocumentStore } from "@/stores/document-store";
import {
  FileText,
  Type,
  Hash,
  AlignLeft,
  Clock,
  Mic,
  BarChart3,
  BookOpen,
  GraduationCap,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}

function StatCard({ icon, label, value, sublabel, className }: StatCardProps) {
  return (
    <div className={cn("p-4 border rounded-lg space-y-1", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sublabel && (
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}

function ReadabilityGauge({ score, label }: { score: number; label: string }) {
  // Normalize score to 0-100 range (Flesch reading ease)
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Color based on score
  const getColor = (s: number) => {
    if (s >= 60) return "text-green-500";
    if (s >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarColor = (s: number) => {
    if (s >= 60) return "bg-green-500";
    if (s >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn("text-lg font-bold", getColor(normalizedScore))}>
          {normalizedScore.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getBarColor(normalizedScore))}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}

export function StatisticsDashboard() {
  const { editor } = useEditorStore();
  const { metadata } = useDocumentStore();
  const stats = useDocumentStats(editor);

  const gradeLevel = useMemo(() => {
    // Calculate grade level from Flesch-Kincaid
    const fleschKincaid = stats.readabilityScore;
    if (fleschKincaid >= 90) return "5th Grade";
    if (fleschKincaid >= 80) return "6th Grade";
    if (fleschKincaid >= 70) return "7th Grade";
    if (fleschKincaid >= 60) return "8th-9th Grade";
    if (fleschKincaid >= 50) return "10th-12th Grade";
    if (fleschKincaid >= 30) return "College";
    return "Graduate";
  }, [stats.readabilityScore]);

  const difficultyLabel = useMemo(() => {
    const fleschKincaid = stats.readabilityScore;
    if (fleschKincaid >= 60) return "Easy to Read";
    if (fleschKincaid >= 30) return "Fairly Difficult";
    return "Very Difficult";
  }, [stats.readabilityScore]);

  const topWords = useMemo(() => {
    if (!editor) return [];
    
    const text = editor.getText().toLowerCase();
    const words = text.match(/\b[a-z]+\b/g) || [];
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "is", "are", "was", "were", "be", "been", "being", "have", "has",
      "had", "do", "does", "did", "will", "would", "could", "should", "may",
      "might", "must", "shall", "can", "need", "dare", "ought", "used", "it",
      "its", "this", "that", "these", "those", "with", "from", "by", "as",
      "i", "you", "he", "she", "they", "we", "my", "your", "his", "her",
    ]);

    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      if (!stopWords.has(word) && word.length > 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [editor?.state.doc]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Document Statistics
        </h3>
        {metadata.title && (
          <span className="text-sm text-muted-foreground">{metadata.title}</span>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Type className="h-4 w-4" />}
          label="Words"
          value={stats.words.toLocaleString()}
        />
        <StatCard
          icon={<Hash className="h-4 w-4" />}
          label="Characters"
          value={stats.characters.toLocaleString()}
          sublabel={`${stats.charactersNoSpaces.toLocaleString()} without spaces`}
        />
        <StatCard
          icon={<AlignLeft className="h-4 w-4" />}
          label="Paragraphs"
          value={stats.paragraphs.toLocaleString()}
          sublabel={`${stats.sentences.toLocaleString()} sentences`}
        />
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Pages"
          value={Math.ceil(stats.words / 250)}
          sublabel="~250 words/page"
        />
      </div>

      {/* Time Estimates */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Reading Time"
          value={stats.readingTime}
          sublabel="~200 words/minute"
        />
        <StatCard
          icon={<Mic className="h-4 w-4" />}
          label="Speaking Time"
          value={stats.speakingTime}
          sublabel="~150 words/minute"
        />
      </div>

      {/* Readability Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Readability Analysis
        </h4>

        <ReadabilityGauge
          score={stats.readabilityScore}
          label="Flesch Reading Ease"
        />

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              Grade Level
            </div>
            <p className="font-medium">{gradeLevel}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Difficulty
            </div>
            <p className="font-medium">{difficultyLabel}</p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p><strong>Score Guide:</strong></p>
          <p>90-100: Very Easy | 60-70: Standard | 0-30: Very Difficult</p>
        </div>
      </div>

      {/* Top Words */}
      {topWords.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Most Used Words
          </h4>
          <div className="space-y-2">
            {topWords.slice(0, 5).map(([word, count], index) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">
                  {index + 1}.
                </span>
                <span className="flex-1 font-mono text-sm">{word}</span>
                <span className="text-sm text-muted-foreground">
                  {count}×
                </span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(count / topWords[0][1]) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
