import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYoutubeVideo: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
    video: {
      setVideo: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
    audio: {
      setAudio: (options: { src: string }) => ReturnType;
    };
  }
}

// YouTube Embed Node
export const Youtube = Node.create({
  name: "youtube",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 640,
      },
      height: {
        default: 360,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-youtube-video]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = extractYoutubeId(HTMLAttributes.src);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return [
      "div",
      mergeAttributes({
        "data-youtube-video": "",
        class: "youtube-embed my-4 flex justify-center",
      }),
      [
        "iframe",
        {
          src: embedUrl,
          width: HTMLAttributes.width,
          height: HTMLAttributes.height,
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
          class: "rounded-lg shadow-lg",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Generic Video Node
export const Video = Node.create({
  name: "video",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "video-embed my-4" },
      [
        "video",
        mergeAttributes(HTMLAttributes, {
          controls: "true",
          class: "w-full rounded-lg shadow-lg",
        }),
        [
          "source",
          {
            src: HTMLAttributes.src,
            type: "video/mp4",
          },
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Audio Node
export const Audio = Node.create({
  name: "audio",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "audio",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "audio-embed my-4 p-4 bg-muted rounded-lg" },
      [
        "audio",
        mergeAttributes(HTMLAttributes, {
          controls: "true",
          class: "w-full",
        }),
        [
          "source",
          {
            src: HTMLAttributes.src,
          },
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Helper to extract YouTube video ID
function extractYoutubeId(url: string): string {
  if (!url) return "";
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return url;
}

export function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
}

export function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/.test(url);
}
