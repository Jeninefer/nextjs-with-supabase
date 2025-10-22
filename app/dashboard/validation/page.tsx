import { Suspense } from "react";
import { readFile } from "fs/promises";
import { join } from "path";

interface ValidationResult {
  timestamp: string;
  totalLoans: number;
  totalDisbursements: string;
  totalOutstanding: string;
  checks: {
    negativeBalance: { passed: boolean; message: string };
    monotonicDisbursement: { passed: boolean; message: string };
    formulaConsistency: { passed: boolean; message: string };
    reasonableFinalBalance: { passed: boolean; message: string };
  };
  summary: {
    totalCustomers: number;
    avgBalance: string;
    avgCreditScore: number;
    riskDistribution: Record<string, number>;
  };
}

async function getValidationResults(): Promise<ValidationResult | null> {
  try {
    const filePath = join(
      process.cwd(),
      "notebooks",
      "validation_results.json"
    );
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load validation results:", error);
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto p-8">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

async function ValidationDashboard() {
  const results = await getValidationResults();

  if (!results) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                No validation results found
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Generate validation data first:</p>
                <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded overflow-x-auto">
                  <code>{`cd ~/Documents/GitHub/nextjs-with-supabase
source abaco_venv/bin/activate
python3 notebooks/generate_validation_results.py`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allChecksPassed = Object.values(results.checks).every(
    (check) => check.passed
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ABACO Validation Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time loan portfolio validation and compliance monitoring
          </p>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`p-6 rounded-lg shadow-lg mb-8 ${
            allChecksPassed
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
              : "bg-gradient-to-r from-red-500 to-red-600 text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {allChecksPassed
                  ? "✅ All Validation Checks Passed"
                  : "❌ Validation Failures Detected"}
              </h2>
              <p className="text-sm opacity-90">
                Last updated:{" "}
                {new Date(results.timestamp).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div className="text-6xl opacity-20">
              {allChecksPassed ? "✓" : "✗"}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1">
                  Total Loans
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {results.totalLoans.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1">
                  Disbursements
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {results.totalDisbursements}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1">
                  Outstanding
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {results.totalOutstanding}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Checks */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg
              className="h-6 w-6 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Validation Checks
          </h2>
          <div className="space-y-4">
            {Object.entries(results.checks).map(([key, check]) => (
              <div
                key={key}
                className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <span
                  className={`text-3xl mr-4 ${
                    check.passed ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {check.passed ? "✅" : "❌"}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                      .replace(/^./, (str) => str.toUpperCase())}
                  </h3>
                  <p className="text-gray-600">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg
              className="h-6 w-6 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Portfolio Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                Total Customers
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {results.summary.totalCustomers.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                Average Balance
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {results.summary.avgBalance}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                Avg Credit Score
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {results.summary.avgCreditScore.toFixed(1)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                Risk Distribution
              </p>
              <div className="space-y-2 mt-2">
                {Object.entries(results.summary.riskDistribution).map(
                  ([risk, count]) => (
                    <div
                      key={risk}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600 font-medium">
                        {risk}:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ValidationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ValidationDashboard />
    </Suspense>
  );
}
