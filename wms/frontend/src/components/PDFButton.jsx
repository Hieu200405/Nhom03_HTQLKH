import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';

export function PDFButton({
  title = 'Report',
  fileName = 'report.pdf',
  columns = [],
  rows = [],
  className = '',
  onBeforeExport,
}) {
  const handleExport = async () => {
    if (onBeforeExport) {
      await onBeforeExport();
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontSize(16);
    doc.text(title, 40, 40);

    autoTable(doc, {
      head: [columns.map((column) => column.header ?? column.key)],
      body: rows.map((row) =>
        columns.map((column) =>
          column.export ? column.export(row[column.key], row) : row[column.key],
        ),
      ),
      startY: 60,
      theme: 'grid',
      styles: {
        halign: 'left',
        valign: 'middle',
        fontSize: 10,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
      },
    });

    doc.save(fileName);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className={`inline-flex items-center gap-2 rounded-md border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10 ${className}`}
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </button>
  );
}
