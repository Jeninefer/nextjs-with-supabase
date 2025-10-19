import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FinancialMetrics } from './components/FinancialMetrics'
import { GrowthChart } from './components/GrowthChart'
import { RiskAnalysis } from './components/RiskAnalysis'
import { AIInsights } from './components/AIInsights'

export default async function FinancialDashboard() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  // Fetch financial data from Supabase
  const { data: kpiData } = await supabase
    .from('kpi_snapshots')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(10)

  const { data: loanData } = await supabase
    .from('loan_data')
    .select('*')
    .limit(100)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
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
