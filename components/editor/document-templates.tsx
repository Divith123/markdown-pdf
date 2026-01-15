"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  File,
  BookOpen,
  Mail,
  Briefcase,
  GraduationCap,
  Newspaper,
  Code2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  content: string;
}

const templates: Template[] = [
  {
    id: "blank",
    name: "Blank Document",
    description: "Start with a clean slate",
    category: "basic",
    icon: File,
    content: "",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Structure for recording meeting discussions",
    category: "basic",
    icon: FileText,
    content: `# Meeting Notes

## Meeting Information
- **Date:** ${new Date().toLocaleDateString()}
- **Time:** 
- **Location:** 
- **Attendees:** 

---

## Agenda
1. 
2. 
3. 

---

## Discussion Points

### Topic 1


### Topic 2


---

## Action Items
| Task | Assigned To | Due Date |
|------|-------------|----------|
|      |             |          |

---

## Next Meeting
- **Date:** 
- **Topics to Cover:** 

`,
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    description: "Formal project proposal structure",
    category: "business",
    icon: Briefcase,
    content: `# Project Proposal

## Executive Summary
*Brief overview of the project and its objectives*

---

## Problem Statement
*Describe the problem or opportunity*

---

## Proposed Solution
*Detailed description of your proposed solution*

### Key Features
1. 
2. 
3. 

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 |  |  |
| Phase 2 |  |  |
| Phase 3 |  |  |

---

## Budget

| Category | Cost |
|----------|------|
|          |      |
| **Total** | **$0** |

---

## Success Metrics
- 
- 

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
|      |            |        |            |

---

## Conclusion
*Summarize key points and call to action*

`,
  },
  {
    id: "blog-post",
    name: "Blog Post",
    description: "Standard blog post structure",
    category: "content",
    icon: Newspaper,
    content: `# Blog Post Title

*A compelling subtitle that draws readers in*

![Featured Image](image-url)

---

## Introduction
*Hook your readers and introduce the topic. What will they learn?*

---

## Main Content

### Section 1
*First major point or section*

> "A relevant quote to emphasize a point"

### Section 2
*Second major point*

**Key takeaways:**
- Point 1
- Point 2
- Point 3

### Section 3
*Third major point with examples*

---

## Conclusion
*Summarize the key points and provide a call-to-action*

---

**Author:** Your Name  
**Published:** ${new Date().toLocaleDateString()}  
**Tags:** #tag1, #tag2, #tag3

`,
  },
  {
    id: "technical-doc",
    name: "Technical Documentation",
    description: "Software documentation template",
    category: "technical",
    icon: Code2,
    content: `# Project Name

![Version](https://img.shields.io/badge/version-1.0.0-blue)

## Overview
*Brief description of what this project does*

---

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project.git

# Install dependencies
npm install

# Start the application
npm start
\`\`\`

---

## Usage

### Basic Usage
\`\`\`javascript
import { component } from 'project';

const result = component.method();
\`\`\`

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | "" | Description |
| option2 | boolean | false | Description |

---

## API Reference

### \`methodName(param1, param2)\`
Description of what this method does.

**Parameters:**
- \`param1\` (type): Description
- \`param2\` (type): Description

**Returns:** Description of return value

**Example:**
\`\`\`javascript
const result = methodName('value1', 'value2');
\`\`\`

---

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

`,
  },
  {
    id: "resume",
    name: "Resume / CV",
    description: "Professional resume template",
    category: "personal",
    icon: GraduationCap,
    content: `# Your Name

**Title / Position**

📧 email@example.com | 📱 (555) 123-4567 | 📍 City, State  
🔗 [LinkedIn](linkedin.com/in/username) | 🌐 [Portfolio](yoursite.com) | 💻 [GitHub](github.com/username)

---

## Professional Summary
*2-3 sentences highlighting your experience, skills, and career objectives*

---

## Experience

### Job Title | Company Name
*Month Year - Present*
- Accomplishment with measurable impact
- Led initiative that resulted in X% improvement
- Collaborated with team to deliver project

### Job Title | Company Name
*Month Year - Month Year*
- Key responsibility or achievement
- Another accomplishment with metrics

---

## Education

### Degree Name | University Name
*Graduation Year*
- Relevant coursework, honors, or activities

---

## Skills

**Technical:** Skill 1, Skill 2, Skill 3, Skill 4  
**Languages:** Language 1 (Fluent), Language 2 (Conversational)  
**Tools:** Tool 1, Tool 2, Tool 3

---

## Certifications
- Certification Name | Issuing Organization | Year
- Certification Name | Issuing Organization | Year

---

## Projects

### Project Name
*Brief description of the project and your role*
- Technologies used: Tech 1, Tech 2

`,
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Email newsletter format",
    category: "content",
    icon: Mail,
    content: `# 📬 Newsletter Title

*Edition #X | ${new Date().toLocaleDateString()}*

---

## 👋 Welcome

*Personal greeting and introduction to this edition*

---

## 📰 Top Stories

### Story 1 Title
Brief summary of the first major story or update.
[Read more →](#)

### Story 2 Title
Brief summary of the second story.
[Read more →](#)

---

## 💡 Tip of the Week

> *Share a valuable tip, insight, or piece of advice*

---

## 📊 Quick Stats

| Metric | This Week | Change |
|--------|-----------|--------|
| Metric 1 | Value | +X% |
| Metric 2 | Value | -X% |

---

## 🔗 Links & Resources

- [Resource 1](#) - Brief description
- [Resource 2](#) - Brief description
- [Resource 3](#) - Brief description

---

## 📅 Upcoming Events

- **Event Name** - Date
- **Event Name** - Date

---

*Thanks for reading! Reply to this email with your thoughts.*

**[Unsubscribe](#) | [View in Browser](#) | [Share](#)**

`,
  },
  {
    id: "book-notes",
    name: "Book Notes",
    description: "Reading notes and summary template",
    category: "personal",
    icon: BookOpen,
    content: `# 📚 Book Notes: Title

## Book Information
- **Author:** 
- **Published:** 
- **Genre:** 
- **Rating:** ⭐⭐⭐⭐⭐

---

## Summary
*Brief overview of what the book is about (2-3 paragraphs)*

---

## Key Takeaways

### 1. Main Idea 1
Explanation and personal thoughts

### 2. Main Idea 2
Explanation and personal thoughts

### 3. Main Idea 3
Explanation and personal thoughts

---

## Favorite Quotes

> "Quote 1" - Page X

> "Quote 2" - Page X

> "Quote 3" - Page X

---

## Chapter Notes

### Chapter 1: Title
- Key points
- Notable examples

### Chapter 2: Title
- Key points
- Notable examples

---

## How I'll Apply This
*Personal action items and how this book affects my thinking*

1. Action item 1
2. Action item 2
3. Action item 3

---

## Related Books
- Similar Book 1
- Similar Book 2
- Related Reading

---

*Date Read: ${new Date().toLocaleDateString()}*

`,
  },
];

const categories = [
  { id: "all", label: "All Templates" },
  { id: "basic", label: "Basic" },
  { id: "business", label: "Business" },
  { id: "content", label: "Content" },
  { id: "technical", label: "Technical" },
  { id: "personal", label: "Personal" },
];

interface DocumentTemplatesProps {
  onInsert?: () => void;
}

export function DocumentTemplates({ onInsert }: DocumentTemplatesProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInsert = useCallback(() => {
    if (!editor || !selectedTemplate) return;

    // Clear document and insert template content
    editor.chain()
      .focus()
      .clearContent()
      .setContent(selectedTemplate.content)
      .run();

    setOpen(false);
    setSelectedTemplate(null);
    onInsert?.();
  }, [editor, selectedTemplate, onInsert]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Document Templates</DialogTitle>
          <DialogDescription>
            Choose a template to start your document
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full gap-4 mt-4">
          {/* Sidebar */}
          <div className="w-48 space-y-4">
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" />

          {/* Template Grid */}
          <div className="flex-1">
            <ScrollArea className="h-[420px]">
              <div className="grid grid-cols-2 gap-3 pr-4">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate?.id === template.id;

                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        "relative p-4 text-left border rounded-lg transition-all",
                        "hover:border-primary hover:bg-muted/50",
                        isSelected && "border-primary bg-muted"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <Icon className="h-8 w-8 mb-2 text-muted-foreground" />
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Preview and Insert */}
            {selectedTemplate && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-medium">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                </div>
                <Button onClick={handleInsert}>
                  Use Template
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
