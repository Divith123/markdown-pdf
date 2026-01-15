import type { JSONContent } from "@tiptap/react";
import type { TypographySettings } from "./typography";
import type { ThemePreset, Theme } from "./theme";

export type PageSize = "a4" | "letter" | "legal" | "custom";
export type PageOrientation = "portrait" | "landscape";

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  customWidth?: number;
  customHeight?: number;
}

export interface HeaderFooterSettings {
  showHeader: boolean;
  showFooter: boolean;
  headerContent: string;
  footerContent: string;
  showPageNumbers: boolean;
  pageNumberPosition: "left" | "center" | "right";
}

export interface DocumentMetadata {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Document {
  metadata: DocumentMetadata;
  content: JSONContent;
  typography: TypographySettings;
  themePreset: ThemePreset;
  customTheme?: Theme;
  pageSettings: PageSettings;
  headerFooter: HeaderFooterSettings;
}

export const defaultPageSettings: PageSettings = {
  size: "a4",
  orientation: "portrait",
  margins: {
    top: 72,    // 1 inch in points
    right: 72,
    bottom: 72,
    left: 72,
  },
};

export const defaultHeaderFooter: HeaderFooterSettings = {
  showHeader: false,
  showFooter: true,
  headerContent: "",
  footerContent: "",
  showPageNumbers: true,
  pageNumberPosition: "center",
};

export const pageSizeDimensions: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 595, height: 842 },      // 210mm x 297mm in points
  letter: { width: 612, height: 792 },  // 8.5" x 11" in points
  legal: { width: 612, height: 1008 },  // 8.5" x 14" in points
  custom: { width: 612, height: 792 },  // Default to letter
};
