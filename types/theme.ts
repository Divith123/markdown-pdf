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
    description: "Clean and simple design with minimal distractions",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#1a1a1a",
      primary: "#0066cc",
      secondary: "#f5f5f5",
      accent: "#0066cc",
      muted: "#f9f9f9",
      mutedForeground: "#666666",
      border: "#e5e5e5",
      headingColor: "#1a1a1a",
      bodyColor: "#333333",
      linkColor: "#0066cc",
      codeBackground: "#f5f5f5",
      codeColor: "#d63384",
      blockquoteBorder: "#e5e5e5",
      blockquoteBackground: "#f9f9f9",
    },
  },
  
  academic: {
    id: "academic",
    name: "Academic",
    description: "Traditional academic paper styling with serif fonts",
    isDark: false,
    colors: {
      background: "#fffef9",
      foreground: "#1a1a1a",
      primary: "#8b0000",
      secondary: "#f5f4ef",
      accent: "#8b0000",
      muted: "#f5f4ef",
      mutedForeground: "#555555",
      border: "#d4d3ce",
      headingColor: "#1a1a1a",
      bodyColor: "#2a2a2a",
      linkColor: "#8b0000",
      codeBackground: "#f5f4ef",
      codeColor: "#8b0000",
      blockquoteBorder: "#d4d3ce",
      blockquoteBackground: "#f5f4ef",
    },
  },
  
  magazine: {
    id: "magazine",
    name: "Magazine",
    description: "Bold, modern design inspired by editorial layouts",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#0a0a0a",
      primary: "#ff3366",
      secondary: "#fafafa",
      accent: "#ff3366",
      muted: "#f5f5f5",
      mutedForeground: "#666666",
      border: "#e0e0e0",
      headingColor: "#0a0a0a",
      bodyColor: "#1a1a1a",
      linkColor: "#ff3366",
      codeBackground: "#1a1a1a",
      codeColor: "#ff3366",
      blockquoteBorder: "#ff3366",
      blockquoteBackground: "#fff5f7",
    },
  },
  
  resume: {
    id: "resume",
    name: "Resume",
    description: "Professional resume and CV styling",
    isDark: false,
    colors: {
      background: "#ffffff",
      foreground: "#2c3e50",
      primary: "#2c3e50",
      secondary: "#ecf0f1",
      accent: "#3498db",
      muted: "#f8f9fa",
      mutedForeground: "#7f8c8d",
      border: "#bdc3c7",
      headingColor: "#2c3e50",
      bodyColor: "#34495e",
      linkColor: "#3498db",
      codeBackground: "#ecf0f1",
      codeColor: "#e74c3c",
      blockquoteBorder: "#3498db",
      blockquoteBackground: "#f8f9fa",
    },
  },
};
