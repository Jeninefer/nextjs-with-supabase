'use client';

export default function AIInsights() {
  const insights = [
    {
      type: 'trend',
      title: 'Portfolio Growth Acceleration',
      description: 'AUM growth rate increased 15% this quarter, driven by B2G segment expansion.',
      confidence: 92,
      icon: '📈'
    },
    {
      type: 'risk',
      title: 'Concentration Alert',
      description: 'Top 5 clients represent 35% of portfolio. Consider diversification strategies.',
      confidence: 87,
      icon: '⚠️'
    },
    {
      type: 'opportunity',
      title: 'Market Expansion',
      description: 'SME lending shows 60% growth potential in current market conditions.',
      confidence: 78,
      icon: '💡'
    }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm rounded-lg border border-purple-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white font-['Lato']">AI Insights</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-purple-300 font-['Poppins']">Live Analysis</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-purple-400/20">
            <div className="flex items-start gap-3">
              <span className="text-xl">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-white font-['Poppins']">{insight.title}</h4>
                  <span className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded-full">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-300 font-['Poppins']">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-400/20">
        <div className="text-xs text-purple-300 font-['Poppins'] text-center">
          Powered by ABACO AI Engine • Enhanced with xAI Grok Integration
        </div>
      </div>
    </div>
  );
}
