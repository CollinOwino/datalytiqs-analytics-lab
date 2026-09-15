"use client";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="print-hint">
      Print or save as PDF
    </button>
  );
}
