import { exec } from "child_process";
import { NextResponse } from "next/server";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Test Cloud SQL connection via Python script
    const { stdout, stderr } = await execAsync(
      "python3 notebooks/cloudsql_connector.py"
    );

    return NextResponse.json({
      success: true,
      output: stdout,
      error: stderr || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Execute query (in production, add proper validation and security)
    const { stdout } = await execAsync(
      `python3 -c "from notebooks.cloudsql_connector import CloudSQLConnector; import os; c = CloudSQLConnector(os.getenv('CLOUD_SQL_CONNECTION_NAME'), os.getenv('CLOUD_SQL_DATABASE'), os.getenv('CLOUD_SQL_USERNAME'), os.getenv('CLOUD_SQL_PASSWORD')); c.connect(); result = c.execute_query('${query}'); print(result.to_json() if result is not None else 'null'); c.disconnect()"`
    );

    // Handle the case where the Python result is None or empty
    const trimmed = stdout.trim();
    if (!trimmed || trimmed === "None" || trimmed === "null") {
      return NextResponse.json(
        {
          success: false,
          error: "Query returned no results.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(trimmed),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
