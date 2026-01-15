import type { Editor, JSONContent } from "@tiptap/react";

export type EditorMode = "visual" | "markdown" | "html";

export interface EditorState {
  editor: Editor | null;
  mode: EditorMode;
  isReady: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface SelectionState {
  from: number;
  to: number;
  empty: boolean;
  marks: string[];
  node: string | null;
}

export interface EditorActions {
  setEditor: (editor: Editor | null) => void;
  setMode: (mode: EditorMode) => void;
  setIsReady: (isReady: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (lastSaved: Date | null) => void;
}

export interface Block {
  id: string;
  type: BlockType;
  content: JSONContent;
  attrs?: Record<string, unknown>;
}

export type BlockType =
  | "paragraph"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "codeBlock"
  | "blockquote"
  | "table"
  | "image"
  | "horizontalRule";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface InlineFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  highlight?: string;
  color?: string;
  link?: string;
}
