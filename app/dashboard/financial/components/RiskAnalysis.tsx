'use client';

import React, { useState } from 'react';

interface RiskMetrics {
  concentration: number;
  defaultRate: number;
  volatility: number;
  varMetric: number; // Value at Risk
  stressTestResult: number;
}

interface RiskAnalysisProps {
  riskData?: RiskMetrics;
}

export default function RiskAnalysis({ 
  riskData = {
    concentration: 0.165,
    defaultRate: 0.028,
    volatility: 0.118,
    varMetric: 0.092,
    stressTestResult: 0.195
  }
}: RiskAnalysisProps) {
  
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');

  const getRiskLevel = (value: number, thresholds: [number, number]): { level: string; color: string; severity: number } => {
    if (value <= thresholds[0]) return { level: 'Low', color: 'text-green-400', severity: 1 };
    if (value <= thresholds[1]) return { level: 'Medium', color: 'text-yellow-400', severity: 2 };
    return { level: 'High', color: 'text-red-400', severity: 3 };
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  const riskMetrics = [
    {
      label: 'Portfolio Concentration',
      value: riskData.concentration,
      thresholds: [0.12, 0.20] as [number, number],
      description: 'Measures diversification across client base',
      icon: '🎯',
      optimal: '< 12%'
    },
    {
      label: 'Default Rate',
      value: riskData.defaultRate,
      thresholds: [0.025, 0.04] as [number, number],
      description: 'Current portfolio default percentage',
      icon: '⚠️',
      optimal: '< 2.5%'
    },
    {
      label: 'Portfolio Volatility',
      value: riskData.volatility,
      thresholds: [0.10, 0.15] as [number, number],
      description: 'Indicates how much the portfolio value might fluctuate',
      icon: '📉',
      optimal: '< 10%'
    },
    {
      label: 'Value at Risk (95%)',
      value: riskData.varMetric,
      thresholds: [0.05, 0.1] as [number, number],
      description: 'Estimates potential loss in value of the portfolio',
      icon: '📊',
      optimal: '< 5%'
    },
    {
      label: 'Stress Test Result',
      value: riskData.stressTestResult,
      thresholds: [0.15, 0.3] as [number, number],
      description: 'Measures portfolio resilience under extreme conditions',
      icon: '🧪',
      optimal: '< 15%'
    }
  ];

  const riskLevels = [
    { level: 'Low Risk', percentage: 65, color: 'bg-green-400' },
    { level: 'Medium Risk', percentage: 28, color: 'bg-yellow-400' },
    { level: 'High Risk', percentage: 7, color: 'bg-red-400' }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 font-['Lato']">Risk Analysis</h3>
      <div className="space-y-4">
        {riskLevels.map((risk, index) => (
          <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300 font-['Poppins']">{risk.level}</span>
              <span className="text-white font-bold">{risk.percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`${risk.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${risk.percentage}%` }}
              />
            </div>
          </div>
        ))}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-purple-400/10">
          <div className="text-sm text-purple-300 font-['Poppins']">Portfolio VaR (95%)</div>
          <div className="text-lg font-bold text-white">$1.2M (4.8%)</div>
        </div>
      </div>
    </div>
  );
}
