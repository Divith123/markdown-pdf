import { Extension } from "@tiptap/core";

export interface FocusModeOptions {
  enabled: boolean;
  className: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    focusMode: {
      setFocusMode: (enabled: boolean) => ReturnType;
      toggleFocusMode: () => ReturnType;
    };
  }
}

export const FocusMode = Extension.create<FocusModeOptions>({
  name: "focusMode",

  addOptions() {
    return {
      enabled: false,
      className: "focus-mode",
    };
  },

  addStorage() {
    return {
      enabled: false,
    };
  },

  addCommands() {
    return {
      setFocusMode:
        (enabled: boolean) =>
        ({ editor }) => {
          this.storage.enabled = enabled;
          
          const editorElement = editor.view.dom.closest(".ProseMirror");
          const wrapper = editorElement?.closest(".editor-wrapper");

          if (enabled) {
            wrapper?.classList.add(this.options.className);
            document.body.classList.add("focus-mode-active");
          } else {
            wrapper?.classList.remove(this.options.className);
            document.body.classList.remove("focus-mode-active");
          }

          return true;
        },

      toggleFocusMode:
        () =>
        ({ commands }) => {
          return commands.setFocusMode(!this.storage.enabled);
        },
    };
  },
});

// CSS for focus mode (to be added to globals.css)
export const focusModeStyles = `
  /* Focus Mode Styles */
  body.focus-mode-active {
    overflow: hidden;
  }

  body.focus-mode-active .editor-wrapper.focus-mode {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--background);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  body.focus-mode-active .editor-wrapper.focus-mode .ProseMirror {
    max-width: 720px;
    width: 100%;
    min-height: 100%;
    padding: 4rem 2rem;
  }

  body.focus-mode-active .editor-wrapper.focus-mode .editor-toolbar,
  body.focus-mode-active .editor-wrapper.focus-mode .editor-sidebar,
  body.focus-mode-active .editor-wrapper.focus-mode .status-bar {
    display: none;
  }
`;

export interface TypewriterModeOptions {
  enabled: boolean;
  scrollMargin: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    typewriterMode: {
      setTypewriterMode: (enabled: boolean) => ReturnType;
      toggleTypewriterMode: () => ReturnType;
    };
  }
}

export const TypewriterMode = Extension.create<TypewriterModeOptions>({
  name: "typewriterMode",

  addOptions() {
    return {
      enabled: false,
      scrollMargin: 0.4, // 40% from top
    };
  },

  addStorage() {
    return {
      enabled: false,
    };
  },

  addCommands() {
    return {
      setTypewriterMode:
        (enabled: boolean) =>
        ({ editor }) => {
          this.storage.enabled = enabled;
          
          if (enabled) {
            document.body.classList.add("typewriter-mode-active");
          } else {
            document.body.classList.remove("typewriter-mode-active");
          }

          return true;
        },

      toggleTypewriterMode:
        () =>
        ({ commands }) => {
          return commands.setTypewriterMode(!this.storage.enabled);
        },
    };
  },

  onSelectionUpdate() {
    if (!this.storage.enabled) return;

    const { view } = this.editor;
    const { selection } = view.state;
    const { from } = selection;

    const coords = view.coordsAtPos(from);
    const editorRect = view.dom.getBoundingClientRect();
    
    // Calculate target position (40% from top)
    const targetY = editorRect.top + editorRect.height * this.options.scrollMargin;
    const diff = coords.top - targetY;

    if (Math.abs(diff) > 10) {
      const container = view.dom.closest(".editor-scroll-container") || window;
      if (container === window) {
        window.scrollBy({ top: diff, behavior: "smooth" });
      } else {
        (container as HTMLElement).scrollBy({ top: diff, behavior: "smooth" });
      }
    }
  },
});

// CSS for typewriter mode
export const typewriterModeStyles = `
  /* Typewriter Mode - Keep cursor centered */
  body.typewriter-mode-active .ProseMirror {
    padding-top: 40vh;
    padding-bottom: 40vh;
  }

  body.typewriter-mode-active .ProseMirror p,
  body.typewriter-mode-active .ProseMirror h1,
  body.typewriter-mode-active .ProseMirror h2,
  body.typewriter-mode-active .ProseMirror h3,
  body.typewriter-mode-active .ProseMirror h4,
  body.typewriter-mode-active .ProseMirror h5,
  body.typewriter-mode-active .ProseMirror h6 {
    transition: opacity 0.2s ease;
  }

  /* Dim non-active paragraphs in typewriter mode */
  body.typewriter-mode-active.typewriter-dim .ProseMirror > *:not(.is-active) {
    opacity: 0.3;
  }
`;

export interface ReadingModeOptions {
  mode: "light" | "sepia" | "dark" | "night";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    readingMode: {
      setReadingMode: (mode: "light" | "sepia" | "dark" | "night") => ReturnType;
    };
  }
}

export const ReadingMode = Extension.create<ReadingModeOptions>({
  name: "readingMode",

  addOptions() {
    return {
      mode: "light",
    };
  },

  addStorage() {
    return {
      mode: "light",
    };
  },

  addCommands() {
    return {
      setReadingMode:
        (mode) =>
        ({ editor }) => {
          this.storage.mode = mode;
          
          // Remove all reading mode classes
          document.body.classList.remove(
            "reading-mode-light",
            "reading-mode-sepia",
            "reading-mode-dark",
            "reading-mode-night"
          );
          
          // Add the selected mode class
          document.body.classList.add(`reading-mode-${mode}`);

          return true;
        },
    };
  },
});

// CSS for reading modes
export const readingModeStyles = `
  /* Reading Mode Styles */
  
  /* Light Mode (default) */
  body.reading-mode-light .editor-wrapper {
    --reading-bg: #ffffff;
    --reading-text: #1a1a1a;
    --reading-accent: #3b82f6;
  }

  /* Sepia Mode - Warm tones for reduced eye strain */
  body.reading-mode-sepia .editor-wrapper {
    --reading-bg: #f4ecd8;
    --reading-text: #5c4b37;
    --reading-accent: #8b6914;
    background-color: var(--reading-bg);
    color: var(--reading-text);
  }

  body.reading-mode-sepia .ProseMirror {
    background-color: var(--reading-bg);
    color: var(--reading-text);
  }

  body.reading-mode-sepia .ProseMirror a {
    color: var(--reading-accent);
  }

  /* Dark Mode */
  body.reading-mode-dark .editor-wrapper {
    --reading-bg: #1a1a1a;
    --reading-text: #e5e5e5;
    --reading-accent: #60a5fa;
    background-color: var(--reading-bg);
    color: var(--reading-text);
  }

  body.reading-mode-dark .ProseMirror {
    background-color: var(--reading-bg);
    color: var(--reading-text);
  }

  body.reading-mode-dark .ProseMirror a {
    color: var(--reading-accent);
  }

  /* Night Mode - Very dark with reduced blue light */
  body.reading-mode-night .editor-wrapper {
    --reading-bg: #0a0a0a;
    --reading-text: #b8b8a0;
    --reading-accent: #d4a574;
    background-color: var(--reading-bg);
    color: var(--reading-text);
    filter: saturate(0.9) brightness(0.95);
  }

  body.reading-mode-night .ProseMirror {
    background-color: var(--reading-bg);
    color: var(--reading-text);
  }

  body.reading-mode-night .ProseMirror a {
    color: var(--reading-accent);
  }

  /* Common reading mode enhancements */
  body[class*="reading-mode-"] .ProseMirror {
    line-height: 1.8;
    font-size: 1.1rem;
    letter-spacing: 0.01em;
  }
`;
