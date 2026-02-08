import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { StudyMaterials } from "@/components/StudyResults";

interface PDFExportButtonProps {
  data: StudyMaterials;
  topic: string;
}

const PDFExportButton = ({ data, topic }: PDFExportButtonProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to export PDF");
        setExporting(false);
        return;
      }

      const flashcardsHtml = data.flashcards
        .map(
          (fc, i) =>
            `<div style="margin-bottom:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
              <p style="font-weight:600;color:#1a1a1a;margin:0 0 6px;">Q${i + 1}: ${fc.question}</p>
              <p style="color:#4a5568;margin:0;">A: ${fc.answer}</p>
            </div>`
        )
        .join("");

      const quizHtml = data.quiz
        .map(
          (q, i) =>
            `<div style="margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
              <p style="font-weight:600;color:#1a1a1a;margin:0 0 8px;">${i + 1}. ${q.question}</p>
              ${q.options
                .map(
                  (opt, j) =>
                    `<p style="margin:2px 0;padding:4px 8px;${
                      j === q.correctIndex ? "background:#dcfce7;border-radius:4px;font-weight:600;" : ""
                    }">${opt}${j === q.correctIndex ? " ✓" : ""}</p>`
                )
                .join("")}
              <p style="color:#6b7280;font-size:13px;margin:8px 0 0;font-style:italic;">${q.explanation}</p>
            </div>`
        )
        .join("");

      const tipsHtml = data.studyTips
        .map(
          (tip, i) =>
            `<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;">
              <span style="background:#dcfce7;color:#166534;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${i + 1}</span>
              <p style="margin:0;color:#4a5568;">${tip}</p>
            </div>`
        )
        .join("");

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>${topic} - Study Materials</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    h2 { font-size: 20px; margin-top: 32px; margin-bottom: 12px; color: #166534; border-bottom: 2px solid #dcfce7; padding-bottom: 6px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .explanation { line-height: 1.7; color: #374151; white-space: pre-line; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📚 ${topic}</h1>
  <p class="subtitle">Study Materials • Generated on ${new Date().toLocaleDateString()}</p>

  <h2>📝 Explanation</h2>
  <div class="explanation">${data.explanation}</div>

  <h2>🃏 Flashcards (${data.flashcards.length})</h2>
  ${flashcardsHtml}

  <h2>❓ Quiz (${data.quiz.length} Questions)</h2>
  ${quizHtml}

  <h2>💡 Study Tips</h2>
  ${tipsHtml}
</body>
</html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success("PDF export ready!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      size="sm"
      className="gap-1.5"
    >
      {exporting ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Exporting...
        </>
      ) : (
        <>
          <FileDown className="h-3.5 w-3.5" /> Export PDF
        </>
      )}
    </Button>
  );
};

export default PDFExportButton;
