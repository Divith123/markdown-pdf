export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  mutedForeground: string;
  border: string;
  
  headingColor: string;
  bodyColor: string;
  linkColor: string;
  codeBackground: string;
  codeColor: string;
  blockquoteBorder: string;
  blockquoteBackground: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
}

export type ThemePreset = "minimal" | "academic" | "magazine" | "resume";

export const themePresets: Record<ThemePreset, Theme> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple design with blue accents",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#0f172a",
      primary: "#2563EB",
      secondary: "#eff6ff",
      accent: "#3b82f6",
      muted: "#f8fafc",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      headingColor: "#0f172a",
      bodyColor: "#334155",
      linkColor: "#2563EB",
      codeBackground: "#eff6ff",
      codeColor: "#2563EB",
      blockquoteBorder: "#2563EB",
      blockquoteBackground: "#f8fafc",
    },
  },
  
  academic: {
    id: "academic",
    name: "Academic",
    description: "Traditional academic paper styling",
    isDark: false,
    colors: {
      background: "#fffef9",
      foreground: "#0f172a",
      primary: "#1d4ed8",
      secondary: "#f5f4ef",
      accent: "#1e40af",
      muted: "#f1f5f9",
      mutedForeground: "#475569",
      border: "#e2e8f0",
      headingColor: "#0f172a",
      bodyColor: "#1e293b",
      linkColor: "#1d4ed8",
      codeBackground: "#f1f5f9",
      codeColor: "#1e3a8a",
      blockquoteBorder: "#94a3b8",
      blockquoteBackground: "#f8fafc",
    },
  },
  
  magazine: {
    id: "magazine",
    name: "Magazine",
    description: "Modern editorial style with impact",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      primary: "#2563EB",
      secondary: "#dbeafe",
      accent: "#3b82f6",
      muted: "#f3f4f6",
      mutedForeground: "#6b7280",
      border: "#e5e7eb",
      headingColor: "#111827",
      bodyColor: "#374151",
      linkColor: "#2563EB",
      codeBackground: "#f3f4f6",
      codeColor: "#1d4ed8",
      blockquoteBorder: "#2563EB",
      blockquoteBackground: "#eff6ff",
    },
  },
  
  resume: {
    id: "resume",
    name: "Resume",
    description: "Professional resume and CV styling",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#1e293b",
      primary: "#2563EB",
      secondary: "#eff6ff",
      accent: "#60a5fa",
      muted: "#f8fafc",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      headingColor: "#0f172a",
      bodyColor: "#334155",
      linkColor: "#2563EB",
      codeBackground: "#f1f5f9",
      codeColor: "#0f172a",
      blockquoteBorder: "#cbd5e1",
      blockquoteBackground: "#f8fafc",
    },
  },
};
