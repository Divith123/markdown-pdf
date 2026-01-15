import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutType = "info" | "warning" | "tip" | "danger";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type: CalloutType) => ReturnType;
      toggleCallout: (type: CalloutType) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-callout-type") || "info",
        renderHTML: (attributes) => ({
          "data-callout-type": attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type as CalloutType;
    
    const typeStyles: Record<CalloutType, string> = {
      info: "border-blue-500 bg-blue-50 dark:bg-blue-950",
      warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
      tip: "border-green-500 bg-green-50 dark:bg-green-950",
      danger: "border-red-500 bg-red-50 dark:bg-red-950",
    };

    const typeIcons: Record<CalloutType, string> = {
      info: "ℹ️",
      warning: "⚠️",
      tip: "💡",
      danger: "🚨",
    };

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-callout": "",
        class: `callout callout-${type} border-l-4 p-4 my-4 rounded-r ${typeStyles[type]}`,
      }),
      [
        "div",
        { class: "callout-icon inline-block mr-2" },
        typeIcons[type],
      ],
      [
        "div",
        { class: "callout-content inline" },
        0,
      ],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (type: CalloutType) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { type });
        },
      toggleCallout:
        (type: CalloutType) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => this.editor.commands.toggleCallout("info"),
    };
  },
});
