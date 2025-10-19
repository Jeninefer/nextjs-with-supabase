export interface LoanData {
  id: string
  customer_id: string
  loan_amount: number
  disbursement_date: string
  outstanding_balance: number
  dpd: number
  segment: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  risk_score: number
}

export interface KPIMetric {
  id: string
  metric_name: string
  metric_value: number
  unit: string
  recorded_at: string
  trend: 'up' | 'down' | 'stable'
}

export interface CustomerSegment {
  segment: string
  customer_count: number
  total_aum: number
  avg_dpd: number
  default_rate: number
  risk_profile: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface MarketIntelligence {
  source: string
  metric: string
  value: number
  alert: boolean
  recorded_at: string
}

export interface AbacoConfig {
  theme: {
    colors: {
      primary_purple: string
      background: string
      success: string
      warning: string
      error: string
    }
  }
  features: {
    ai_enabled: boolean
    real_time_alerts: boolean
    market_intelligence: boolean
  }
}
