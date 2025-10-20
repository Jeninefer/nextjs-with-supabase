'use client';

export default function GrowthChart() {
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 font-['Lato']">Growth Projections</h3>
      <div className="h-64 flex items-center justify-center bg-slate-800/30 rounded-lg border border-purple-400/10">
        <div className="text-center">
          <div className="text-4xl text-purple-400 mb-2">📈</div>
          <div className="text-white font-semibold">Growth Chart</div>
          <div className="text-purple-300 text-sm">Interactive visualization</div>
        </div>
      </div>
    </div>
  );
}
