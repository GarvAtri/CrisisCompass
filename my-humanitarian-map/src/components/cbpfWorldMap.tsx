import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatMillions, formatPeople, type CbpfCountryData, type SectorSummary } from '../data/cbpfData';

interface CbpfWorldMapProps {
  countries: CbpfCountryData[];
  selectedCountry: CbpfCountryData | null;
  onCountrySelect: (country: CbpfCountryData) => void;
  sectorSummary: SectorSummary[];
}

function getGapColor(gap: number): string {
  if (gap <= -20) return '#b91c1c';
  if (gap <= -8) return '#ea580c';
  if (gap < 8) return '#d97706';
  if (gap < 20) return '#16a34a';
  return '#15803d';
}

function markerRadius(combinedNeed: number): number {
  const inMillions = combinedNeed / 1_000_000;
  return Math.max(6, Math.min(30, 5 + Math.sqrt(inMillions) * 2.4));
}

export function CbpfWorldMap({ countries, selectedCountry, onCountrySelect, sectorSummary }: CbpfWorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const selectedCodeRef = useRef<string | null>(null);

  const summaryText = useMemo(() => {
    const byName = Object.fromEntries(sectorSummary.map((entry) => [entry.cluster, entry]));
    return {
      food: byName['Food Security']?.coverage,
      health: byName.Health?.coverage,
      nutrition: byName.Nutrition?.coverage
    };
  }, [sectorSummary]);

  useEffect(() => {
    selectedCodeRef.current = selectedCountry?.iso3 ?? null;
  }, [selectedCountry]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [18, 15],
      zoom: 2,
      minZoom: 2,
      maxZoom: 7,
      scrollWheelZoom: true
    });

    mapInstanceRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    countries.forEach((country) => {
      const color = getGapColor(country.healthVsFoodGap);
      const marker = L.circleMarker(country.coordinates, {
        radius: markerRadius(country.combinedNeed),
        color,
        fillColor: color,
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.55
      });

      const fundedPct = country.totalRequired > 0 ? (country.totalFunded / country.totalRequired) * 100 : 0;
      marker.bindPopup(`
        <div style="font-size: 13px; min-width: 220px;">
          <div style="font-weight: 700; margin-bottom: 4px;">${country.name}</div>
          <div>Food coverage: <b>${country.food.coverage.toFixed(1)}%</b></div>
          <div>Health coverage: <b>${country.health.coverage.toFixed(1)}%</b></div>
          <div>Nutrition coverage: <b>${country.nutrition.coverage.toFixed(1)}%</b></div>
          <div style="margin-top: 6px;">Health vs food gap: <b>${country.healthVsFoodGap.toFixed(1)} pp</b></div>
          <div>Combined need (F+H+N): <b>${formatPeople(country.combinedNeed)}</b></div>
          <div>Total funded: <b>${formatMillions(country.totalFunded)}</b> (${fundedPct.toFixed(1)}%)</div>
        </div>
      `);

      marker.on('click', () => onCountrySelect(country));
      marker.on('mouseover', function mouseover(this: L.CircleMarker) {
        if (selectedCodeRef.current !== country.iso3) {
          this.setStyle({ fillOpacity: 0.78, weight: 2.5 });
        }
      });
      marker.on('mouseout', function mouseout(this: L.CircleMarker) {
        if (selectedCodeRef.current !== country.iso3) {
          this.setStyle({ fillOpacity: 0.55, weight: 1.5 });
        }
      });

      marker.addTo(layer);
      markersRef.current.set(country.iso3, marker);
    });
  }, [countries, onCountrySelect]);

  useEffect(() => {
    markersRef.current.forEach((marker, iso3) => {
      const country = countries.find((entry) => entry.iso3 === iso3);
      if (!country) return;

      const selected = selectedCountry?.iso3 === iso3;
      marker.setStyle({
        radius: selected ? markerRadius(country.combinedNeed) + 2 : markerRadius(country.combinedNeed),
        weight: selected ? 3 : 1.5,
        color: selected ? '#ffffff' : getGapColor(country.healthVsFoodGap),
        fillColor: getGapColor(country.healthVsFoodGap),
        fillOpacity: selected ? 0.9 : 0.55
      });
    });

    if (selectedCountry && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedCountry.coordinates, 4.8, { duration: 1.2 });
    }
  }, [countries, selectedCountry]);

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full" style={{ backgroundColor: '#0b1020' }} />

      <div className="absolute top-4 left-4 z-[1000] bg-white/95 rounded-lg shadow-xl p-3 max-w-[330px] text-xs">
        <div className="text-sm mb-2">CBPF Correlation Map</div>
        <p className="text-slate-700 mb-2">
          Color = health coverage lag/lead vs food. Marker size = combined people in need (food + health + nutrition).
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#b91c1c' }} />Health far behind food</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#d97706' }} />Near parity</div>
          <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: '#15803d' }} />Health ahead of food</div>
        </div>
        <div className="mt-3 text-slate-700">
          <div>2025 global cluster coverage context:</div>
          <div>Food: {summaryText.food?.toFixed(1) ?? 'N/A'}%</div>
          <div>Health: {summaryText.health?.toFixed(1) ?? 'N/A'}%</div>
          <div>Nutrition: {summaryText.nutrition?.toFixed(1) ?? 'N/A'}%</div>
        </div>
      </div>
    </div>
  );
}
