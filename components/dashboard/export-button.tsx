"use client";

import { useState } from "react";
import { exportToCSV, exportToJSON, exportToZip, type CustomerData } from "@/lib/export-utils";

interface ExportButtonProps {
  customers: CustomerData[];
  metrics: Record<string, any>;
  format?: "csv" | "json" | "zip";
}

export function ExportButton({ customers, metrics, format = "csv" }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      switch (format) {
        case "csv":
          exportToCSV(customers, "abaco_customers");
          break;
        case "json":
          exportToJSON(metrics, "abaco_metrics");
          break;
        case "zip":
          await exportToZip(customers, metrics, "abaco_complete");
          break;
      }
      
      // Show success toast (if you have a toast library)
      console.log(`✅ Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      // Show error toast
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || customers.length === 0}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exporting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg
            className="-ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export {format.toUpperCase()}
        </>
      )}
    </button>
  );
}