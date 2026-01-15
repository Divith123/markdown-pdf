"use client";

import { useState, useCallback, useMemo } from "react";
import type { Editor } from "@tiptap/react";

export interface FindReplaceState {
  searchTerm: string;
  replaceTerm: string;
  isRegex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
  currentMatch: number;
  totalMatches: number;
  matches: Array<{ from: number; to: number }>;
}

export function useFindReplace(editor: Editor | null) {
  const [state, setState] = useState<FindReplaceState>({
    searchTerm: "",
    replaceTerm: "",
    isRegex: false,
    caseSensitive: false,
    wholeWord: false,
    currentMatch: 0,
    totalMatches: 0,
    matches: [],
  });

  const findMatches = useCallback((searchTerm: string, options: {
    isRegex?: boolean;
    caseSensitive?: boolean;
    wholeWord?: boolean;
  } = {}) => {
    if (!editor || !searchTerm) {
      setState(prev => ({ ...prev, matches: [], totalMatches: 0, currentMatch: 0 }));
      return [];
    }

    const { isRegex = false, caseSensitive = false, wholeWord = false } = options;
    const text = editor.state.doc.textContent;
    const matches: Array<{ from: number; to: number }> = [];

    try {
      let pattern: RegExp;
      
      if (isRegex) {
        pattern = new RegExp(searchTerm, caseSensitive ? "g" : "gi");
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const wordBoundary = wholeWord ? "\\b" : "";
        pattern = new RegExp(
          `${wordBoundary}${escapedTerm}${wordBoundary}`,
          caseSensitive ? "g" : "gi"
        );
      }

      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Convert text position to document position
        const from = match.index + 1; // +1 because doc positions are 1-indexed
        const to = from + match[0].length;
        matches.push({ from, to });
      }
    } catch {
      // Invalid regex, return empty matches
    }

    setState(prev => ({
      ...prev,
      searchTerm,
      matches,
      totalMatches: matches.length,
      currentMatch: matches.length > 0 ? 1 : 0,
    }));

    return matches;
  }, [editor]);

  const findNext = useCallback(() => {
    if (!editor || state.matches.length === 0) return;

    const nextIndex = state.currentMatch < state.totalMatches 
      ? state.currentMatch 
      : 0;
    
    const match = state.matches[nextIndex];
    if (match) {
      editor.chain()
        .focus()
        .setTextSelection({ from: match.from, to: match.to })
        .scrollIntoView()
        .run();
      
      setState(prev => ({
        ...prev,
        currentMatch: nextIndex + 1,
      }));
    }
  }, [editor, state.matches, state.currentMatch, state.totalMatches]);

  const findPrevious = useCallback(() => {
    if (!editor || state.matches.length === 0) return;

    const prevIndex = state.currentMatch > 1 
      ? state.currentMatch - 2 
      : state.totalMatches - 1;
    
    const match = state.matches[prevIndex];
    if (match) {
      editor.chain()
        .focus()
        .setTextSelection({ from: match.from, to: match.to })
        .scrollIntoView()
        .run();
      
      setState(prev => ({
        ...prev,
        currentMatch: prevIndex + 1,
      }));
    }
  }, [editor, state.matches, state.currentMatch, state.totalMatches]);

  const replaceNext = useCallback(() => {
    if (!editor || state.matches.length === 0) return;

    const currentIndex = Math.max(0, state.currentMatch - 1);
    const match = state.matches[currentIndex];
    
    if (match) {
      editor.chain()
        .focus()
        .setTextSelection({ from: match.from, to: match.to })
        .deleteSelection()
        .insertContent(state.replaceTerm)
        .run();
      
      // Re-find matches after replacement
      findMatches(state.searchTerm, {
        isRegex: state.isRegex,
        caseSensitive: state.caseSensitive,
        wholeWord: state.wholeWord,
      });
    }
  }, [editor, state, findMatches]);

  const replaceAll = useCallback(() => {
    if (!editor || state.matches.length === 0) return;

    // Replace from end to start to maintain positions
    const sortedMatches = [...state.matches].sort((a, b) => b.from - a.from);
    
    editor.chain().focus();
    
    const chain = editor.chain();
    for (const match of sortedMatches) {
      chain
        .setTextSelection({ from: match.from, to: match.to })
        .deleteSelection()
        .insertContent(state.replaceTerm);
    }
    chain.run();

    setState(prev => ({
      ...prev,
      matches: [],
      totalMatches: 0,
      currentMatch: 0,
    }));
  }, [editor, state.matches, state.replaceTerm]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
    findMatches(term, {
      isRegex: state.isRegex,
      caseSensitive: state.caseSensitive,
      wholeWord: state.wholeWord,
    });
  }, [findMatches, state.isRegex, state.caseSensitive, state.wholeWord]);

  const setReplaceTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, replaceTerm: term }));
  }, []);

  const setOptions = useCallback((options: Partial<Pick<FindReplaceState, "isRegex" | "caseSensitive" | "wholeWord">>) => {
    setState(prev => {
      const newState = { ...prev, ...options };
      return newState;
    });
    
    // Re-find with new options
    if (state.searchTerm) {
      findMatches(state.searchTerm, {
        isRegex: options.isRegex ?? state.isRegex,
        caseSensitive: options.caseSensitive ?? state.caseSensitive,
        wholeWord: options.wholeWord ?? state.wholeWord,
      });
    }
  }, [state, findMatches]);

  const clearSearch = useCallback(() => {
    setState({
      searchTerm: "",
      replaceTerm: "",
      isRegex: false,
      caseSensitive: false,
      wholeWord: false,
      currentMatch: 0,
      totalMatches: 0,
      matches: [],
    });
  }, []);

  return {
    ...state,
    setSearchTerm,
    setReplaceTerm,
    setOptions,
    findMatches,
    findNext,
    findPrevious,
    replaceNext,
    replaceAll,
    clearSearch,
  };
}
