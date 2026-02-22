import { useState } from 'react';
import { WorldMap } from './components/worldMap';
import { CountryDetails } from './components/countryDetails';
import { type CountryData } from './countries/countriesData';
import { Globe, Info } from 'lucide-react';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl text-white">
                CRISIS COMPASS: Food Security, Nutrition & Health Analysis
              </h1>
              <p className="text-sm text-slate-300">
                Interactive World Map - Humanitarian Crisis Dashboard 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
            About
          </button>
        </div>
      </header>

      {/* Info Panel */}
      {showInfo && (
        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="max-w-4xl">
            <h2 className="text-lg mb-2">About This Dashboard</h2>
            <p className="text-sm text-gray-700 mb-3">
              This interactive map visualizes the global humanitarian crisis landscape, focusing on the intersection
              of food security, nutrition, and health funding gaps. Data includes metrics from multiple international
              datasets including UN, World Bank, and humanitarian organization reports.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-600 mb-1">Key Metrics</div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Crisis Score (0-100%)</li>
                  <li>• Absorption Capacity</li>
                  <li>• Funding Gaps & Coverage</li>
                </ul>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Data Sources</div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• World Bank Indicators</li>
                  <li>• UN Humanitarian Data</li>
                  <li>• Health & Nutrition Reports</li>
                </ul>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Usage</div>
                <ul className="text-xs space-y-1 text-gray-700">
                  <li>• Click countries for details</li>
                  <li>• Zoom and pan the map</li>
                  <li>• Compare funding gaps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className={`transition-all duration-300 ${selectedCountry ? 'w-2/3' : 'w-full'}`}>
          <WorldMap 
            onCountrySelect={setSelectedCountry}
            selectedCountry={selectedCountry}
          />
        </div>

        {/* Details Panel */}
        {selectedCountry && (
          <div className="w-1/3 border-l border-slate-700 bg-white shadow-2xl">
            <CountryDetails 
              country={selectedCountry}
              onClose={() => setSelectedCountry(null)}
            />
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <footer className="flex-shrink-0 bg-slate-800 border-t border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <div>
            {selectedCountry ? (
              <span>Selected: <span className="text-white">{selectedCountry.name}</span> - Funding: {selectedCountry.metrics.fundingPercentage.toFixed(1)}%</span>
            ) : (
              <span>Click on any country marker to view detailed analysis</span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">Countries Tracked: </span>
              <span className="text-white">26</span>
            </div>
            <div>
              <span className="text-slate-400">Data Source: </span>
              <span className="text-white">UN OCHA, World Bank, Humanitarian Data Exchange</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
