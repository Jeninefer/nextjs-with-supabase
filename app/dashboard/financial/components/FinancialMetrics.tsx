interface KPIData {
  id: string
  metric_name: string
  metric_value: number
  unit: string
  recorded_at: string
}

interface FinancialMetricsProps {
  kpiData: KPIData[] | null
}

export function FinancialMetrics({ kpiData }: FinancialMetricsProps) {
  // Mock data if no real data available
  const metrics = kpiData || [
    { id: '1', metric_name: 'AUM', metric_value: 7200000, unit: '$', recorded_at: '2025-10-19' },
    { id: '2', metric_name: 'Active Clients', metric_value: 342, unit: 'count', recorded_at: '2025-10-19' },
    { id: '3', metric_name: 'Default Rate', metric_value: 2.1, unit: '%', recorded_at: '2025-10-19' },
    { id: '4', metric_name: 'LTV:CAC', metric_value: 3.2, unit: ':1', recorded_at: '2025-10-19' }
  ]

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') return `$${(value / 1000000).toFixed(1)}M`
    if (unit === '%') return `${value}%`
    if (unit === ':1') return `${value}:1`
    return value.toString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.slice(0, 4).map((metric) => (
        <div key={metric.id} className="abaco-metric-card">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            {metric.metric_name}
          </h3>
          <p className="text-2xl font-bold text-white">
            {formatValue(metric.metric_value, metric.unit)}
          </p>
          <p className="text-sm text-green-400 mt-1">
            {metric.metric_name === 'Default Rate' ? '+0.3% MoM' : '+12.5% MoM'}
          </p>
        </div>
      ))}
    </div>
  )
}
