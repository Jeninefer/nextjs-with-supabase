import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FinancialMetrics } from './components/FinancialMetrics'
import { GrowthChart } from './components/GrowthChart'
import { RiskAnalysis } from './components/RiskAnalysis'
import { AIInsights } from './components/AIInsights'

export default async function FinancialDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Try to fetch financial data from Supabase (will be null if tables don't exist yet)
  let kpiData = null
  let loanData = null

  try {
    const { data: kpiResponse } = await supabase
      .from('kpi_snapshots')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(10)
    kpiData = kpiResponse
  } catch (error) {
    console.log('KPI table not found, using mock data')
  }

  try {
    const { data: loanResponse } = await supabase
      .from('loan_data')
      .select('*')
      .limit(100)
    loanData = loanResponse
  } catch (error) {
    console.log('Loan data table not found, using mock data')
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="abaco-gradient-text text-4xl font-bold font-lato">
            ABACO Financial Intelligence
          </h1>
          <p className="text-gray-400 mt-2">
            Enterprise-grade financial analytics and portfolio management
          </p>
        </header>
        
        <FinancialMetrics kpiData={kpiData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GrowthChart data={loanData} />
          <RiskAnalysis data={loanData} />
        </div>

        <AIInsights />
      </div>
    </div>
  )
}
