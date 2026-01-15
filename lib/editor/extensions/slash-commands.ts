import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type { Editor, Range } from "@tiptap/core";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const slashCommands: SlashCommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "heading-1",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "heading-2",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "heading-3",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Paragraph",
    description: "Normal text block",
    icon: "pilcrow",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: "list",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: "list-ordered",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Create a to-do list with checkboxes",
    icon: "list-todo",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Blockquote",
    description: "Add a quote block",
    icon: "quote",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Add a code snippet",
    icon: "code",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Horizontal Rule",
    description: "Add a horizontal divider",
    icon: "minus",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: "table",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: "Callout Info",
    description: "Add an info callout box",
    icon: "info",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({
        type: "callout",
        attrs: { type: "info" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Info callout" }] }],
      }).run();
    },
  },
  {
    title: "Callout Warning",
    description: "Add a warning callout box",
    icon: "alert-triangle",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({
        type: "callout",
        attrs: { type: "warning" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Warning callout" }] }],
      }).run();
    },
  },
  {
    title: "Callout Tip",
    description: "Add a tip callout box",
    icon: "lightbulb",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({
        type: "callout",
        attrs: { type: "tip" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Tip callout" }] }],
      }).run();
    },
  },
  {
    title: "Callout Danger",
    description: "Add a danger callout box",
    icon: "alert-octagon",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({
        type: "callout",
        attrs: { type: "danger" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Danger callout" }] }],
      }).run();
    },
  },
];

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
