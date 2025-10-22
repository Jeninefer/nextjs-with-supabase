export default function MarketingFunnelSlide() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Marketing Funnel - Abaco Technologies</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Awareness */}
        <div className="bg-purple-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">👁️</div>
          <h4 className="font-semibold text-purple-200 mb-2">Awareness</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• SEO/SEM</p>
            <p>• Content Marketing</p>
            <p>• Social Media</p>
            <p>• PR & Events</p>
          </div>
        </div>

        {/* Interest */}
        <div className="bg-blue-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h4 className="font-semibold text-blue-200 mb-2">Interest</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Lead Magnets</p>
            <p>• Webinars</p>
            <p>• Case Studies</p>
            <p>• Product Demos</p>
          </div>
        </div>

        {/* Consideration */}
        <div className="bg-green-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🤔</div>
          <h4 className="font-semibold text-green-200 mb-2">Consideration</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Free Trials</p>
            <p>• Consultations</p>
            <p>• ROI Calculators</p>
            <p>• Comparisons</p>
          </div>
        </div>

        {/* Action */}
        <div className="bg-red-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h4 className="font-semibold text-red-200 mb-2">Action</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Purchase</p>
            <p>• Contract Signing</p>
            <p>• Implementation</p>
            <p>• Onboarding</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/10 rounded-lg">
        <h4 className="font-semibold text-white mb-2">Métricas Clave</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-purple-200">Awareness</p>
            <p className="text-white font-bold">100K impressions</p>
          </div>
          <div>
            <p className="text-blue-200">Interest</p>
            <p className="text-white font-bold">5K leads</p>
          </div>
          <div>
            <p className="text-green-200">Consideration</p>
            <p className="text-white font-bold">500 trials</p>
          </div>
          <div>
            <p className="text-red-200">Action</p>
            <p className="text-white font-bold">50 customers</p>
          </div>
        </div>
      </div>
    </div>
  )
}
