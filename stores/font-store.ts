import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontConfig, GoogleFont } from "@/types/typography";

interface CustomFont {
  id: string;
  name: string;
  family: string;
  format: "ttf" | "otf" | "woff" | "woff2";
  url: string;
  variants: Array<{
    weight: number;
    style: "normal" | "italic";
    url: string;
  }>;
  uploadedAt: Date;
}

interface FontStore {
  // Google Fonts cache
  googleFonts: GoogleFont[];
  googleFontsLoaded: boolean;
  googleFontsError: string | null;
  
  // Loaded fonts (currently in DOM)
  loadedFonts: Set<string>;
  
  // Custom uploaded fonts
  customFonts: CustomFont[];
  
  // Recent fonts
  recentFonts: string[];
  
  // Favorite fonts
  favoriteFonts: string[];
  
  // Actions
  setGoogleFonts: (fonts: GoogleFont[]) => void;
  setGoogleFontsLoaded: (loaded: boolean) => void;
  setGoogleFontsError: (error: string | null) => void;
  addLoadedFont: (fontFamily: string) => void;
  addCustomFont: (font: CustomFont) => void;
  removeCustomFont: (id: string) => void;
  addRecentFont: (fontFamily: string) => void;
  toggleFavoriteFont: (fontFamily: string) => void;
}

export const useFontStore = create<FontStore>()(
  persist(
    (set, get) => ({
      // Initial state
      googleFonts: [],
      googleFontsLoaded: false,
      googleFontsError: null,
      loadedFonts: new Set(),
      customFonts: [],
      recentFonts: [],
      favoriteFonts: [],
      
      // Actions
      setGoogleFonts: (googleFonts) => set({ googleFonts, googleFontsLoaded: true }),
      
      setGoogleFontsLoaded: (googleFontsLoaded) => set({ googleFontsLoaded }),
      
      setGoogleFontsError: (googleFontsError) => set({ googleFontsError }),
      
      addLoadedFont: (fontFamily) =>
        set((state) => ({
          loadedFonts: new Set([...state.loadedFonts, fontFamily]),
        })),
      
      addCustomFont: (font) =>
        set((state) => ({
          customFonts: [...state.customFonts, font],
        })),
      
      removeCustomFont: (id) =>
        set((state) => ({
          customFonts: state.customFonts.filter((f) => f.id !== id),
        })),
      
      addRecentFont: (fontFamily) =>
        set((state) => {
          const filtered = state.recentFonts.filter((f) => f !== fontFamily);
          return {
            recentFonts: [fontFamily, ...filtered].slice(0, 10),
          };
        }),
      
      toggleFavoriteFont: (fontFamily) =>
        set((state) => {
          const isFavorite = state.favoriteFonts.includes(fontFamily);
          return {
            favoriteFonts: isFavorite
              ? state.favoriteFonts.filter((f) => f !== fontFamily)
              : [...state.favoriteFonts, fontFamily],
          };
        }),
    }),
    {
      name: "font-store",
      partialize: (state) => ({
        customFonts: state.customFonts,
        recentFonts: state.recentFonts,
        favoriteFonts: state.favoriteFonts,
      }),
    }
  )
);

// Helper to load a Google Font dynamically
export async function loadGoogleFont(
  family: string,
  weights: number[] = [400, 500, 600, 700]
): Promise<void> {
  const fontStore = useFontStore.getState();
  
  // Check if already loaded
  if (fontStore.loadedFonts.has(family)) {
    return;
  }
  
  // Create link element
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weights.join(";")}&display=swap`;
  
  // Wait for font to load
  await new Promise<void>((resolve, reject) => {
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
    document.head.appendChild(link);
  });
  
  fontStore.addLoadedFont(family);
  fontStore.addRecentFont(family);
}
