import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { countriesData, getRiskColor, formatCurrency, formatNumber, type CountryData } from '../countries/countriesData';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
  onCountrySelect: (country: CountryData) => void;
  selectedCountry: CountryData | null;
}

export function WorldMap({ onCountrySelect, selectedCountry }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      scrollWheelZoom: true
    });

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'opacity-70'
    }).addTo(map);

    // Add markers for each country
    countriesData.forEach((country: CountryData) => {
      // Calculate marker size based on funding gap or people in need
      const baseRadius = 8;
      const scale = country.metrics.inNeed.all ? Math.min(country.metrics.inNeed.all / 50000000, 2) : 0.5;
      const radius = baseRadius * (0.5 + scale);
      
      const marker = L.circleMarker(country.coordinates, {
        radius: radius,
        fillColor: getRiskColor(country.riskLevel),
        color: getRiskColor(country.riskLevel),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6
      });

      // Add popup with real data
      const peopleInNeed = country.metrics.inNeed.all ? formatNumber(country.metrics.inNeed.all) : 'N/A';
      const fundingGap = formatCurrency(country.metrics.fundingGap);
      const fundingPct = country.metrics.fundingPercentage.toFixed(1);
      
      marker.bindPopup(`
        <div style="font-size: 14px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${country.name}</div>
          <div style="font-size: 12px;">
            <div>Risk: <span style="text-transform: capitalize;">${country.riskLevel}</span></div>
            <div>People in Need: ${peopleInNeed}</div>
            <div>Funding Gap: ${fundingGap}</div>
            <div>Funded: ${fundingPct}%</div>
          </div>
        </div>
      `);

      // Add click handler
      marker.on('click', () => {
        onCountrySelect(country);
      });

      // Add hover effects
      marker.on('mouseover', function(this: L.CircleMarker) {
        if (selectedCountry?.code !== country.code) {
          this.setStyle({
            fillOpacity: 0.8,
            weight: 2
          });
        }
      });

      marker.on('mouseout', function(this: L.CircleMarker) {
        if (selectedCountry?.code !== country.code) {
          this.setStyle({
            fillOpacity: 0.6,
            weight: 1
          });
        }
      });

      marker.addTo(map);
      markersRef.current.set(country.code, marker);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker styles when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, code) => {
      const country = countriesData.find((c: CountryData) => c.code === code);
      if (!country) return;

      const isSelected = selectedCountry?.code === code;
      const baseRadius = isSelected ? 12 : 8;
      const scale = country.metrics.inNeed.all ? Math.min(country.metrics.inNeed.all / 50000000, 2) : 0.5;
      const radius = baseRadius * (0.5 + scale);

      marker.setStyle({
        radius: radius,
        color: isSelected ? '#ffffff' : getRiskColor(country.riskLevel),
        weight: isSelected ? 3 : 1,
        opacity: isSelected ? 1 : 0.8,
        fillOpacity: isSelected ? 0.9 : 0.6
      });
    });

    // Fly to selected country
    if (selectedCountry && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedCountry.coordinates, 6, {
        duration: 1.5
      });
    }
  }, [selectedCountry]);

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="h-full w-full"
        style={{ background: '#0f172a' }}
      />
      
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h3 className="text-sm mb-2">Risk Levels</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#DC2626' }} />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F97316' }} />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EAB308' }} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22C55E' }} />
            <span>Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
