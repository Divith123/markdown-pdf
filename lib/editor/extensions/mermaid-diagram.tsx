import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import mermaid from "mermaid";

// Initialize Mermaid
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "sans-serif",
  });
}

export interface MermaidOptions {
  HTMLAttributes: Record<string, unknown>;
  defaultTheme: "default" | "dark" | "forest" | "neutral";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaid: {
      insertMermaidDiagram: (code: string) => ReturnType;
      updateMermaidDiagram: (code: string) => ReturnType;
    };
  }
}

export const MermaidDiagram = Node.create<MermaidOptions>({
  name: "mermaidDiagram",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      defaultTheme: "default",
    };
  },

  addAttributes() {
    return {
      code: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-code"),
        renderHTML: (attributes) => ({
          "data-code": attributes.code,
        }),
      },
      theme: {
        default: "default",
        parseHTML: (element) => element.getAttribute("data-theme"),
        renderHTML: (attributes) => ({
          "data-theme": attributes.theme,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid-diagram"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "mermaid-diagram",
        class: "mermaid-diagram",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidView);
  },

  addCommands() {
    return {
      insertMermaidDiagram:
        (code: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { code },
          });
        },
      updateMermaidDiagram:
        (code: string) =>
        ({ tr, state }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);
          if (node?.type.name === this.name) {
            tr.setNodeMarkup(selection.from, undefined, {
              ...node.attrs,
              code,
            });
            return true;
          }
          return false;
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /```mermaid\n([\s\S]*?)```$/,
        type: this.type,
        getAttributes: (match) => ({
          code: match[1].trim(),
        }),
      }),
    ];
  },
});

// React component for Mermaid diagrams
function MermaidView({ node, updateAttributes, selected }: any) {
  const [isEditing, setIsEditing] = useState(!node.attrs.code);
  const [code, setCode] = useState(node.attrs.code || "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvg("");
      setError(null);
      return;
    }

    try {
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvg(svg);
      setError(null);
    } catch (e: any) {
      console.error("Mermaid error:", e);
      setError(e.message || "Invalid diagram syntax");
      setSvg("");
    }
  }, [code]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateAttributes({ code });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === "Escape") {
      setCode(node.attrs.code);
      setIsEditing(false);
    }
  };

  const applyTemplate = (template: string) => {
    setCode(template);
  };

  return (
    <NodeViewWrapper className="mermaid-wrapper" data-selected={selected}>
      {isEditing ? (
        <div className="mermaid-editor">
          <div className="mermaid-editor-header">
            <span className="mermaid-label">Mermaid Diagram</span>
            <div className="mermaid-templates">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="mermaid-template-select"
              >
                <option value="">Templates...</option>
                <optgroup label="Flowcharts">
                  <option value={diagramTemplates.flowchartLR}>Flowchart (LR)</option>
                  <option value={diagramTemplates.flowchartTD}>Flowchart (TD)</option>
                </optgroup>
                <optgroup label="Sequence">
                  <option value={diagramTemplates.sequence}>Sequence Diagram</option>
                </optgroup>
                <optgroup label="Class">
                  <option value={diagramTemplates.classDiagram}>Class Diagram</option>
                </optgroup>
                <optgroup label="State">
                  <option value={diagramTemplates.stateDiagram}>State Diagram</option>
                </optgroup>
                <optgroup label="ER">
                  <option value={diagramTemplates.erDiagram}>ER Diagram</option>
                </optgroup>
                <optgroup label="Gantt">
                  <option value={diagramTemplates.gantt}>Gantt Chart</option>
                </optgroup>
                <optgroup label="Pie">
                  <option value={diagramTemplates.pie}>Pie Chart</option>
                </optgroup>
                <optgroup label="Git">
                  <option value={diagramTemplates.gitGraph}>Git Graph</option>
                </optgroup>
                <optgroup label="Mind Map">
                  <option value={diagramTemplates.mindmap}>Mind Map</option>
                </optgroup>
              </select>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="mermaid-textarea"
            placeholder="Enter Mermaid diagram code..."
            rows={8}
          />
          <div className="mermaid-preview">
            <span className="preview-label">Preview (Ctrl+Enter to save)</span>
            {error ? (
              <div className="mermaid-error">{error}</div>
            ) : svg ? (
              <div
                ref={containerRef}
                className="mermaid-svg-container"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <div className="mermaid-placeholder">Enter diagram code above</div>
            )}
          </div>
          <div className="mermaid-actions">
            <button onClick={() => setIsEditing(false)} className="mermaid-cancel">
              Cancel
            </button>
            <button onClick={handleSave} className="mermaid-save">
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`mermaid-display ${selected ? "selected" : ""}`}
          onClick={() => setIsEditing(true)}
        >
          {error ? (
            <div className="mermaid-error">{error}</div>
          ) : svg ? (
            <div
              ref={containerRef}
              className="mermaid-svg-container"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="mermaid-placeholder">Click to add diagram</div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

// Diagram templates
const diagramTemplates = {
  flowchartLR: `graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,

  flowchartTD: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`,

  sequence: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!
    A->>B: How are you?
    B-->>A: I'm good, thanks!`,

  classDiagram: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }`,

  stateDiagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Start
    Processing --> Success : Done
    Processing --> Error : Fail
    Error --> Idle : Retry
    Success --> [*]`,

  erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date orderDate
    }
    LINE-ITEM {
        int quantity
        float price
    }`,

  gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Research       :a1, 2024-01-01, 7d
    Design         :a2, after a1, 10d
    section Development
    Backend        :b1, after a2, 14d
    Frontend       :b2, after a2, 14d
    section Testing
    Testing        :c1, after b1, 7d`,

  pie: `pie showData
    title Distribution
    "Category A" : 40
    "Category B" : 30
    "Category C" : 20
    "Category D" : 10`,

  gitGraph: `gitGraph
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit`,

  mindmap: `mindmap
    root((Central Topic))
        Topic 1
            Subtopic 1.1
            Subtopic 1.2
        Topic 2
            Subtopic 2.1
            Subtopic 2.2
        Topic 3
            Subtopic 3.1`,
};

export { diagramTemplates };

// CSS for Mermaid diagrams
export const mermaidCSS = `
.mermaid-wrapper {
  margin: 1em 0;
}

.mermaid-wrapper[data-selected="true"] {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
}

.mermaid-editor {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.mermaid-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 0.75em;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

.mermaid-label {
  font-size: 0.8em;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mermaid-template-select {
  font-size: 0.85em;
  padding: 0.25em 0.5em;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.mermaid-textarea {
  width: 100%;
  padding: 0.75em;
  font-family: monospace;
  font-size: 0.9em;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  resize: vertical;
  min-height: 120px;
}

.mermaid-textarea:focus {
  outline: none;
}

.mermaid-preview {
  padding: 1em;
  background: #fafafa;
  min-height: 100px;
}

.mermaid-preview .preview-label {
  display: block;
  font-size: 0.75em;
  color: #666;
  margin-bottom: 0.75em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mermaid-svg-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.mermaid-svg-container svg {
  max-width: 100%;
  height: auto;
}

.mermaid-display {
  padding: 1.5em;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  border: 1px dashed transparent;
  transition: all 0.2s;
  background: #fafafa;
}

.mermaid-display:hover {
  background: #f0f0f0;
  border-color: #ddd;
}

.mermaid-display.selected {
  border-color: rgba(59, 130, 246, 0.5);
}

.mermaid-placeholder {
  color: #999;
  font-style: italic;
  padding: 2em;
}

.mermaid-error {
  color: #cc0000;
  font-family: monospace;
  font-size: 0.9em;
  padding: 1em;
  background: rgba(204, 0, 0, 0.05);
  border-radius: 4px;
  white-space: pre-wrap;
}

.mermaid-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5em;
  padding: 0.75em;
  border-top: 1px solid #e5e5e5;
  background: #f5f5f5;
}

.mermaid-cancel,
.mermaid-save {
  padding: 0.4em 1em;
  font-size: 0.85em;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.mermaid-cancel {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.mermaid-cancel:hover {
  background: #f5f5f5;
}

.mermaid-save {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.mermaid-save:hover {
  background: #2563eb;
}

@media print {
  .mermaid-editor {
    display: none;
  }

  .mermaid-display {
    padding: 0;
    background: transparent;
    border: none;
  }
}
`;
