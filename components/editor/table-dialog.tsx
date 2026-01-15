"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table2,
  Plus,
  Minus,
  Trash2,
  MoveUp,
  MoveDown,
  Merge,
  Split,
  PaintBucket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";

interface TableDialogProps {
  onInsert?: () => void;
}

const cellColors = [
  { name: "Default", color: null },
  { name: "Light Gray", color: "#f3f4f6" },
  { name: "Light Red", color: "#fee2e2" },
  { name: "Light Yellow", color: "#fef9c3" },
  { name: "Light Green", color: "#dcfce7" },
  { name: "Light Blue", color: "#dbeafe" },
  { name: "Light Purple", color: "#f3e8ff" },
  { name: "Light Pink", color: "#fce7f3" },
];

export function TableDialog({ onInsert }: TableDialogProps) {
  const { editor } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);

  const handleInsert = useCallback(() => {
    if (!editor) return;

    editor.chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: withHeader })
      .run();

    setOpen(false);
    onInsert?.();
  }, [editor, rows, cols, withHeader, onInsert]);

  // Table manipulation functions
  const addRowBefore = () => editor?.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor?.chain().focus().addRowAfter().run();
  const deleteRow = () => editor?.chain().focus().deleteRow().run();
  const addColumnBefore = () => editor?.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor?.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor?.chain().focus().deleteColumn().run();
  const deleteTable = () => editor?.chain().focus().deleteTable().run();
  const mergeCells = () => editor?.chain().focus().mergeCells().run();
  const splitCell = () => editor?.chain().focus().splitCell().run();
  const toggleHeaderColumn = () => editor?.chain().focus().toggleHeaderColumn().run();
  const toggleHeaderRow = () => editor?.chain().focus().toggleHeaderRow().run();
  const toggleHeaderCell = () => editor?.chain().focus().toggleHeaderCell().run();

  const isInTable = editor?.isActive("table");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Table2 className="h-4 w-4 mr-2" />
          Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isInTable ? "Table Options" : "Insert Table"}
          </DialogTitle>
          <DialogDescription>
            {isInTable
              ? "Modify the current table"
              : "Create a new table with custom dimensions"}
          </DialogDescription>
        </DialogHeader>

        {isInTable ? (
          <div className="space-y-4 mt-4">
            {/* Row Operations */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Rows
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRowBefore}
                  className="flex-1"
                >
                  <MoveUp className="h-4 w-4 mr-1" />
                  Add Above
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRowAfter}
                  className="flex-1"
                >
                  <MoveDown className="h-4 w-4 mr-1" />
                  Add Below
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteRow}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Column Operations */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Columns
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addColumnBefore}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Left
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addColumnAfter}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Right
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteColumn}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Cell Operations */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Cells
              </Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={mergeCells}
                >
                  <Merge className="h-4 w-4 mr-1" />
                  Merge
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={splitCell}
                >
                  <Split className="h-4 w-4 mr-1" />
                  Split
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleHeaderCell}
                >
                  Toggle Header
                </Button>
              </div>
            </div>

            {/* Header Options */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Headers
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleHeaderRow}
                  className="flex-1"
                >
                  Toggle Header Row
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleHeaderColumn}
                  className="flex-1"
                >
                  Toggle Header Column
                </Button>
              </div>
            </div>

            <Separator />

            {/* Delete Table */}
            <Button
              variant="destructive"
              onClick={() => {
                deleteTable();
                setOpen(false);
              }}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Table
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Dimension Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRows(Math.max(1, rows - 1))}
                    disabled={rows <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="rows"
                    type="number"
                    min={1}
                    max={20}
                    value={rows}
                    onChange={(e) => setRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRows(Math.min(20, rows + 1))}
                    disabled={rows >= 20}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cols">Columns</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCols(Math.max(1, cols - 1))}
                    disabled={cols <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="cols"
                    type="number"
                    min={1}
                    max={10}
                    value={cols}
                    onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCols(Math.min(10, cols + 1))}
                    disabled={cols >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="border rounded-lg p-4 overflow-auto"
                style={{ maxHeight: "200px" }}
              >
                <table className="w-full border-collapse">
                  <tbody>
                    {Array.from({ length: Math.min(rows, 10) }).map((_, rowIdx) => (
                      <tr key={rowIdx}>
                        {Array.from({ length: Math.min(cols, 10) }).map((_, colIdx) => (
                          <td
                            key={colIdx}
                            className={cn(
                              "border p-2 text-center text-xs",
                              withHeader && rowIdx === 0
                                ? "bg-muted font-medium"
                                : ""
                            )}
                          >
                            {withHeader && rowIdx === 0
                              ? `H${colIdx + 1}`
                              : `${rowIdx + 1},${colIdx + 1}`}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="withHeader"
                checked={withHeader}
                onChange={(e) => setWithHeader(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="withHeader" className="cursor-pointer">
                Include header row
              </Label>
            </div>

            {/* Insert Button */}
            <Button onClick={handleInsert} className="w-full">
              <Table2 className="h-4 w-4 mr-2" />
              Insert Table ({rows} × {cols})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Quick table size picker (grid-based)
export function QuickTablePicker({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const maxRows = 8;
  const maxCols = 8;

  return (
    <div className="p-2 space-y-2">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows * maxCols }).map((_, idx) => {
          const row = Math.floor(idx / maxCols);
          const col = idx % maxCols;
          const isHighlighted =
            hoveredCell &&
            row <= hoveredCell.row &&
            col <= hoveredCell.col;

          return (
            <button
              key={idx}
              className={cn(
                "w-4 h-4 border rounded-sm transition-colors",
                isHighlighted ? "bg-primary border-primary" : "bg-muted hover:border-primary"
              )}
              onMouseEnter={() => setHoveredCell({ row, col })}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => onSelect(row + 1, col + 1)}
            />
          );
        })}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {hoveredCell
          ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1}`
          : "Select size"}
      </p>
    </div>
  );
}
