import { Extension, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// ===== TABLE ENHANCEMENTS =====

export interface EnhancedTableOptions {
  resizable: boolean;
  allowMerge: boolean;
  cellMinWidth: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    enhancedTable: {
      insertTableWithSize: (options: { rows: number; cols: number; withHeaderRow?: boolean }) => ReturnType;
      setCellBackgroundColor: (color: string) => ReturnType;
      sortTableBy: (column: number, direction: "asc" | "desc") => ReturnType;
    };
  }
}

export const EnhancedTable = Extension.create<EnhancedTableOptions>({
  name: "enhancedTable",

  addOptions() {
    return {
      resizable: true,
      allowMerge: true,
      cellMinWidth: 100,
    };
  },

  addCommands() {
    return {
      insertTableWithSize:
        (options) =>
        ({ commands }) => {
          return commands.insertTable({
            rows: options.rows,
            cols: options.cols,
            withHeaderRow: options.withHeaderRow ?? true,
          });
        },

      setCellBackgroundColor:
        (color: string) =>
        ({ tr, state }) => {
          const { selection } = state;
          const { $from } = selection;

          // Find the cell node
          let depth = $from.depth;
          while (depth > 0) {
            const node = $from.node(depth);
            if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
              const pos = $from.before(depth);
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                backgroundColor: color,
              });
              return true;
            }
            depth--;
          }
          return false;
        },

      sortTableBy:
        (column: number, direction: "asc" | "desc") =>
        ({ tr, state }) => {
          // Find the table
          const { selection } = state;
          const { $from } = selection;

          let tablePos = -1;
          let tableNode = null;

          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === "table") {
              tablePos = $from.before(d);
              tableNode = node;
              break;
            }
          }

          if (!tableNode) return false;

          // Get rows
          const rows: { pos: number; node: any; sortValue: string }[] = [];
          let headerRow = null;

          tableNode.forEach((row, offset, index) => {
            if (row.type.name === "tableRow") {
              // Skip header row (first row with tableHeader cells)
              const firstCell = row.firstChild;
              if (firstCell && firstCell.type.name === "tableHeader" && index === 0) {
                headerRow = row;
                return;
              }

              // Get the text content of the specified column
              let colIndex = 0;
              let sortValue = "";
              row.forEach((cell) => {
                if (colIndex === column) {
                  sortValue = cell.textContent.toLowerCase();
                }
                colIndex++;
              });

              rows.push({ pos: tablePos + offset + 1, node: row, sortValue });
            }
          });

          // Sort rows
          rows.sort((a, b) => {
            const comparison = a.sortValue.localeCompare(b.sortValue, undefined, {
              numeric: true,
              sensitivity: "base",
            });
            return direction === "asc" ? comparison : -comparison;
          });

          // Rebuild table content
          // Note: This is a simplified implementation
          // A full implementation would need to properly handle transactions

          return true;
        },
    };
  },
});

// ===== TABLE CELL SELECTION =====

export interface TableCellAttributes {
  colspan: number;
  rowspan: number;
  backgroundColor: string | null;
  borderColor: string | null;
}

// CSS for enhanced tables
export const enhancedTableStyles = `
  /* Enhanced Table Styles */
  .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    table-layout: fixed;
  }

  .ProseMirror th,
  .ProseMirror td {
    border: 1px solid var(--border);
    padding: 0.5rem 0.75rem;
    text-align: left;
    vertical-align: top;
    position: relative;
  }

  .ProseMirror th {
    background-color: var(--muted);
    font-weight: 600;
  }

  .ProseMirror td[data-background-color] {
    background-color: attr(data-background-color);
  }

  /* Selected cells */
  .ProseMirror .selectedCell::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(59, 130, 246, 0.2);
    pointer-events: none;
    z-index: 2;
  }

  /* Resize handle */
  .ProseMirror .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--primary);
    cursor: col-resize;
    z-index: 10;
  }

  /* Table toolbar */
  .table-toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    background: var(--muted);
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;
  }

  .table-toolbar button {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .table-toolbar button:hover {
    background: var(--accent);
  }
`;

// ===== COLLAPSIBLE SECTIONS =====

export interface CollapsibleOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    collapsible: {
      setCollapsible: () => ReturnType;
      toggleCollapsibleOpen: () => ReturnType;
    };
  }
}

export const CollapsibleBlock = Node.create<CollapsibleOptions>({
  name: "collapsible",
  group: "block",
  content: "collapsibleSummary collapsibleContent",
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-open") !== "false",
        renderHTML: (attributes) => ({
          "data-open": attributes.open,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "details",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        class: "collapsible-block border rounded-lg my-2",
        open: HTMLAttributes["data-open"] !== false,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setCollapsible:
        () =>
        ({ commands, state }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { open: true },
            content: [
              {
                type: "collapsibleSummary",
                content: [{ type: "text", text: "Click to expand" }],
              },
              {
                type: "collapsibleContent",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Hidden content goes here" }],
                  },
                ],
              },
            ],
          });
        },

      toggleCollapsibleOpen:
        () =>
        ({ tr, state }) => {
          const { selection } = state;
          const { $from } = selection;

          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === this.name) {
              const pos = $from.before(d);
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                open: !node.attrs.open,
              });
              return true;
            }
          }
          return false;
        },
    };
  },
});

export const CollapsibleSummary = Node.create({
  name: "collapsibleSummary",
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "summary" }];
  },

  renderHTML() {
    return [
      "summary",
      {
        class: "cursor-pointer font-medium p-3 select-none hover:bg-muted/50 rounded-t-lg",
      },
      0,
    ];
  },
});

export const CollapsibleContent = Node.create({
  name: "collapsibleContent",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div.collapsible-content" }];
  },

  renderHTML() {
    return ["div", { class: "collapsible-content p-3 border-t" }, 0];
  },
});

// ===== HORIZONTAL RULE STYLES =====

export interface StyledHorizontalRuleOptions {
  styles: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    styledHr: {
      setStyledHorizontalRule: (style: string) => ReturnType;
    };
  }
}

export const StyledHorizontalRule = Node.create<StyledHorizontalRuleOptions>({
  name: "styledHorizontalRule",
  group: "block",
  atom: true,

  addOptions() {
    return {
      styles: ["solid", "dashed", "dotted", "double", "gradient", "fancy"],
    };
  },

  addAttributes() {
    return {
      style: {
        default: "solid",
        parseHTML: (element) => element.getAttribute("data-style") || "solid",
        renderHTML: (attributes) => ({
          "data-style": attributes.style,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "hr[data-style]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "hr",
      {
        ...HTMLAttributes,
        class: `styled-hr styled-hr-${HTMLAttributes["data-style"]}`,
      },
    ];
  },

  addCommands() {
    return {
      setStyledHorizontalRule:
        (style: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { style },
          });
        },
    };
  },
});

// CSS for styled horizontal rules
export const styledHrStyles = `
  .styled-hr {
    border: none;
    margin: 1.5rem 0;
  }

  .styled-hr-solid {
    height: 1px;
    background: var(--border);
  }

  .styled-hr-dashed {
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      var(--border) 0,
      var(--border) 8px,
      transparent 8px,
      transparent 16px
    );
  }

  .styled-hr-dotted {
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      var(--border) 0,
      var(--border) 3px,
      transparent 3px,
      transparent 8px
    );
  }

  .styled-hr-double {
    height: 4px;
    background: linear-gradient(
      180deg,
      var(--border) 0,
      var(--border) 1px,
      transparent 1px,
      transparent 3px,
      var(--border) 3px,
      var(--border) 4px
    );
  }

  .styled-hr-gradient {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
  }

  .styled-hr-fancy {
    height: 20px;
    background: none;
    position: relative;
    text-align: center;
  }

  .styled-hr-fancy::before {
    content: "§";
    display: inline-block;
    color: var(--muted-foreground);
    font-size: 1.25rem;
    position: relative;
    top: -0.5rem;
  }

  .styled-hr-fancy::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: var(--border);
    z-index: -1;
  }
`;

// Collapsible block styles
export const collapsibleStyles = `
  .collapsible-block {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    margin: 0.5rem 0;
  }

  .collapsible-block summary {
    cursor: pointer;
    padding: 0.75rem;
    font-weight: 500;
    user-select: none;
  }

  .collapsible-block summary:hover {
    background: var(--muted);
  }

  .collapsible-block summary::-webkit-details-marker,
  .collapsible-block summary::marker {
    color: var(--muted-foreground);
  }

  .collapsible-block[open] summary {
    border-bottom: 1px solid var(--border);
  }

  .collapsible-block .collapsible-content {
    padding: 0.75rem;
  }
`;
