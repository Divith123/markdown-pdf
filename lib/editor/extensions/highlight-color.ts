import { Mark, mergeAttributes } from "@tiptap/core";

export interface HighlightColorOptions {
  multicolor: boolean;
  colors: string[];
  defaultColor: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlightColor: {
      setHighlightColor: (color: string) => ReturnType;
      toggleHighlightColor: (color: string) => ReturnType;
      unsetHighlightColor: () => ReturnType;
    };
  }
}

export const HighlightColor = Mark.create<HighlightColorOptions>({
  name: "highlightColor",

  addOptions() {
    return {
      multicolor: true,
      colors: [
        "#fef08a", // Yellow
        "#bbf7d0", // Green
        "#bfdbfe", // Blue
        "#fecaca", // Red
        "#e9d5ff", // Purple
        "#fed7aa", // Orange
        "#f5d0fe", // Pink
        "#ccfbf1", // Teal
      ],
      defaultColor: "#fef08a",
    };
  },

  addAttributes() {
    return {
      color: {
        default: this.options.defaultColor,
        parseHTML: (element) =>
          element.style.backgroundColor || this.options.defaultColor,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `background-color: ${attributes.color}; padding: 0.125em 0;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark",
      },
      {
        style: "background-color",
        getAttrs: (value) => {
          if (typeof value !== "string") return false;
          return { color: value };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHighlightColor:
        (color: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color });
        },
      toggleHighlightColor:
        (color: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { color });
        },
      unsetHighlightColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

// Predefined highlight colors for UI
export const highlightColors = [
  { name: "Yellow", value: "#fef08a", class: "bg-yellow-200" },
  { name: "Green", value: "#bbf7d0", class: "bg-green-200" },
  { name: "Blue", value: "#bfdbfe", class: "bg-blue-200" },
  { name: "Red", value: "#fecaca", class: "bg-red-200" },
  { name: "Purple", value: "#e9d5ff", class: "bg-purple-200" },
  { name: "Orange", value: "#fed7aa", class: "bg-orange-200" },
  { name: "Pink", value: "#f5d0fe", class: "bg-pink-200" },
  { name: "Teal", value: "#ccfbf1", class: "bg-teal-200" },
];

// Predefined text colors for UI
export const textColors = [
  { name: "Default", value: "inherit" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Lime", value: "#84cc16" },
  { name: "Green", value: "#22c55e" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
];
