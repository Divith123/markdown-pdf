import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Pro - Editor",
  description: "Best-in-class Markdown to PDF/DOC editor",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
