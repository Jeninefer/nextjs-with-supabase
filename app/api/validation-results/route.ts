import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Read the validation report JSON
    const validationReportPath = join(process.cwd(), 'notebooks', 'validation_results', 'validation_report.json');
    const validationReport = await readFile(validationReportPath, 'utf-8');
    const reportData = JSON.parse(validationReport);

    // Read CSV files
    const monthlyTransfersPath = join(process.cwd(), 'notebooks', 'validation_results', 'monthly_transfers_operations.csv');
    const monthlyAveragesPath = join(process.cwd(), 'notebooks', 'validation_results', 'monthly_averages.csv');
    const outstandingBalancePath = join(process.cwd(), 'notebooks', 'validation_results', 'outstanding_balance.csv');

    const monthlyTransfers = await readFile(monthlyTransfersPath, 'utf-8');
    const monthlyAverages = await readFile(monthlyAveragesPath, 'utf-8');
    const outstandingBalance = await readFile(outstandingBalancePath, 'utf-8');

    // Parse CSV data
    const parseCSV = (csv: string) => {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',');
      return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as Record<string, string>);
      });
    };

    return NextResponse.json({
      validation_report: reportData,
      monthly_transfers_operations: parseCSV(monthlyTransfers),
      monthly_averages: parseCSV(monthlyAverages),
      outstanding_balance: parseCSV(outstandingBalance)
    });
  } catch (error) {
    console.error('Error reading validation results:', error);
    return NextResponse.json(
      { error: 'Failed to load validation results' },
      { status: 500 }
    );
  }
}
