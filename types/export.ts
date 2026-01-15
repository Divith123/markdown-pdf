import type { PageSize, PageOrientation } from "./document";

export type ExportFormat = "pdf" | "docx" | "markdown" | "html";

export interface PDFExportOptions {
  pageSize: PageSize;
  orientation: PageOrientation;
  quality: "screen" | "print" | "press";
  embedFonts: boolean;
  colorSpace: "rgb" | "cmyk";
  includeBleed: boolean;
  bleedSize?: number;
  showCropMarks: boolean;
}

export interface DOCXExportOptions {
  preserveStyles: boolean;
  includeTableOfContents: boolean;
  embedImages: boolean;
}

export interface MarkdownExportOptions {
  flavor: "commonmark" | "gfm";
  includeMetadata: boolean;
}

export interface HTMLExportOptions {
  includeStyles: boolean;
  standalone: boolean;
  minify: boolean;
}

export type ExportOptions = 
  | { format: "pdf"; options: PDFExportOptions }
  | { format: "docx"; options: DOCXExportOptions }
  | { format: "markdown"; options: MarkdownExportOptions }
  | { format: "html"; options: HTMLExportOptions };

export interface ExportProgress {
  status: "idle" | "preparing" | "generating" | "complete" | "error";
  progress: number;
  message: string;
  error?: string;
}

export const defaultPDFOptions: PDFExportOptions = {
  pageSize: "a4",
  orientation: "portrait",
  quality: "print",
  embedFonts: true,
  colorSpace: "rgb",
  includeBleed: false,
  showCropMarks: false,
};

export const defaultDOCXOptions: DOCXExportOptions = {
  preserveStyles: true,
  includeTableOfContents: false,
  embedImages: true,
};

export const defaultMarkdownOptions: MarkdownExportOptions = {
  flavor: "gfm",
  includeMetadata: true,
};

export const defaultHTMLOptions: HTMLExportOptions = {
  includeStyles: true,
  standalone: true,
  minify: false,
};
