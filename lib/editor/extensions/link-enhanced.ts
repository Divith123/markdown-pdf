import Link from "@tiptap/extension-link";
import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    linkEnhanced: {
      setLinkWithTitle: (attrs: { href: string; title?: string; target?: string }) => ReturnType;
    };
  }
}

export const LinkEnhanced = Link.extend({
  addOptions() {
    return {
      openOnClick: false,
      linkOnPaste: true,
      autolink: true,
      defaultProtocol: "https",
      enableClickSelection: true,
      protocols: ["http", "https", "mailto", "tel"],
      HTMLAttributes: {
        class: "text-primary underline underline-offset-2 hover:text-primary/80 transition-colors",
        rel: "noopener noreferrer nofollow",
      },
      validate: (url: string) => true,
      isAllowedUri: (url: string) => true,
      shouldAutoLink: (url: string) => true,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return { title: attributes.title };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setLinkWithTitle:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .setMark("link", attrs)
            .run();
        },
    };
  },

  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];

    // Add click handler for opening links
    plugins.push(
      new Plugin({
        key: new PluginKey("linkClickHandler"),
        props: {
          handleClick: (view, pos, event) => {
            const link = (event.target as HTMLElement).closest("a");
            if (link && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              window.open(link.href, "_blank", "noopener,noreferrer");
              return true;
            }
            return false;
          },
        },
      })
    );

    return plugins;
  },
});

// Anchor/Bookmark Extension for internal links

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    anchor: {
      setAnchor: (id: string) => ReturnType;
      unsetAnchor: () => ReturnType;
    };
  }
}

export const Anchor = Mark.create({
  name: "anchor",

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return { id: attributes.id };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[id]",
        getAttrs: (element) => ({
          id: (element as HTMLElement).getAttribute("id"),
        }),
      },
      {
        tag: "span[id]",
        getAttrs: (element) => ({
          id: (element as HTMLElement).getAttribute("id"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "anchor-mark",
        "data-anchor": "",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAnchor:
        (id: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { id });
        },
      unsetAnchor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

// Helper to validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check for relative URLs or anchor links
    return url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:");
  }
}

// Helper to ensure protocol
export function ensureProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://") || 
      url.startsWith("mailto:") || url.startsWith("tel:") ||
      url.startsWith("/") || url.startsWith("#")) {
    return url;
  }
  return `https://${url}`;
}
