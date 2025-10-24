import { useState } from 'react'
import ObjectiveSlide from './components/slides/ObjectiveSlide'
import ChannelStrategySlide from './components/slides/ChannelStrategySlide'
import KAMStrategySlide from './components/slides/KAMStrategySlide'
import MarketingFunnelSlide from './components/slides/MarketingFunnelSlide'
import TacticsSlide from './components/slides/TacticsSlide'

function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    { title: 'Objetivos', component: <ObjectiveSlide /> },
    { title: 'Estrategia de Canales', component: <ChannelStrategySlide /> },
    { title: 'Estrategia KAM', component: <KAMStrategySlide /> },
    { title: 'Embudo de Marketing', component: <MarketingFunnelSlide /> },
    { title: 'Tácticas', component: <TacticsSlide /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="p-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Abaco Office Add-in</h1>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  currentSlide === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/20 text-white/70 hover:bg-white/30'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Slide Content */}
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-white mb-2">
              {slides[currentSlide].title}
            </h2>
            <p className="text-white/70">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl">
            {slides[currentSlide].component}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
