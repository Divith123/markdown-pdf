"use client";

import { useMemo } from "react";
import { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  GraduationCap, 
  Baby, 
  Building2, 
  Newspaper,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStats } from "@/lib/hooks";

interface ReadingLevelIndicatorProps {
  editor: Editor | null;
}

interface ReadingLevel {
  grade: number;
  label: string;
  audience: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const readingLevels: ReadingLevel[] = [
  {
    grade: 5,
    label: "Elementary",
    audience: "Ages 10-11",
    icon: <Baby className="h-4 w-4" />,
    color: "bg-green-100 text-green-700 border-green-200",
    description: "Simple vocabulary, short sentences. Very easy to read.",
  },
  {
    grade: 6,
    label: "Middle School",
    audience: "Ages 11-14",
    icon: <BookOpen className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "Clear and accessible for general audiences.",
  },
  {
    grade: 9,
    label: "High School",
    audience: "Ages 14-18",
    icon: <GraduationCap className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    description: "Moderate complexity, suitable for most readers.",
  },
  {
    grade: 12,
    label: "College",
    audience: "Ages 18+",
    icon: <Building2 className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    description: "Complex sentences, advanced vocabulary.",
  },
  {
    grade: 16,
    label: "Professional",
    audience: "Specialists",
    icon: <Newspaper className="h-4 w-4" />,
    color: "bg-red-100 text-red-700 border-red-200",
    description: "Technical or academic writing. Difficult for general audiences.",
  },
];

export function ReadingLevelIndicator({ editor }: ReadingLevelIndicatorProps) {
  const stats = useDocumentStats(editor);

  const readingLevel = useMemo(() => {
    const grade = stats.fleschKincaidGrade;
    
    if (grade < 6) return readingLevels[0]; // Elementary
    if (grade < 9) return readingLevels[1]; // Middle School
    if (grade < 12) return readingLevels[2]; // High School
    if (grade < 16) return readingLevels[3]; // College
    return readingLevels[4]; // Professional
  }, [stats.fleschKincaidGrade]);

  const fleschScore = stats.readability;
  const fleschLabel = useMemo(() => {
    if (fleschScore >= 90) return { label: "Very Easy", color: "text-green-600" };
    if (fleschScore >= 80) return { label: "Easy", color: "text-green-500" };
    if (fleschScore >= 70) return { label: "Fairly Easy", color: "text-blue-500" };
    if (fleschScore >= 60) return { label: "Standard", color: "text-blue-600" };
    if (fleschScore >= 50) return { label: "Fairly Difficult", color: "text-yellow-600" };
    if (fleschScore >= 30) return { label: "Difficult", color: "text-orange-600" };
    return { label: "Very Difficult", color: "text-red-600" };
  }, [fleschScore]);

  if (stats.words < 50) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <HelpCircle className="h-4 w-4" />
        <span className="text-xs">Need more text</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2", readingLevel.color.replace("bg-", "text-").split(" ")[0])}
        >
          {readingLevel.icon}
          <span className="text-xs">{readingLevel.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          {/* Current Level */}
          <div className={cn("p-3 rounded-lg border", readingLevel.color)}>
            <div className="flex items-center gap-2 mb-1">
              {readingLevel.icon}
              <span className="font-medium">{readingLevel.label}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Grade {Math.round(stats.fleschKincaidGrade)}
              </Badge>
            </div>
            <p className="text-sm opacity-80">{readingLevel.description}</p>
            <p className="text-xs mt-1 opacity-60">
              Target audience: {readingLevel.audience}
            </p>
          </div>

          {/* Scores */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Flesch Reading Ease</span>
                <span className={cn("font-medium", fleschLabel.color)}>
                  {Math.round(fleschScore)} ({fleschLabel.label})
                </span>
              </div>
              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{
                    width: `${Math.min(100, fleschScore)}%`,
                    marginLeft: `${100 - Math.min(100, fleschScore)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>Difficult</span>
                <span>Easy</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Grade Level</span>
                <span className="font-medium">
                  {stats.fleschKincaidGrade.toFixed(1)}
                </span>
              </div>
              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (stats.fleschKincaidGrade / 16) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>Grade 1</span>
                <span>Grade 16+</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="pt-3 border-t">
            <p className="text-xs font-medium mb-2">Tips for Readability</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {stats.fleschKincaidGrade > 12 && (
                <li className="flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" />
                  Consider using shorter sentences
                </li>
              )}
              {stats.avgWordsPerSentence > 20 && (
                <li className="flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" />
                  Average sentence length is {Math.round(stats.avgWordsPerSentence)} words (aim for 15-20)
                </li>
              )}
              {fleschScore < 60 && (
                <li className="flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" />
                  Try using simpler words and active voice
                </li>
              )}
              {fleschScore >= 60 && stats.fleschKincaidGrade <= 12 && (
                <li className="flex items-start gap-1">
                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                  Good readability for general audiences
                </li>
              )}
            </ul>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t">
            <div>
              <p className="font-medium">{stats.words}</p>
              <p className="text-muted-foreground">Words</p>
            </div>
            <div>
              <p className="font-medium">{stats.sentences}</p>
              <p className="text-muted-foreground">Sentences</p>
            </div>
            <div>
              <p className="font-medium">{Math.round(stats.avgWordsPerSentence)}</p>
              <p className="text-muted-foreground">Avg Words</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for status bar
export function ReadingLevelBadge({ editor }: ReadingLevelIndicatorProps) {
  const stats = useDocumentStats(editor);

  const levelLabel = useMemo(() => {
    const grade = stats.fleschKincaidGrade;
    if (grade < 6) return "Elementary";
    if (grade < 9) return "Middle";
    if (grade < 12) return "High School";
    if (grade < 16) return "College";
    return "Pro";
  }, [stats.fleschKincaidGrade]);

  if (stats.words < 50) return null;

  return (
    <span className="text-xs text-muted-foreground">
      {levelLabel} (Grade {Math.round(stats.fleschKincaidGrade)})
    </span>
  );
}
