import { Extension } from "@tiptap/core";
import { Mark, mergeAttributes } from "@tiptap/core";

// Subscript Mark
export const Subscript = Mark.create({
  name: "subscript",

  parseHTML() {
    return [
      { tag: "sub" },
      {
        style: "vertical-align",
        getAttrs: (value) => (value === "sub" ? {} : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sub", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSubscript:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSubscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSubscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-,": () => this.editor.commands.toggleSubscript(),
    };
  },
});

// Superscript Mark
export const Superscript = Mark.create({
  name: "superscript",

  parseHTML() {
    return [
      { tag: "sup" },
      {
        style: "vertical-align",
        getAttrs: (value) => (value === "super" ? {} : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSuperscript:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSuperscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSuperscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-.": () => this.editor.commands.toggleSuperscript(),
    };
  },
});

// Small Caps Mark
export const SmallCaps = Mark.create({
  name: "smallCaps",

  parseHTML() {
    return [
      {
        style: "font-variant",
        getAttrs: (value) => (value === "small-caps" ? {} : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        style: "font-variant: small-caps",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setSmallCaps:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSmallCaps:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSmallCaps:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

// Text Transform Commands Extension
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textTransform: {
      setUppercase: () => ReturnType;
      setLowercase: () => ReturnType;
      setTitleCase: () => ReturnType;
      setSentenceCase: () => ReturnType;
      setToggleCase: () => ReturnType;
    };
    subscript: {
      setSubscript: () => ReturnType;
      toggleSubscript: () => ReturnType;
      unsetSubscript: () => ReturnType;
    };
    superscript: {
      setSuperscript: () => ReturnType;
      toggleSuperscript: () => ReturnType;
      unsetSuperscript: () => ReturnType;
    };
    smallCaps: {
      setSmallCaps: () => ReturnType;
      toggleSmallCaps: () => ReturnType;
      unsetSmallCaps: () => ReturnType;
    };
  }
}

export const TextTransform = Extension.create({
  name: "textTransform",

  addCommands() {
    return {
      setUppercase:
        () =>
        ({ editor, state }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          const uppercase = text.toUpperCase();
          
          editor.chain().focus().deleteRange({ from, to }).insertContent(uppercase).run();
          return true;
        },

      setLowercase:
        () =>
        ({ editor, state }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          const lowercase = text.toLowerCase();
          
          editor.chain().focus().deleteRange({ from, to }).insertContent(lowercase).run();
          return true;
        },

      setTitleCase:
        () =>
        ({ editor, state }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          const titleCase = text
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          
          editor.chain().focus().deleteRange({ from, to }).insertContent(titleCase).run();
          return true;
        },

      setSentenceCase:
        () =>
        ({ editor, state }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          const sentenceCase = text
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
          
          editor.chain().focus().deleteRange({ from, to }).insertContent(sentenceCase).run();
          return true;
        },

      setToggleCase:
        () =>
        ({ editor, state }) => {
          const { from, to } = state.selection;
          const text = state.doc.textBetween(from, to);
          
          // Check if mostly uppercase
          const upperCount = (text.match(/[A-Z]/g) || []).length;
          const lowerCount = (text.match(/[a-z]/g) || []).length;
          
          const toggled = upperCount > lowerCount ? text.toLowerCase() : text.toUpperCase();
          
          editor.chain().focus().deleteRange({ from, to }).insertContent(toggled).run();
          return true;
        },
    };
  },
});
