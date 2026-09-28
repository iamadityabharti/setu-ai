import React from 'react';
import { Shield, Download, FileText, Globe2, Heart, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#081220] text-sand-300 border-t-4 border-sand-400 py-12 px-4 sm:px-8 mt-20 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <div className="flex items-center gap-2.5 font-black text-white text-base">
            <div className="w-7 h-7 rounded-lg bg-sand-400 text-navy-950 flex items-center justify-center font-black text-sm">
              से
            </div>
            <span>SETU AI · सेतु · Interoperable Digital Public Good</span>
          </div>
          <p className="text-sand-200/60 mt-2 max-w-xl text-xs leading-relaxed font-normal">
            Certified Digital Public Goods standard compliant. Multilingual voice intake, geospatial demand clustering, and explainable allocation algorithms for BRICS national infrastructure commissions.
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-sand-300/80">
            <span>🇮🇳 India</span>
            <span>·</span>
            <span>🇧🇷 Brazil</span>
            <span>·</span>
            <span>🇷🇺 Russia</span>
            <span>·</span>
            <span>🇨🇳 China</span>
            <span>·</span>
            <span>🇿🇦 South Africa</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs font-bold">
          <a
            href="http://localhost:8000/api/v1/hotspots/public/hotspots"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-sand-300 hover:text-white border border-sand-400/25 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sand-400" />
            <span>GeoJSON Open Data</span>
          </a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-sand-300 hover:text-white border border-sand-400/25 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5 text-sand-400" />
            <span>OpenAPI v1 Docs</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/40 gap-2">
        <div>© 2026 SETU AI Initiative. Open-source Digital Public Good under MIT License.</div>
        <div className="font-mono">Audited Algorithms · Zero Black-Box Guarantee</div>
      </div>
    </footer>
  );
};
