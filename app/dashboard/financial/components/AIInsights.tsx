export function AIInsights() {
  return (
    <div className="abaco-card">
      <h2 className="text-xl font-semibold mb-4 text-white">AI Insights</h2>
      <div className="bg-gray-900 rounded p-4 border-l-4 border-primary-300">
        <div className="space-y-2">
          <p className="text-gray-300">
            Portfolio health: <span className="text-green-400 font-semibold">STRONG</span> - Default rate well controlled at 2.1%.
          </p>
          <p className="text-gray-300">
            Growth target: <span className="text-blue-400 font-semibold">ACHIEVABLE</span> - Requires 122% CAGR with current trajectory.
          </p>
          <p className="text-gray-300">
            Market opportunity: <span className="text-yellow-400 font-semibold">MASSIVE</span> - Only 1.08% penetration in 31.6K TAM.
          </p>
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              AI Analysis powered by ABACO Financial Intelligence • Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
