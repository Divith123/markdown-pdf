import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setImageSize: (options: { width: number | string; height?: number | string }) => ReturnType;
      setImageAlignment: (alignment: "left" | "center" | "right") => ReturnType;
    };
  }
}

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
}

export const ResizableImage = Image.extend<ResizableImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("width") || element.style.width || "auto",
        renderHTML: (attributes) => {
          if (!attributes.width || attributes.width === "auto") {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("height") || element.style.height || "auto",
        renderHTML: (attributes) => {
          if (!attributes.height || attributes.height === "auto") {
            return {};
          }
          return { height: attributes.height };
        },
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => {
          return { "data-alignment": attributes.alignment };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes["data-alignment"] || "center";
    
    const alignmentClasses: Record<string, string> = {
      left: "mr-auto",
      center: "mx-auto",
      right: "ml-auto",
    };

    return [
      "figure",
      { class: `image-figure my-4 ${alignmentClasses[alignment] || ""}` },
      [
        "img",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: "rounded-lg shadow-md max-w-full h-auto",
          draggable: "true",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageSize:
        (options) =>
        ({ commands, state }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);
          
          if (node?.type.name === "image") {
            return commands.updateAttributes("image", {
              width: options.width,
              height: options.height || "auto",
            });
          }
          return false;
        },
      setImageAlignment:
        (alignment) =>
        ({ commands, state }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);
          
          if (node?.type.name === "image") {
            return commands.updateAttributes("image", { alignment });
          }
          return false;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("imageDropHandler"),
        props: {
          handleDrop: (view, event, slice, moved) => {
            if (moved || !event.dataTransfer?.files.length) {
              return false;
            }

            const files = Array.from(event.dataTransfer.files).filter((file) =>
              file.type.startsWith("image/")
            );

            if (files.length === 0) {
              return false;
            }

            event.preventDefault();

            files.forEach((file) => {
              const reader = new FileReader();
              reader.onload = () => {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });

                if (!coordinates) return;

                const node = schema.nodes.image.create({
                  src: reader.result as string,
                });

                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              };
              reader.readAsDataURL(file);
            });

            return true;
          },
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const imageItems = items.filter((item) => item.type.startsWith("image/"));

            if (imageItems.length === 0) {
              return false;
            }

            event.preventDefault();

            imageItems.forEach((item) => {
              const file = item.getAsFile();
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                const { schema } = view.state;
                const node = schema.nodes.image.create({
                  src: reader.result as string,
                });

                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              };
              reader.readAsDataURL(file);
            });

            return true;
          },
        },
      }),
    ];
  },
});
