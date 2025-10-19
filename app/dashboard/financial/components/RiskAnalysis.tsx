interface LoanData {
  id: string
  customer_id: string
  loan_amount: number
  outstanding_balance: number
}

interface RiskAnalysisProps {
  data: LoanData[] | null
}

export function RiskAnalysis({ data }: RiskAnalysisProps) {
  const totalExposure = data?.reduce((sum, loan) => sum + loan.outstanding_balance, 0) || 0

  return (
    <div className="abaco-card">
      <h2 className="text-xl font-semibold mb-4 text-white">Risk Analysis</h2>
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p>Risk Heatmap Component</p>
          <p className="text-sm mt-2">
            Total Exposure: ${(totalExposure / 1000000).toFixed(1)}M
          </p>
          <div className="mt-4 text-xs">
            <span className="text-green-400">● Low Risk</span>
            <span className="text-yellow-400 ml-4">● Medium Risk</span>
            <span className="text-red-400 ml-4">● High Risk</span>
          </div>
        </div>
      </div>
    </div>
  )
}
