'use client';

import React, { useState } from 'react';

interface GrowthData {
  month: string;
  revenue: number;
  clients: number;
  aum: number;
}

interface GrowthChartProps {
  data?: GrowthData[];
}

export default function GrowthChart({ data = [] }: GrowthChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'clients' | 'aum'>('revenue');

  // Enhanced sample data for ABACO
  const sampleData: GrowthData[] = [
    { month: 'Jan', revenue: 3200000, clients: 2400, aum: 38000000 },
    { month: 'Feb', revenue: 3450000, clients: 2520, aum: 41000000 },
    { month: 'Mar', revenue: 3700000, clients: 2650, aum: 43500000 },
    { month: 'Apr', revenue: 3850000, clients: 2750, aum: 45000000 },
    { month: 'May', revenue: 4000000, clients: 2800, aum: 46500000 },
    { month: 'Jun', revenue: 4200000, clients: 2850, aum: 47500000 },
  ];

  const chartData = data.length > 0 ? data : sampleData;
  
  const getMaxValue = (metric: keyof GrowthData) => {
    return Math.max(...chartData.map(d => d[metric] as number));
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'revenue':
      case 'aum':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'clients':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'revenue': return 'from-purple-600 to-purple-400';
      case 'clients': return 'from-blue-600 to-blue-400';
      case 'aum': return 'from-green-600 to-green-400';
      default: return 'from-purple-600 to-purple-400';
    }
  };

  const getGrowthRate = () => {
    if (chartData.length < 2) return 0;
    const firstValue = chartData[0][selectedMetric];
    const lastValue = chartData[chartData.length - 1][selectedMetric];
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const maxValue = getMaxValue(selectedMetric);

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 font-['Lato']">Growth Projections</h3>
      <div className="h-64 flex items-center justify-center bg-slate-900/30 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-purple-300 font-['Poppins']">Interactive growth chart coming soon</p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-green-400 font-bold">+15.2%</div>
              <div className="text-purple-300">Q4 Growth</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold">$2.1M</div>
              <div className="text-purple-300">New AUM</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold">+125</div>
              <div className="text-purple-300">New Clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
