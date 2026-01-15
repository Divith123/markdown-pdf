// Editor Components Index
// UI Components and Dialogs

// Core Editor Components
export { BubbleMenu } from "./bubble-menu";
export { FloatingMenu } from "./floating-menu";

// Dialogs
export { FindReplaceDialog } from "./find-replace-dialog";
export { LinkDialog } from "./link-dialog";
export { ImageDialog } from "./image-dialog";
export { TableDialog, QuickTablePicker } from "./table-dialog";
export { CodeBlockDialog, InlineCodeButton } from "./code-block-dialog";
export { DocumentTemplates } from "./document-templates";
export { MetadataEditor } from "./metadata-editor";
export { DocumentHistoryDialog } from "./document-history-dialog";
export { ImportExportDialog } from "./import-export-dialog";
export { PrintPreviewDialog } from "./print-preview-dialog";
export { EditorSettingsDialog } from "./editor-settings-dialog";

// Pickers
export { EmojiPicker } from "./emoji-picker";
export { SpecialCharactersPicker } from "./special-characters-picker";
export { ColorPicker } from "./color-picker";

// Panels and Utilities
export { TableOfContents, generateMarkdownToc, insertTocIntoDocument } from "./table-of-contents";
export { StatisticsDashboard } from "./statistics-dashboard";
export { CommandPalette } from "./command-palette";

// Math & Diagrams
export { MathDialog, QuickMathSymbols } from "./math-dialog";
export { DiagramDialog, QuickDiagramSelector } from "./diagram-dialog";

// Writing Tools
export { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";
export { WritingGoalsDialog, WritingGoalProgress } from "./writing-goals-dialog";
export { RecentDocumentsPanel, saveToRecentDocuments } from "./recent-documents-panel";
export { SpellCheckDialog, SpellCheckIndicator } from "./spell-check-dialog";
export { FileAttachmentsDialog, QuickAttachButton } from "./file-attachments-dialog";

// Additional Dialogs
export { HorizontalRuleDialog, QuickHorizontalRule, horizontalRuleCSS } from "./horizontal-rule-dialog";
export { BlockquoteDialog, blockquoteCSS } from "./blockquote-dialog";
export { CopyAsFormat, CopySelectionAsFormat } from "./copy-as-format";
export { ReadingLevelIndicator, ReadingLevelBadge } from "./reading-level-indicator";
