import React from 'react';
import { Shield, Download, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-sand-300 border-t-2 border-sand-400 py-10 px-6 mt-16 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Shield className="w-4 h-4 text-sand-400" />
            SETU AI · Digital Public Good (DPG Alliance Compliant)
          </div>
          <p className="text-white/60 mt-1 max-w-xl text-xs">
            Open Standards, Privacy-Preserving Citizen Ingestion, Federated Multi-Nation Sovereign Architecture for BRICS Infrastructure Planning.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <a
            href="http://localhost:8000/api/v1/public/hotspots"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sand-400 hover:text-white transition-colors font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Public Open Data API (GeoJSON)
          </a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sand-400 hover:text-white transition-colors font-semibold"
          >
            <FileText className="w-3.5 h-3.5" />
            FastAPI OpenAPI Docs
          </a>
        </div>
      </div>
    </footer>
  );
};
