import { Extension, Mark, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// ===== FOOTNOTES =====

export interface FootnoteOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    footnote: {
      insertFootnote: (content: string) => ReturnType;
    };
  }
}

export const FootnoteReference = Mark.create<FootnoteOptions>({
  name: "footnoteReference",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-footnote-id"),
        renderHTML: (attributes) => ({
          "data-footnote-id": attributes.id,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "sup.footnote-ref",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "sup",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        class: "footnote-ref cursor-pointer text-primary hover:underline",
      },
      0,
    ];
  },
});

export const FootnoteContent = Node.create({
  name: "footnoteContent",
  group: "block",
  content: "inline*",

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.footnote-content",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        ...HTMLAttributes,
        class: "footnote-content text-sm text-muted-foreground border-t pt-2 mt-4",
      },
      0,
    ];
  },
});

// ===== COMMENTS/ANNOTATIONS =====

export interface CommentMark {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  resolved: boolean;
  replies: Array<{
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }>;
}

export interface CommentOptions {
  HTMLAttributes: Record<string, unknown>;
  onCommentClick?: (commentId: string) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    comment: {
      setComment: (id: string) => ReturnType;
      removeComment: (id: string) => ReturnType;
    };
  }
}

export const Comment = Mark.create<CommentOptions>({
  name: "comment",

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentClick: undefined,
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => ({
          "data-comment-id": attributes.commentId,
        }),
      },
      resolved: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-resolved") === "true",
        renderHTML: (attributes) => ({
          "data-resolved": attributes.resolved,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-comment-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const resolved = HTMLAttributes["data-resolved"] === true;
    return [
      "span",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        class: `comment-highlight ${resolved ? "comment-resolved" : "comment-active"}`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (id: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { commentId: id });
        },

      removeComment:
        (id: string) =>
        ({ tr, state }) => {
          const { doc } = state;
          let found = false;

          doc.descendants((node, pos) => {
            if (node.marks) {
              node.marks.forEach((mark) => {
                if (mark.type.name === this.name && mark.attrs.commentId === id) {
                  tr.removeMark(pos, pos + node.nodeSize, mark.type);
                  found = true;
                }
              });
            }
          });

          return found;
        },
    };
  },
});

// ===== SMART TYPOGRAPHY =====

export interface SmartTypographyOptions {
  quotes: boolean;
  dashes: boolean;
  ellipsis: boolean;
  arrows: boolean;
}

export const SmartTypography = Extension.create<SmartTypographyOptions>({
  name: "smartTypography",

  addOptions() {
    return {
      quotes: true,
      dashes: true,
      ellipsis: true,
      arrows: true,
    };
  },

  addInputRules() {
    const rules: any[] = [];

    // Smart quotes
    if (this.options.quotes) {
      // Opening double quote
      rules.push({
        find: /"([^"]*)$/,
        handler: ({ state, range, match }: { state: any; range: any; match: any }) => {
          const { tr } = state;
          tr.insertText(`"${match[1]}`, range.from, range.to);
        },
      } as any);

      // Closing double quote
      rules.push({
        find: /([^"]+)"$/,
        handler: ({ state, range, match }: { state: any; range: any; match: any }) => {
          const { tr } = state;
          tr.insertText(`${match[1]}"`, range.from, range.to);
        },
      } as any);
    }

    // Em-dash
    if (this.options.dashes) {
      rules.push({
        find: /--$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.insertText("—", range.from, range.to);
        },
      } as any);

      // En-dash
      rules.push({
        find: /(\d)-(\d)$/,
        handler: ({ state, range, match }: { state: any; range: any; match: any }) => {
          const { tr } = state;
          tr.insertText(`${match[1]}–${match[2]}`, range.from, range.to);
        },
      } as any);
    }

    // Ellipsis
    if (this.options.ellipsis) {
      rules.push({
        find: /\.\.\.$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.insertText("…", range.from, range.to);
        },
      } as any);
    }

    // Arrows
    if (this.options.arrows) {
      rules.push({
        find: /->$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.insertText("→", range.from, range.to);
        },
      } as any);

      rules.push({
        find: /<-$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.insertText("←", range.from, range.to);
        },
      } as any);

      rules.push({
        find: /<->$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.insertText("↔", range.from, range.to);
        },
      } as any);

      rules.push({
        find: /=>$/,
        handler: ({ state, range }: { state: any; range: any }) => {
          const { tr } = state;
          tr.insertText("⇒", range.from, range.to);
        },
      } as any);
    }

    return rules;
  },
});

// ===== AUTO-LIST =====
// Extension to automatically convert "- " or "1. " at the start of lines to lists

export const AutoList = Extension.create({
  name: "autoList",

  addInputRules() {
    return [
      // Bullet list: "- " or "* "
      {
        find: /^[-*]\s$/,
        handler: ({ state, range }: { state: any; range: any; commands?: any }) => {
          const { tr } = state;
          tr.delete(range.from, range.to);
          (this.editor as any).chain().focus().toggleBulletList().run();
        },
      } as any,

      // Numbered list: "1. "
      {
        find: /^\d+\.\s$/,
        handler: ({ state, range }: { state: any; range: any; commands?: any }) => {
          const { tr } = state;
          tr.delete(range.from, range.to);
          (this.editor as any).chain().focus().toggleOrderedList().run();
        },
      } as any,

      // Task list: "[] " or "[ ] "
      {
        find: /^\[\s?\]\s$/,
        handler: ({ state, range }: { state: any; range: any; commands?: any }) => {
          const { tr } = state;
          tr.delete(range.from, range.to);
          (this.editor as any).chain().focus().toggleTaskList().run();
        },
      } as any,
    ];
  },
});

// ===== SPELLING SUGGESTIONS HIGHLIGHT =====
// This adds visual indicators for potential spelling issues

export interface SpellingHighlightOptions {
  dictionary?: Set<string>;
}

const spellingPluginKey = new PluginKey("spellingHighlight");

export const SpellingHighlight = Extension.create<SpellingHighlightOptions>({
  name: "spellingHighlight",

  addOptions() {
    return {
      dictionary: new Set(),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: spellingPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldState) => {
            // In a real implementation, this would check words against a dictionary
            // and add decorations for misspelled words
            return DecorationSet.empty;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

// CSS styles for these extensions
export const advancedEditingStyles = `
  /* Comment Highlights */
  .comment-highlight {
    background-color: rgba(255, 213, 79, 0.3);
    border-bottom: 2px solid #ffd54f;
    cursor: pointer;
  }

  .comment-highlight:hover {
    background-color: rgba(255, 213, 79, 0.5);
  }

  .comment-resolved {
    background-color: rgba(76, 175, 80, 0.2);
    border-bottom: 2px solid #4caf50;
  }

  /* Footnotes */
  .footnote-ref {
    color: var(--primary);
    font-size: 0.75em;
    vertical-align: super;
    cursor: pointer;
  }

  .footnote-ref:hover {
    text-decoration: underline;
  }

  .footnote-content {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
    margin-top: 1rem;
  }

  .footnote-content::before {
    content: attr(data-id) ". ";
    font-weight: 600;
  }

  /* Spelling highlights */
  .spelling-error {
    text-decoration: wavy underline;
    text-decoration-color: #ef4444;
    text-underline-offset: 2px;
  }

  .spelling-warning {
    text-decoration: wavy underline;
    text-decoration-color: #f59e0b;
    text-underline-offset: 2px;
  }
`;
