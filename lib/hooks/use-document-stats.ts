"use client";

import { useMemo } from "react";
import type { Editor } from "@tiptap/react";

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  headings: number;
  lists: number;
  images: number;
  links: number;
  codeBlocks: number;
  tables: number;
  readingTime: number;
  speakingTime: number;
  readabilityScore: number;
  readabilityLevel: string;
  fleschKincaidGrade: number;
  readability: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
}

export function useDocumentStats(editor: Editor | null): DocumentStats {
  return useMemo(() => {
    if (!editor) {
      return getEmptyStats();
    }
    
    const text = editor.getText();
    const html = editor.getHTML();
    const json = editor.getJSON();
    
    // Word count
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    
    // Character counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    
    // Sentence count (split by . ! ? followed by space or end)
    const sentences = text.split(/[.!?]+\s*/g).filter((s) => s.trim().length > 0).length;
    
    // Count elements from JSON
    let paragraphs = 0;
    let headings = 0;
    let lists = 0;
    let images = 0;
    let links = 0;
    let codeBlocks = 0;
    let tables = 0;
    
    function countNodes(node: Record<string, unknown>) {
      if (!node) return;
      
      switch (node.type) {
        case "paragraph":
          paragraphs++;
          break;
        case "heading":
          headings++;
          break;
        case "bulletList":
        case "orderedList":
        case "taskList":
          lists++;
          break;
        case "image":
          images++;
          break;
        case "codeBlock":
          codeBlocks++;
          break;
        case "table":
          tables++;
          break;
      }
      
      // Count links from marks
      if (Array.isArray(node.marks)) {
        for (const mark of node.marks) {
          if ((mark as Record<string, unknown>).type === "link") {
            links++;
          }
        }
      }
      
      // Recurse into children
      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          countNodes(child as Record<string, unknown>);
        }
      }
    }
    
    countNodes(json as Record<string, unknown>);
    
    // Reading time (average 200-250 words per minute)
    const readingTime = Math.max(1, Math.ceil(words / 225));
    
    // Speaking time (average 130-150 words per minute)
    const speakingTime = Math.max(1, Math.ceil(words / 140));
    
    // Flesch-Kincaid Reading Ease
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const syllables = countSyllables(text);
    const avgSyllablesPerWord = words > 0 ? syllables / words : 0;
    
    // Flesch Reading Ease formula: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
    let readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    readabilityScore = Math.max(0, Math.min(100, Math.round(readabilityScore)));
    
    // Flesch-Kincaid Grade Level formula: 0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59
    let fleschKincaidGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
    fleschKincaidGrade = Math.max(0, Math.round(fleschKincaidGrade * 10) / 10);
    
    const readabilityLevel = getReadabilityLevel(readabilityScore);
    
    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      headings,
      lists,
      images,
      links,
      codeBlocks,
      tables,
      readingTime,
      speakingTime,
      readabilityScore,
      readabilityLevel,
      fleschKincaidGrade,
      readability: readabilityScore,
      avgWordsPerSentence,
      avgSyllablesPerWord,
    };
  }, [editor?.state.doc]);
}

function getEmptyStats(): DocumentStats {
  return {
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    headings: 0,
    lists: 0,
    images: 0,
    links: 0,
    codeBlocks: 0,
    tables: 0,
    readingTime: 0,
    speakingTime: 0,
    readabilityScore: 0,
    readabilityLevel: "N/A",
    fleschKincaidGrade: 0,
    readability: 0,
    avgWordsPerSentence: 0,
    avgSyllablesPerWord: 0,
  };
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let totalSyllables = 0;
  
  for (const word of words) {
    totalSyllables += countWordSyllables(word);
  }
  
  return totalSyllables;
}

function countWordSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  
  if (word.length <= 3) return 1;
  
  // Remove trailing 'e' (silent e)
  word = word.replace(/(?:[^leas])e$/, "");
  word = word.replace(/le$/, "");
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 1;
  
  return Math.max(1, count);
}

function getReadabilityLevel(score: number): string {
  if (score >= 90) return "Very Easy (5th grade)";
  if (score >= 80) return "Easy (6th grade)";
  if (score >= 70) return "Fairly Easy (7th grade)";
  if (score >= 60) return "Standard (8th-9th grade)";
  if (score >= 50) return "Fairly Difficult (10th-12th grade)";
  if (score >= 30) return "Difficult (College)";
  return "Very Difficult (Graduate)";
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
