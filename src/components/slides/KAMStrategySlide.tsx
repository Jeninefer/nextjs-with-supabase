import React from 'react';

export default function KAMStrategySlide() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col justify-between p-8 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">4 KAMs Strategy</h2>
        <p className="text-sm text-gray-400">Oct-2025 → Dec-2026 Growth Path</p>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Current Base */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
            <h3 className="text-xs font-semibold text-purple-300 mb-2">Current Base (Oct-2025)</h3>
            <div className="space-y-1 text-xs text-white">
              <p>• AUM (live): <span className="text-green-400 font-bold">$7.28M</span></p>
              <p>• Active clients: <span className="text-blue-400 font-bold">188</span></p>
              <p>• Target (Dec-2026): <span className="text-purple-400 font-bold">$16.276M</span></p>
              <p className="text-[10px] text-gray-400 mt-1">+$8.908M net (~$0.636M/month avg)</p>
            </div>
          </div>

          {/* Line Buckets by Channel - Individual */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-blue-500/20">
            <h3 className="text-xs font-semibold text-blue-300 mb-2">Line Buckets by Channel (Monthly)</h3>
            
            {/* Anchors - KAM Only */}
            <div className="mb-3 pb-2 border-b border-white/10">
              <p className="text-[10px] font-semibold text-yellow-300 mb-1">Anchors (&gt;$50–150k) - KAM Only</p>
              <div className="text-[9px] text-gray-300 space-y-0.5 ml-2">
                <p>• Target: <span className="text-white">≥1 new client/KAM/month</span> → <span className="text-green-400 font-semibold">4 anchors/month</span></p>
                <p>• Ticket: <span className="text-white">$75–125k</span> (70% $50–100k, 30% $100–150k)</p>
                <p>• Net AUM contrib: <span className="text-blue-400 font-bold">~$320k/mo</span></p>
                <p className="text-gray-400 text-[8px]">After runoff/default allowance</p>
              </div>
            </div>

            {/* Mid - Inbound + KAM */}
            <div className="mb-3 pb-2 border-b border-white/10">
              <p className="text-[10px] font-semibold text-green-300 mb-1">Mid ($10–50k) - Inbound + KAM</p>
              <div className="text-[9px] text-gray-300 space-y-0.5 ml-2">
                <p>• Target: <span className="text-white">8–12 new clients/month</span></p>
                <p>• Source: <span className="text-white">Inbound + farming</span></p>
                <p>• Net AUM contrib: <span className="text-green-400 font-bold">~$180–220k/mo</span></p>
                <p className="text-gray-400 text-[8px]">Semillero para ascensos a $50–150k</p>
              </div>
            </div>

            {/* Digital Small - Meta/WA Only */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-pink-300 mb-1">Digital Small (≤$10k) - Meta/WA Only</p>
              <div className="text-[9px] text-gray-300 space-y-0.5 ml-2">
                <p>• Target: <span className="text-white">20–30 new clients/month</span></p>
                <p>• Ticket: <span className="text-white">$2–5k</span> (alta rotación)</p>
                <p>• Net AUM contrib: <span className="text-pink-400 font-bold">~$120–160k/mo</span></p>
                <p className="text-gray-400 text-[8px]">Solo redes sociales, volumen</p>
              </div>
            </div>
          </div>

          {/* Total Monthly Composition */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30">
            <h3 className="text-xs font-semibold text-purple-300 mb-2">Total Monthly Growth Composition</h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Anchors (KAM):</span>
                <span className="text-blue-400 font-bold">$320k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mid (Inbound+KAM):</span>
                <span className="text-green-400 font-bold">$180–220k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Digital Small (Meta/WA):</span>
                <span className="text-pink-400 font-bold">$120–160k</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                <span className="text-white font-semibold">Total Net Lift:</span>
                <span className="text-purple-400 font-bold text-sm">$620–700k/mo</span>
              </div>
              <p className="text-[8px] text-gray-400 mt-1">Cubre trayectoria a $16.276M (Dec-2026)</p>
            </div>
          </div>

          {/* Per-KAM Cadence */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-green-500/20">
            <h3 className="text-xs font-semibold text-green-300 mb-2">Per-KAM Operating Cadence (Monthly)</h3>
            <div className="space-y-1 text-[9px] text-gray-300">
              <p>• Pipeline coverage: <span className="text-white">≥3×</span> (3 anchors futuros/cierre)</p>
              <p>• Prospección activa: <span className="text-white">80–100 target accounts</span></p>
              <p>• SQL/MQL (B2B): <span className="text-white">30–40 calificados</span></p>
              <p>• Meetings: <span className="text-white">16–20</span></p>
              <p>• Closes: <span className="text-green-400 font-semibold">1–2 anchors + 1 upgrade/renewal</span></p>
              <p>• SLA: <span className="text-white">≤48h oferta | ≤72h funding</span></p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Funnel by Ticket */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/20">
            <h3 className="text-xs font-semibold text-yellow-300 mb-2">Funnel by Ticket (CRM-tracked)</h3>
            <div className="space-y-2 text-[10px]">
              <div className="bg-white/5 rounded p-2">
                <p className="text-pink-300 font-semibold mb-1">Small (≤$10k) - Solo redes</p>
                <p className="text-gray-300">Close rate: <span className="text-white">~20%</span> (≈5 leads/cierre)</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-green-300 font-semibold mb-1">Mid ($10–50k) - Inbound + KAM</p>
                <p className="text-gray-300">Close rate: <span className="text-white">~15%</span> (≈7 leads/cierre)</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-blue-300 font-semibold mb-1">Large (&gt;$50k) - KAM only</p>
                <p className="text-gray-300">Close rate: <span className="text-white">~10%</span> (≈10 leads/cierre)</p>
              </div>
            </div>
          </div>

          {/* Line-Category Actions */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
            <h3 className="text-xs font-semibold text-purple-300 mb-2">Line-Category Actions</h3>
            <div className="space-y-1 text-[9px] text-gray-300">
              <p>• <span className="text-red-300">&gt;$200k líneas:</span> bajo uso → priorizar utilización</p>
              <p>• <span className="text-yellow-300">$50–150k:</span> foco anchors (mix 70/30) → diversificar</p>
              <p>• <span className="text-green-300">$10–50k:</span> semillero → ascensos tras 2–3 ciclos on-time</p>
            </div>
          </div>

          {/* Risk & Concentration */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-red-500/20">
            <h3 className="text-xs font-semibold text-red-300 mb-2">Risk & Concentration Guardrails</h3>
            <div className="space-y-1 text-[9px] text-gray-300">
              <p>• Single-obligor: <span className="text-white">≤4%</span></p>
              <p>• Top-10: <span className="text-white">≤30%</span></p>
              <p>• Sector cap: <span className="text-white">≤20%</span></p>
              <p className="text-[8px] text-yellow-300 mt-2">Collections Sprints (Q4-25 → H1-26):</p>
              <p className="ml-2">6M efficiency: 93.6% → <span className="text-green-400">≥96%</span></p>
              <p className="ml-2">DPD&gt;15: 15.6% → <span className="text-green-400">&lt;12%</span></p>
              <p className="text-[8px] text-gray-400 mt-1">Loss/attrition: planear ≤6% headroom; operar &lt;4% real</p>
            </div>
          </div>

          {/* Target Industries */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-blue-500/20">
            <h3 className="text-xs font-semibold text-blue-300 mb-2">Target Industries (Priority)</h3>
            <div className="grid grid-cols-2 gap-1 text-[9px] text-gray-300">
              <p>• Transport & Logistics</p>
              <p>• Construction</p>
              <p>• Industrial Services</p>
              <p>• Light Manufacturing</p>
              <p>• B2B Services</p>
              <p>• B2G suppliers (COMPRASAL)</p>
            </div>
          </div>

          {/* Messaging & Channels */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-green-500/20">
            <h3 className="text-xs font-semibold text-green-300 mb-2">Messaging & Channels</h3>
            <div className="space-y-1 text-[9px] text-gray-300">
              <p>• <span className="text-blue-300">KAM:</span> LinkedIn + ABM + referrals (anchors/mid/large)</p>
              <p>• <span className="text-pink-300">Digital:</span> Meta/WA solo ≤$10k (volumen) + email nurturing</p>
              <p>• <span className="text-green-300">Follow-up:</span> contacto &lt;24h a todo inbound</p>
            </div>
          </div>

          {/* Expected Outcome */}
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
            <h3 className="text-xs font-semibold text-green-300 mb-1">Expected Outcome</h3>
            <p className="text-[10px] text-gray-300 leading-relaxed">
              4 anchors/mes + mid + small ⇒ <span className="text-green-400 font-bold">~$0.62–0.70M net AUM/mes</span>, 
              alineado a ruta <span className="text-purple-400">$7.28M → $16.276M</span> con límites de riesgo 
              y carga operativa realista para 4 KAMs.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-gray-500">4 KAMs | Monthly origination targets | Risk-adjusted path to $16.276M</p>
      </div>
    </div>
  );
}