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

function downloadBlob(filename: string, extension: string, mime: string, data: BlobPart) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(`.${extension}`) ? filename : `${filename}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Export .xlsx r\u00E9el (Lot 5, \u00E9tape 1) \u2014 jusqu'ici le bouton \u00AB Excel \u00BB ne
// produisait qu'un CSV renomm\u00E9. exceljs g\u00E9n\u00E8re un vrai classeur .xlsx
// (feuille de calcul, en-t\u00EAtes fig\u00E9s, colonnes dimensionn\u00E9es), charg\u00E9 \u00E0 la
// demande pour ne pas alourdir le bundle des \u00E9crans qui n'exportent jamais.
export async function downloadXlsx(filename: string, rows: ExportRow[], sheetName = "Export") {
  if (typeof window === "undefined" || rows.length === 0) return;
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mb\u00E0mbulaan";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  sheet.columns = headers.map((header) => ({ header, key: header, width: Math.min(Math.max(header.length + 4, 14), 40) }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  for (const row of rows) sheet.addRow(row);
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(filename, "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer);
}

