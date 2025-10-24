import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface FinancialDataRow {
  id: string;
  customer_id: string;
  balance: number;
  credit_limit: number;
  days_past_due: number;
  analysis_date: string;
  created_at: string;
}

export interface KPIResult {
  id: string;
  analysis_date: string;
  kpi_data: Record<string, number>;
  insights: string[];
  created_at: string;
}

class FinancialSupabaseClient {
  private readonly client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async getFinancialData(): Promise<FinancialDataRow[]> {
    const { data, error } = await this.client
      .from('financial_data')
      .select('*')
      .order('analysis_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch financial data: ${error.message}`);
    }

    return data || [];
  }

  async saveKPIResults(kpiData: Record<string, number>, insights: string[]): Promise<void> {
    const { error } = await this.client
      .from('kpi_results')
      .insert({
        analysis_date: new Date().toISOString(),
        kpi_data: kpiData,
        insights
      });

    if (error) {
      throw new Error(`Failed to save KPI results: ${error.message}`);
    }
  }

  async getLatestKPIs(): Promise<KPIResult | null> {
    const { data, error } = await this.client
      .from('kpi_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch latest KPIs: ${error.message}`);
    }

    return data || null;
  }
}

let financialClient: FinancialSupabaseClient | null = null;

export const getFinancialClient = (): FinancialSupabaseClient => {
  financialClient ??= new FinancialSupabaseClient();
  return financialClient;
};
