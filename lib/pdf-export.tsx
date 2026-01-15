"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";

// Register fonts if needed, otherwise use Helvetica/Standard fonts
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#020817", // foreground
  },
  section: {
    marginBottom: 10,
  },
  h1: {
    fontSize: 24,
    marginBottom: 10,
    marginTop: 20,
    fontWeight: "bold",
    color: "#2563EB", // primary
  },
  h2: {
    fontSize: 20,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: "bold",
    color: "#1E3A8A", // secondary-foreground or darker blue
  },
  h3: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "bold",
  },
  h4: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "bold",
  },
  p: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  ul: {
    marginBottom: 8,
    marginLeft: 10,
  },
  ol: {
    marginBottom: 8,
    marginLeft: 10,
  },
  li: {
    marginBottom: 4,
    flexDirection: "row",
  },
  liBullet: {
    width: 15,
    marginRight: 5,
  },
  liContent: {
    flex: 1,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB", // primary
    paddingLeft: 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
    fontStyle: "italic",
    color: "#64748b", // muted-foreground
    backgroundColor: "#EFF6FF", // secondary
    padding: 8,
  },
  code: {
    fontFamily: "Courier",
    backgroundColor: "#EFF6FF", // secondary
    padding: 2,
    fontSize: 10,
  },
  pre: {
    fontFamily: "Courier",
    backgroundColor: "#EFF6FF", // secondary
    padding: 10,
    marginBottom: 10,
    fontSize: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
  },
});

interface PdfExportOptions {
  title: string;
  htmlContent: string;
}

const PdfDocument = ({ title, htmlContent }: PdfExportOptions) => {
  // Parsing logic
  const parseHtml = (html: string) => {
    if (typeof window === "undefined") return null;
    
    const div = document.createElement("div");
    div.innerHTML = html;

    const renderNode = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const children = Array.from(element.childNodes).map((child, i) =>
        renderNode(child, i)
      );

      switch (tagName) {
        case "h1":
          return <Text key={index} style={styles.h1}>{children}</Text>;
        case "h2":
          return <Text key={index} style={styles.h2}>{children}</Text>;
        case "h3":
          return <Text key={index} style={styles.h3}>{children}</Text>;
        case "h4":
        case "h5":
        case "h6":
          return <Text key={index} style={styles.h4}>{children}</Text>;
        case "p":
          return <Text key={index} style={styles.p}>{children}</Text>;
        case "strong":
        case "b":
          return <Text key={index} style={styles.bold}>{children}</Text>;
        case "em":
        case "i":
          return <Text key={index} style={styles.italic}>{children}</Text>;
        case "u":
          return <Text key={index} style={styles.underline}>{children}</Text>;
        case "ul":
        case "ol":
          return <View key={index} style={tagName === "ul" ? styles.ul : styles.ol}>
             {Array.from(element.children).map((child, i) => {
                const liChildren = Array.from(child.childNodes).map((c, j) => renderNode(c, j));
                return (
                  <View key={i} style={styles.li}>
                     <Text style={styles.liBullet}>{tagName === "ol" ? `${i + 1}.` : "•"}</Text>
                     <Text style={styles.liContent}>{liChildren}</Text>
                  </View>
                );
             })}
          </View>;
        case "li":
           // Handled by parent ul/ol usually, but if standalone:
           return <Text key={index} style={styles.p}>• {children}</Text>;
        case "blockquote":
          return <View key={index} style={styles.blockquote}>{children}</View>;
        case "br":
          return <Text key={index}>{"\n"}</Text>;
        case "code":
             // If inside pre, it's a block, handled below. If inline:
             return <Text key={index} style={styles.code}>{children}</Text>;
        case "pre":
             // Usually contains code
             return <View key={index} style={styles.pre}><Text>{element.textContent}</Text></View>;
        default:
          return <Text key={index}>{children}</Text>;
      }
    };

    return Array.from(div.childNodes).map((node, i) => renderNode(node, i));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{title}</Text>
        <View>{parseHtml(htmlContent)}</View>
      </Page>
    </Document>
  );
};

export const generatePdfBlob = async ({ title, htmlContent }: PdfExportOptions): Promise<Blob> => {
  return await pdf(<PdfDocument title={title} htmlContent={htmlContent} />).toBlob();
};
