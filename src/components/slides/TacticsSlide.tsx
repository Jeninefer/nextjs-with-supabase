export default function TacticsSlide() {
  const tactics = [
    {
      phase: "Q1 2025",
      title: "Foundation & Launch",
      items: [
        "Setup CRM y marketing automation",
        "Content strategy & SEO optimization", 
        "Social media presence establishment",
        "Lead magnets creation"
      ],
      color: "purple"
    },
    {
      phase: "Q2 2025",
      title: "Scale & Optimize", 
      items: [
        "Paid advertising campaigns",
        "Webinar series launch",
        "Partner channel development",
        "Customer success program"
      ],
      color: "blue"
    },
    {
      phase: "Q3 2025",
      title: "Expansion",
      items: [
        "Account-based marketing",
        "Industry events & conferences", 
        "Referral program launch",
        "Product integration demos"
      ],
      color: "green"
    },
    {
      phase: "Q4 2025",
      title: "Optimization",
      items: [
        "Data analysis & optimization",
        "Customer retention focus",
        "Upselling strategies", 
        "Year-end campaigns"
      ],
      color: "red"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "bg-purple-500/20 border-purple-400/30 text-purple-200",
      blue: "bg-blue-500/20 border-blue-400/30 text-blue-200",
      green: "bg-green-500/20 border-green-400/30 text-green-200", 
      red: "bg-red-500/20 border-red-400/30 text-red-200"
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Tactics Timeline - Abaco 2025</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tactics.map((tactic, index) => (
          <div key={index} className={`${getColorClasses(tactic.color)} rounded-lg p-6 border`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg">{tactic.title}</h4>
              <span className="text-sm font-semibold px-3 py-1 bg-white/20 rounded-full">
                {tactic.phase}
              </span>
            </div>
            
            <ul className="space-y-2">
              {tactic.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start space-x-2">
                  <span className="text-white/70 mt-1">•</span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/10 rounded-lg">
        <h4 className="font-semibold text-white mb-3">KPIs por Trimestre</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-purple-200 font-semibold">Q1</p>
            <p className="text-white">1K leads</p>
            <p className="text-gray-300">Foundation metrics</p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 font-semibold">Q2</p>
            <p className="text-white">3K leads</p>
            <p className="text-gray-300">Scale & optimize</p>
          </div>
          <div className="text-center">
            <p className="text-green-200 font-semibold">Q3</p>
            <p className="text-white">5K leads</p>
            <p className="text-gray-300">Market expansion</p>
          </div>
          <div className="text-center">
            <p className="text-red-200 font-semibold">Q4</p>
            <p className="text-white">7K leads</p>
            <p className="text-gray-300">Optimization peak</p>
          </div>
        </div>
      </div>
    </div>
  )
}