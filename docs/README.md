# Markdown to PDF Pro - Technical Documentation

## Overview

Markdown to PDF Pro is a best-in-class Markdown → PDF/DOC editor with live WYSIWYG experience, full custom font control, rich text & HTML support, and export-quality output.

## Architecture

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Rich Text Editor**: TipTap (ProseMirror-based)
- **State Management**: Zustand
- **PDF Export**: @react-pdf/renderer
- **DOCX Export**: docx library
- **Package Manager**: pnpm

### Project Structure

```
app/
├── (editor)/                  # Editor route group
│   ├── layout.tsx             # Editor shell
│   └── page.tsx               # Main editor page
├── globals.css                # Global styles + editor styles
└── layout.tsx                 # Root layout

components/
├── ui/                        # shadcn/ui components
├── editor/                    # Editor-specific components
│   ├── editor-canvas.tsx      # TipTap editor wrapper
│   └── mode-switcher.tsx      # Visual/Markdown/HTML toggle
├── toolbar/                   # Toolbar components
│   └── formatting-toolbar.tsx # Main formatting toolbar
└── panels/                    # Side panel components
    ├── export-panel.tsx       # Export dialog
    ├── typography-panel.tsx   # Typography controls
    ├── theme-panel.tsx        # Theme selector
    └── page-settings-panel.tsx # Page settings

lib/
├── editor/
│   └── extensions/            # Custom TipTap extensions
│       ├── font-size.ts       # Font size extension
│       ├── line-height.ts     # Line height extension
│       └── text-align.ts      # Text alignment extension
└── utils.ts                   # Utility functions

stores/
├── editor-store.ts            # Editor state (mode, ready, saving)
├── document-store.ts          # Document content & settings
└── font-store.ts              # Font management

types/
├── editor.ts                  # Editor types
├── document.ts                # Document types
├── typography.ts              # Typography types
├── theme.ts                   # Theme types
└── export.ts                  # Export types
```

## Core Features

### 1. Hybrid Editor (TipTap)

The editor uses TipTap with the following extensions:

- **StarterKit**: Basic formatting (bold, italic, headings, lists, etc.)
- **Typography**: Smart typography (quotes, dashes)
- **TextStyle**: Custom text styling
- **Color**: Text color
- **FontFamily**: Font family selection
- **Highlight**: Text highlighting
- **Underline**: Underline formatting
- **TaskList/TaskItem**: Checkbox lists
- **Table**: Table support with resize
- **CodeBlockLowlight**: Syntax-highlighted code blocks
- **Custom Extensions**: FontSize, LineHeight, TextAlign

### 2. Typography Controls

Located in `components/panels/typography-panel.tsx`:

- Base font size (12-24px)
- Line height (1.0-2.5)
- Letter spacing (-0.05em to 0.2em)
- Paragraph spacing (0.5em to 3em)
- Per-heading size controls (H1-H6)

### 3. Theme System

Four built-in themes in `types/theme.ts`:

- **Minimal**: Clean, simple design
- **Academic**: Traditional academic paper styling
- **Magazine**: Bold, modern editorial design
- **Resume**: Professional CV styling

Each theme defines colors for:
- Background/foreground
- Headings/body text
- Links
- Code blocks
- Blockquotes
- Borders

### 4. Export Capabilities

Supported formats:

| Format | Library | Features |
|--------|---------|----------|
| PDF | @react-pdf/renderer | Embedded fonts, vector graphics |
| DOCX | docx | Preserved styles, editable |
| Markdown | Custom serializer | CommonMark/GFM |
| HTML | TipTap HTML output | Standalone with styles |

### 5. Page Settings

- Page sizes: A4, Letter, Legal, Custom
- Orientation: Portrait, Landscape
- Margins: Top, Right, Bottom, Left (in points)
- Headers & Footers with page numbers

## State Management

### Zustand Stores

1. **editor-store.ts**
   - `editor`: TipTap editor instance
   - `mode`: Current editing mode
   - `isReady`: Editor initialization status
   - `isSaving`: Save in progress
   - `lastSaved`: Last save timestamp

2. **document-store.ts** (persisted)
   - `metadata`: Document title, author, dates
   - `content`: JSON document content
   - `typography`: Typography settings
   - `themePreset`: Selected theme
   - `pageSettings`: Page configuration
   - `headerFooter`: Header/footer settings

3. **font-store.ts** (partially persisted)
   - `googleFonts`: Cached font list
   - `loadedFonts`: Currently loaded fonts
   - `customFonts`: User-uploaded fonts
   - `recentFonts`: Recently used fonts
   - `favoriteFonts`: User favorites

## Development

### Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Adding New TipTap Extensions

1. Create extension in `lib/editor/extensions/`
2. Export from `lib/editor/extensions/index.ts`
3. Add to editor configuration in `components/editor/editor-canvas.tsx`

### Adding New Themes

1. Add theme definition to `types/theme.ts`
2. Add to `themePresets` record
3. Theme will automatically appear in theme panel

## Phase 2 Roadmap

- [ ] Google Fonts integration with font picker
- [ ] Custom font upload support
- [ ] Mermaid diagram support
- [ ] Share document via link
- [ ] Real-time collaboration
- [ ] Template marketplace
- [ ] API access

## Performance Considerations

- TipTap uses ProseMirror's efficient DOM updates
- Zustand provides minimal re-renders
- Editor styles use CSS variables for instant theme switching
- Export operations use dynamic imports to reduce bundle size
- Document content persisted to localStorage

## Accessibility

- Keyboard navigation in toolbar
- ARIA labels on all interactive elements
- Screen reader support via semantic HTML
- Focus management in dialogs
