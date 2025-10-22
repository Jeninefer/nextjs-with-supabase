import React from 'react';

const ObjectiveSlide = () => {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Objetivo & Oportunidad</h2>
        <p className="text-sm text-gray-400">Abaco - Commercial Deck</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-xs font-semibold text-purple-300 mb-2">Market TAM (SV GDP ~$36.75B)</h3>
          <div className="space-y-1 text-xs">
            <p className="text-white">• 4% penetration = <span className="text-green-400 font-bold">$1.47B</span></p>
            <p className="text-white">• 8% penetration = <span className="text-green-400 font-bold">$2.94B</span></p>
            <p className="text-white">• 15% penetration = <span className="text-green-400 font-bold">$5.51B</span></p>
            <p className="text-gray-400 text-[10px] mt-2">Current SV fintech: &lt;1% GDP</p>
          </div>
        </div>

        {/* Additional content can be added here */}

      </div>
    </div>
  );
};

export default ObjectiveSlide;