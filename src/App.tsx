import { useState } from 'react';
import ObjectiveSlide from './components/slides/ObjectiveSlide';
import ChannelStrategySlide from './components/slides/ChannelStrategySlide';
import KAMStrategySlide from './components/slides/KAMStrategySlide';
import MarketingFunnelSlide from './components/slides/MarketingFunnelSlide';
import TacticsSlide from './components/slides/TacticsSlide';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { name: 'Objective', component: <ObjectiveSlide /> },
    { name: 'Channel Strategy', component: <ChannelStrategySlide /> },
    { name: 'KAM Strategy', component: <KAMStrategySlide /> },
    { name: 'Marketing Funnel', component: <MarketingFunnelSlide /> },
    { name: 'Tactics', component: <TacticsSlide /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Abaco Office Add-in
          </h1>
          <p className="text-gray-300">Figma Integration with AI-Powered Content</p>
        </header>

        <div className="flex justify-center mb-6 space-x-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentSlide === index
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {slide.name}
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 max-w-6xl mx-auto">
          {slides[currentSlide].component}
        </div>

        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>
            Powered by Supabase, OpenAI, xAI, and Figma
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
