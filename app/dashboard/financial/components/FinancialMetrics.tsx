'use client';

export default function FinancialMetrics() {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 font-['Lato']">Financial Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="text-sm text-purple-300 font-['Poppins']">AUM</div>
          <div className="text-2xl font-bold text-white">$25.4M</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="text-sm text-purple-300 font-['Poppins']">Active Clients</div>
          <div className="text-2xl font-bold text-white">1,247</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="text-sm text-purple-300 font-['Poppins']">Default Rate</div>
          <div className="text-2xl font-bold text-red-400">3.2%</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
          <div className="text-sm text-purple-300 font-['Poppins']">Weighted APR</div>
          <div className="text-2xl font-bold text-green-400">18.5%</div>
        </div>
      </div>
    </div>
  );
}
