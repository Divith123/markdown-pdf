import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from "@tiptap/react";
import { useState, useCallback, useEffect, useRef } from "react";
import katex from "katex";

// KaTeX Math Node for inline and block math equations
export interface MathOptions {
  HTMLAttributes: Record<string, unknown>;
  katexOptions: katex.KatexOptions;
}

// Math Inline Node
export const MathInline = Node.create<MathOptions>({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      katexOptions: {
        throwOnError: false,
        errorColor: "#cc0000",
        strict: false,
        trust: true,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
          "\\Z": "\\mathbb{Z}",
          "\\Q": "\\mathbb{Q}",
          "\\C": "\\mathbb{C}",
        },
      },
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex"),
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "math-inline",
        class: "math-inline",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\$([^$]+)\$$/,
        type: this.type,
        getAttributes: (match) => ({
          latex: match[1],
        }),
      }),
    ];
  },

  addCommands() {
    return {
      insertMathInline:
        (latex: string) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    } as any;
  },
});

// Math Block Node
export const MathBlock = Node.create<MathOptions>({
  name: "mathBlock",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      katexOptions: {
        throwOnError: false,
        errorColor: "#cc0000",
        displayMode: true,
        strict: false,
        trust: true,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
          "\\Z": "\\mathbb{Z}",
          "\\Q": "\\mathbb{Q}",
          "\\C": "\\mathbb{C}",
        },
      },
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex"),
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "math-block",
        class: "math-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\$\$([^$]+)\$\$$/,
        type: this.type,
        getAttributes: (match) => ({
          latex: match[1],
        }),
      }),
    ];
  },

  addCommands() {
    return {
      insertMathBlock:
        (latex: string) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    } as any;
  },
});

// React component for inline math
function MathInlineView({ node, updateAttributes, selected }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const renderMath = useCallback(() => {
    try {
      return katex.renderToString(latex || "\\text{Click to edit}", {
        throwOnError: false,
        errorColor: "#cc0000",
      });
    } catch (e) {
      return `<span class="math-error">${latex}</span>`;
    }
  }, [latex]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateAttributes({ latex });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setLatex(node.attrs.latex);
      setIsEditing(false);
    }
  };

  return (
    <NodeViewWrapper as="span" className="math-inline-wrapper">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="math-inline-input"
          placeholder="LaTeX expression"
        />
      ) : (
        <span
          className={`math-inline-display ${selected ? "selected" : ""}`}
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: renderMath() }}
        />
      )}
    </NodeViewWrapper>
  );
}

// React component for block math
function MathBlockView({ node, updateAttributes, selected }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const renderMath = useCallback(() => {
    try {
      return katex.renderToString(latex || "\\text{Click to add equation}", {
        throwOnError: false,
        errorColor: "#cc0000",
        displayMode: true,
      });
    } catch (e) {
      return `<div class="math-error">${latex}</div>`;
    }
  }, [latex]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateAttributes({ latex });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSave();
    } else if (e.key === "Escape") {
      setLatex(node.attrs.latex);
      setIsEditing(false);
    }
  };

  return (
    <NodeViewWrapper className="math-block-wrapper">
      {isEditing ? (
        <div className="math-block-editor">
          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="math-block-textarea"
            placeholder="LaTeX expression (Cmd+Enter to save)"
            rows={3}
          />
          <div className="math-block-preview">
            <span className="preview-label">Preview:</span>
            <div dangerouslySetInnerHTML={{ __html: renderMath() }} />
          </div>
        </div>
      ) : (
        <div
          className={`math-block-display ${selected ? "selected" : ""}`}
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: renderMath() }}
        />
      )}
    </NodeViewWrapper>
  );
}

// Common math templates
export const mathTemplates = {
  fractions: [
    { name: "Simple Fraction", latex: "\\frac{a}{b}" },
    { name: "Mixed Number", latex: "a\\frac{b}{c}" },
    { name: "Continued Fraction", latex: "\\cfrac{1}{1+\\cfrac{1}{2}}" },
  ],
  roots: [
    { name: "Square Root", latex: "\\sqrt{x}" },
    { name: "Nth Root", latex: "\\sqrt[n]{x}" },
    { name: "Cubic Root", latex: "\\sqrt[3]{x}" },
  ],
  calculus: [
    { name: "Integral", latex: "\\int_{a}^{b} f(x)\\,dx" },
    { name: "Double Integral", latex: "\\iint_{D} f(x,y)\\,dA" },
    { name: "Derivative", latex: "\\frac{d}{dx}f(x)" },
    { name: "Partial Derivative", latex: "\\frac{\\partial f}{\\partial x}" },
    { name: "Limit", latex: "\\lim_{x \\to \\infty} f(x)" },
    { name: "Sum", latex: "\\sum_{i=1}^{n} a_i" },
    { name: "Product", latex: "\\prod_{i=1}^{n} a_i" },
  ],
  matrices: [
    { name: "2x2 Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
    { name: "3x3 Matrix", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
    { name: "Determinant", latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}" },
    { name: "Bracket Matrix", latex: "\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}" },
  ],
  greek: [
    { name: "Alpha, Beta, Gamma", latex: "\\alpha, \\beta, \\gamma" },
    { name: "Pi, Sigma, Omega", latex: "\\pi, \\sigma, \\omega" },
    { name: "Delta, Epsilon, Theta", latex: "\\delta, \\epsilon, \\theta" },
  ],
  relations: [
    { name: "Less/Greater Than", latex: "a < b, a > b" },
    { name: "Less/Greater Equal", latex: "a \\leq b, a \\geq b" },
    { name: "Not Equal", latex: "a \\neq b" },
    { name: "Approximately", latex: "a \\approx b" },
    { name: "Proportional", latex: "a \\propto b" },
  ],
  sets: [
    { name: "Union/Intersection", latex: "A \\cup B, A \\cap B" },
    { name: "Subset", latex: "A \\subset B, A \\subseteq B" },
    { name: "Element Of", latex: "x \\in A, x \\notin A" },
    { name: "Set Builder", latex: "\\{x \\mid x > 0\\}" },
  ],
  physics: [
    { name: "Energy-Mass", latex: "E = mc^2" },
    { name: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" },
    { name: "Pythagorean", latex: "a^2 + b^2 = c^2" },
    { name: "Euler's Identity", latex: "e^{i\\pi} + 1 = 0" },
  ],
};

// CSS for math nodes
export const mathNodeCSS = `
/* Math Inline Styles */
.math-inline-wrapper {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.math-inline-display {
  padding: 0 0.25em;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.math-inline-display:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.math-inline-display.selected {
  background-color: rgba(59, 130, 246, 0.1);
  outline: 2px solid rgba(59, 130, 246, 0.5);
}

.math-inline-input {
  font-family: monospace;
  font-size: 0.9em;
  padding: 0.25em 0.5em;
  border: 1px solid #ccc;
  border-radius: 3px;
  min-width: 100px;
}

/* Math Block Styles */
.math-block-wrapper {
  margin: 1em 0;
}

.math-block-display {
  padding: 1em;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.math-block-display:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.math-block-display.selected {
  background-color: rgba(59, 130, 246, 0.05);
  outline: 2px solid rgba(59, 130, 246, 0.3);
}

.math-block-editor {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.math-block-textarea {
  width: 100%;
  padding: 0.75em;
  font-family: monospace;
  font-size: 0.9em;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  resize: vertical;
  min-height: 60px;
}

.math-block-textarea:focus {
  outline: none;
}

.math-block-preview {
  padding: 1em;
  background: #fafafa;
}

.math-block-preview .preview-label {
  display: block;
  font-size: 0.75em;
  color: #666;
  margin-bottom: 0.5em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.math-error {
  color: #cc0000;
  font-family: monospace;
  font-size: 0.9em;
  padding: 0.25em 0.5em;
  background: rgba(204, 0, 0, 0.1);
  border-radius: 3px;
}

/* KaTeX specific overrides */
.katex-display {
  margin: 0;
  overflow-x: auto;
  overflow-y: hidden;
}
`;
