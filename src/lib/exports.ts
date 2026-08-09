export type ExportValue = string | number | boolean | null | undefined;
export type ExportRow = Record<string, ExportValue>;

function csvCell(value: ExportValue) {
  const normalized = value == null ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename: string, rows: ExportRow[]) {
  if (typeof window === "undefined" || rows.length === 0) return;
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const content = [
    headers.map(csvCell).join(";"),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(";"))
  ].join("\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

