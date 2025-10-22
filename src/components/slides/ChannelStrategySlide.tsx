import React from 'react';

const ChannelStrategySlide = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Estrategia de Canales</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-xs font-semibold text-purple-300 mb-3">Claim Central</h3>
          <p className="text-xs text-white italic leading-relaxed">
            "Convierte tus facturas en efectivo en &lt;48h. Sin colateral duro."
          </p>
        </div>
        
        {/* ...other content... */}
        
      </div>
    </div>
  );
};

export default ChannelStrategySlide;