// Build a UTF-8 CSV string with a BOM so Excel opens it with correct encoding.
export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
): string {
  const esc = (cell: unknown) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
  const bom = "﻿";
  return (
    bom +
    [headers.join(","), ...rows.map((row) => row.map(esc).join(","))].join("\n")
  );
}
