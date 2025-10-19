interface LoanData {
  id: string
  customer_id: string
  loan_amount: number
  outstanding_balance: number
}

interface GrowthChartProps {
  data: LoanData[] | null
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <div className="abaco-card">
      <h2 className="text-xl font-semibold mb-4 text-white">Growth Projections</h2>
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>Interactive Chart Component</p>
          <p className="text-sm mt-2">
            Data Points: {data?.length || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
