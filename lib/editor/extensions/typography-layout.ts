import { Extension, Mark } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// Drop Cap Extension - Adds decorative large first letter
export interface DropCapOptions {
  enabled: boolean;
  size: number; // in em units
  lines: number; // how many lines the drop cap spans
  fontFamily?: string;
  color?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dropCap: {
      toggleDropCap: () => ReturnType;
      setDropCapOptions: (options: Partial<DropCapOptions>) => ReturnType;
    };
  }
}

export const DropCap = Extension.create<DropCapOptions>({
  name: "dropCap",

  addOptions() {
    return {
      enabled: false,
      size: 3.5,
      lines: 3,
      fontFamily: undefined,
      color: undefined,
    };
  },

  addStorage() {
    return {
      enabled: this.options.enabled,
    };
  },

  addCommands() {
    return {
      toggleDropCap:
        () =>
        ({ editor }) => {
          this.storage.enabled = !this.storage.enabled;
          editor.view.dispatch(editor.state.tr);
          return true;
        },
      setDropCapOptions:
        (options: Partial<DropCapOptions>) =>
        ({ editor }) => {
          Object.assign(this.options, options);
          editor.view.dispatch(editor.state.tr);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: new PluginKey("dropCap"),
        props: {
          decorations(state) {
            if (!extension.storage.enabled) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const { doc } = state;

            // Find the first paragraph
            let found = false;
            doc.descendants((node, pos) => {
              if (found) return false;
              if (node.type.name === "paragraph" && node.textContent.length > 0) {
                found = true;
                
                // Create a CSS class decoration for the first paragraph
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "drop-cap-paragraph",
                    style: `--drop-cap-size: ${extension.options.size}em; --drop-cap-lines: ${extension.options.lines}; ${extension.options.fontFamily ? `--drop-cap-font: ${extension.options.fontFamily};` : ""} ${extension.options.color ? `--drop-cap-color: ${extension.options.color};` : ""}`,
                  })
                );

                return false;
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// Multi-column Layout Extension
export interface ColumnsOptions {
  defaultColumns: number;
  maxColumns: number;
  gap: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (columns: number) => ReturnType;
      removeColumns: () => ReturnType;
    };
  }
}

export const Columns = Extension.create<ColumnsOptions>({
  name: "columns",

  addOptions() {
    return {
      defaultColumns: 1,
      maxColumns: 4,
      gap: "2rem",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote"],
        attributes: {
          columns: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-columns"),
            renderHTML: (attributes) => {
              if (!attributes.columns) {
                return {};
              }
              return {
                "data-columns": attributes.columns,
                style: `column-count: ${attributes.columns}; column-gap: ${this.options.gap};`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setColumns:
        (columns: number) =>
        ({ commands, state }) => {
          const { from, to } = state.selection;
          let success = false;

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (["paragraph", "heading", "blockquote"].includes(node.type.name)) {
              commands.updateAttributes(node.type.name, {
                columns: columns > 1 ? columns : null,
              });
              success = true;
            }
          });

          return success;
        },
      removeColumns:
        () =>
        ({ commands }) => {
          return commands.updateAttributes("paragraph", { columns: null });
        },
    };
  },
});

// Word Counter Mark - For tracking specific word selections
export const WordCountMark = Mark.create({
  name: "wordCount",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-word-count]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      { ...HTMLAttributes, "data-word-count": "true", class: "word-count-mark" },
      0,
    ];
  },
});

// Print Styles Extension - Handles print-specific formatting
export interface PrintStylesOptions {
  pageSize: "letter" | "a4" | "legal";
  orientation: "portrait" | "landscape";
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  headerText?: string;
  footerText?: string;
  showPageNumbers: boolean;
}

export const PrintStyles = Extension.create<PrintStylesOptions>({
  name: "printStyles",

  addOptions() {
    return {
      pageSize: "letter",
      orientation: "portrait",
      margins: {
        top: "1in",
        right: "1in",
        bottom: "1in",
        left: "1in",
      },
      headerText: undefined,
      footerText: undefined,
      showPageNumbers: true,
    };
  },

  addStorage() {
    return {
      updateStyles: () => {
        const styleId = "tiptap-print-styles";
        let styleEl = document.getElementById(styleId);

        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }

        const { pageSize, orientation, margins, showPageNumbers } = this.options;

        const sizes: Record<string, { width: string; height: string }> = {
          letter: { width: "8.5in", height: "11in" },
          a4: { width: "210mm", height: "297mm" },
          legal: { width: "8.5in", height: "14in" },
        };

        const size = sizes[pageSize] || sizes.letter;
        const width = orientation === "portrait" ? size.width : size.height;
        const height = orientation === "portrait" ? size.height : size.width;

        styleEl.textContent = `
          @media print {
            @page {
              size: ${width} ${height};
              margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
            }

            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            ${showPageNumbers ? `
            @page {
              @bottom-center {
                content: counter(page);
              }
            }
            ` : ""}
          }
        `;
      },
    };
  },

  onCreate() {
    this.storage.updateStyles();
  },

  addCommands() {
    return {
      setPrintOptions:
        (options: Partial<PrintStylesOptions>) =>
        () => {
          Object.assign(this.options, options);
          this.storage.updateStyles();
          return true;
        },
    } as any;
  },
});

// CSS for these extensions
export const typographyExtensionsCSS = `
/* Drop Cap Styles */
.drop-cap-paragraph::first-letter {
  float: left;
  font-size: var(--drop-cap-size, 3.5em);
  line-height: 0.8;
  margin-right: 0.1em;
  margin-bottom: -0.1em;
  font-family: var(--drop-cap-font, inherit);
  color: var(--drop-cap-color, inherit);
  font-weight: bold;
}

/* Column Layout Styles */
[data-columns] {
  column-rule: 1px solid #e5e5e5;
}

[data-columns="2"] {
  column-count: 2;
}

[data-columns="3"] {
  column-count: 3;
}

[data-columns="4"] {
  column-count: 4;
}

/* Word Count Mark */
.word-count-mark {
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 2px solid rgba(59, 130, 246, 0.5);
}

/* Print Styles */
@media print {
  .drop-cap-paragraph::first-letter {
    font-size: var(--drop-cap-size, 3em);
  }

  [data-columns] {
    column-rule: 1px solid #ccc;
  }
}
`;
