/**
 * ABACO Financial Intelligence - Export Utilities
 * Client-side data export with proper encoding handling
 */

import type { CustomerData } from "./data-generator";

/**
 * Export customer data to CSV with UTF-8 encoding
 */
export function exportToCSV(
  data: CustomerData[],
  filename: string = "abaco_customers"
): void {
  if (data.length === 0) {
    throw new Error("Cannot export empty dataset");
  }

  // Generate CSV content
  const headers = Object.keys(data[0]);
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof CustomerData];
          // Escape values containing commas or quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob with UTF-8 encoding
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Trigger download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export metrics to JSON with proper formatting
 */
export function exportToJSON(
  data: Record<string, any>,
  filename: string = "abaco_metrics"
): void {
  // Convert to JSON with proper formatting
  const jsonContent = JSON.stringify(data, null, 2);

  // Create blob with UTF-8 encoding
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });

  // Trigger download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export multiple formats (CSV + JSON) as ZIP
 * Requires JSZip library: npm install jszip
 */
export async function exportToZip(
  customers: CustomerData[],
  metrics: Record<string, any>,
  filename: string = "abaco_export"
): Promise<void> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Add CSV
    const headers = Object.keys(customers[0]);
    const csvContent = [
      headers.join(","),
      ...customers.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof CustomerData];
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    zip.file("customers.csv", "\ufeff" + csvContent);

    // Add JSON
    zip.file("metrics.json", JSON.stringify(metrics, null, 2));

    // Generate and download
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.zip`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to create ZIP export:", error);
    throw new Error("Export failed. Please try again.");
  }
}