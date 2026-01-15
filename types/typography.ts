export interface FontConfig {
  family: string;
  weight: number;
  style: "normal" | "italic";
  source: "google" | "custom" | "system";
  url?: string;
}

export interface TypographySettings {
  baseFontSize: number;
  baseLineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  
  headingFont: FontConfig;
  bodyFont: FontConfig;
  codeFont: FontConfig;
  
  headingSizes: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  
  headingLineHeights: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
}

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
}

export interface FontVariant {
  weight: number;
  style: "normal" | "italic";
}

export const defaultTypography: TypographySettings = {
  baseFontSize: 16,
  baseLineHeight: 1.6,
  letterSpacing: 0,
  paragraphSpacing: 1.5,
  
  headingFont: {
    family: "Inter",
    weight: 600,
    style: "normal",
    source: "google",
  },
  
  bodyFont: {
    family: "Inter",
    weight: 400,
    style: "normal",
    source: "google",
  },
  
  codeFont: {
    family: "JetBrains Mono",
    weight: 400,
    style: "normal",
    source: "google",
  },
  
  headingSizes: {
    h1: 2.5,
    h2: 2,
    h3: 1.75,
    h4: 1.5,
    h5: 1.25,
    h6: 1,
  },
  
  headingLineHeights: {
    h1: 1.2,
    h2: 1.25,
    h3: 1.3,
    h4: 1.35,
    h5: 1.4,
    h6: 1.45,
  },
};

// Font weight type
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

// Font weight labels
export const fontWeightLabels: Record<FontWeight, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

// Available fonts
export interface AvailableFont {
  family: string;
  name: string;
  category: "serif" | "sans-serif" | "monospace" | "display";
}

export const availableFonts: AvailableFont[] = [
  { family: "Inter", name: "Inter", category: "sans-serif" },
  { family: "Merriweather", name: "Merriweather", category: "serif" },
  { family: "Roboto", name: "Roboto", category: "sans-serif" },
  { family: "Playfair Display", name: "Playfair", category: "serif" },
  { family: "JetBrains Mono", name: "JetBrains Mono", category: "monospace" },
  { family: "Manrope", name: "Manrope", category: "sans-serif" },
  { family: "Georgia", name: "Georgia", category: "serif" },
  { family: "system-ui", name: "System", category: "sans-serif" },
];
