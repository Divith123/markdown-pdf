import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} from "docx";

interface DocxExportOptions {
  title: string;
  htmlContent: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const generateDocx = async ({
  title,
  htmlContent,
  margins,
}: DocxExportOptions): Promise<Blob> => {
  const paragraphs: Paragraph[] = [];

  // Add keys to ensure unique objects
  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName?.toLowerCase();

    switch (tagName) {
      case "h1":
        paragraphs.push(
          new Paragraph({
            text: element.textContent || "",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        break;
      case "h2":
        paragraphs.push(
          new Paragraph({
            text: element.textContent || "",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          })
        );
        break;
      case "h3":
        paragraphs.push(
          new Paragraph({
            text: element.textContent || "",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );
        break;
      case "h4":
      case "h5":
      case "h6":
        paragraphs.push(
          new Paragraph({
            text: element.textContent || "",
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 200, after: 100 },
          })
        );
        break;
      case "p":
        const runs = parseInlineContent(element);
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: { after: 200 },
          })
        );
        break;
      case "ul":
      case "ol":
        element.querySelectorAll("li").forEach((li, index) => {
          const bullet = tagName === "ol" ? `${index + 1}. ` : "• ";
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: bullet + (li.textContent || "") }),
              ],
              spacing: { after: 100 },
              indent: { left: 720 },
            })
          );
        });
        break;
      case "blockquote":
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.textContent || "",
                italics: true,
              }),
            ],
            spacing: { after: 200 },
            indent: { left: 720 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 12, color: "2563EB" },
            },
          })
        );
        break;
      default:
        element.childNodes.forEach((child) => processNode(child));
    }
  };

  const parseInlineContent = (element: HTMLElement): TextRun[] => {
    const runs: TextRun[] = [];

    const processInline = (
      node: Node,
      styles: { bold?: boolean; italic?: boolean; underline?: boolean }
    ) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          runs.push(
            new TextRun({
              text: node.textContent,
              bold: styles.bold,
              italics: styles.italic,
              underline: styles.underline ? {} : undefined,
            })
          );
        }
        return;
      }

      const el = node as HTMLElement;
      const tag = el.tagName?.toLowerCase();
      const newStyles = { ...styles };

      if (tag === "strong" || tag === "b") newStyles.bold = true;
      if (tag === "em" || tag === "i") newStyles.italic = true;
      if (tag === "u") newStyles.underline = true;

      el.childNodes.forEach((child) => processInline(child, newStyles));
    };

    element.childNodes.forEach((child) => processInline(child, {}));
    return runs.length > 0 ? runs : [new TextRun({ text: element.textContent || "" })];
  };

  tempDiv.childNodes.forEach((node) => processNode(node));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: margins.top * 20, // Convert to twips roughly (1/20 pt? No, Docx uses twips, 1440 = 1 inch) 
              // Actually margins in docx are usually in twips (1/1440 inch).
              // The original code used * 20, assuming input was points?
              // Standard A4 margin is 1 inch = 1440 twips.
              // If margins.top is e.g. 72 (1 inch), 72*20 = 1440. Correct.
              right: margins.right * 20,
              bottom: margins.bottom * 20,
              left: margins.left * 20,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
};
