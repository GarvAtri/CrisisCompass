import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { clamp, formatCurrency, type StudyCountry } from '../data/studyScoredData';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
  countries: StudyCountry[];
  onCountrySelect: (country: StudyCountry) => void;
  selectedCountry: StudyCountry | null;
}

function riskColor(score: number): string {
  if (score >= 0.6) return '#b91c1c';
  if (score >= 0.5) return '#dc2626';
  if (score >= 0.4) return '#ea580c';
  if (score >= 0.3) return '#f59e0b';
  return '#65a30d';
}

function circleRadiusMeters(country: StudyCountry): number {
  const base = 140000;
  const scaled = Math.sqrt(country.totalNeed2025) * 170;
  return clamp(base + scaled, 140000, 950000);
}

export function WorldMap({ countries, onCountrySelect, selectedCountry }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleLayerRef = useRef<L.LayerGroup | null>(null);
  const coreMarkerLayerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<Map<string, L.Circle>>(new Map());
  const markerRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const selectedCodeRef = useRef<string | null>(null);

  const countriesByCode = useMemo(
    () => new Map(countries.map((country) => [country.code, country])),
    [countries]
  );

  useEffect(() => {
    selectedCodeRef.current = selectedCountry?.code ?? null;
  }, [selectedCountry]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [18, 12],
      zoom: 2,
      minZoom: 2,
      maxZoom: 7,
      scrollWheelZoom: true,
      worldCopyJump: true
    });

    mapInstanceRef.current = map;
    circleLayerRef.current = L.layerGroup().addTo(map);
    coreMarkerLayerRef.current = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      circleLayerRef.current = null;
      coreMarkerLayerRef.current = null;
      circleRef.current.clear();
      markerRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const circleLayer = circleLayerRef.current;
    const coreMarkerLayer = coreMarkerLayerRef.current;
    if (!circleLayer || !coreMarkerLayer) return;

    circleLayer.clearLayers();
    coreMarkerLayer.clearLayers();
    circleRef.current.clear();
    markerRef.current.clear();

    countries.forEach((country) => {
      const score = country.crisisScore;
      const color = riskColor(score);
      const radius = circleRadiusMeters(country);

      const heatCircle = L.circle(country.coordinates, {
        radius,
        color,
        weight: 1,
        opacity: 0.22,
        fillColor: color,
        fillOpacity: 0.2 + score * 0.3
      });

      const core = L.circleMarker(country.coordinates, {
        radius: 4 + score * 11,
        color: '#ffffff',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.95
      });

      const popupHtml = `
        <div style="font-size: 13px; min-width: 240px;">
          <div style="font-weight: 700; margin-bottom: 4px;">${country.name} (${country.code})</div>
          <div>Crisis score: <b>${country.crisisScore.toFixed(2)}</b> (rank #${country.rank.toFixed(0)})</div>
          <div>Food coverage: <b>${country.foodCoverage.toFixed(1)}%</b></div>
          <div>Health coverage: <b>${country.healthCoverage.toFixed(1)}%</b></div>
          <div>Nutrition coverage: <b>${country.nutritionCoverage.toFixed(1)}%</b></div>
          <div>Food gap: <b>${formatCurrency(country.foodGapUsd)}</b></div>
          <div>Health gap: <b>${formatCurrency(country.healthGapUsd)}</b></div>
        </div>
      `;

      heatCircle.bindPopup(popupHtml);
      core.bindPopup(popupHtml);

      const onClick = () => onCountrySelect(country);
      heatCircle.on('click', onClick);
      core.on('click', onClick);

      heatCircle.on('mouseover', function mouseover(this: L.Circle) {
        if (selectedCodeRef.current !== country.code) {
          this.setStyle({ fillOpacity: 0.38 + score * 0.2, opacity: 0.35 });
        }
      });

      heatCircle.on('mouseout', function mouseout(this: L.Circle) {
        if (selectedCodeRef.current !== country.code) {
          this.setStyle({ fillOpacity: 0.2 + score * 0.3, opacity: 0.22 });
        }
      });

      heatCircle.addTo(circleLayer);
      core.addTo(coreMarkerLayer);

      circleRef.current.set(country.code, heatCircle);
      markerRef.current.set(country.code, core);
    });
  }, [countries, onCountrySelect]);

  useEffect(() => {
    circleRef.current.forEach((circle, code) => {
      const country = countriesByCode.get(code);
      if (!country) return;

      const score = country.crisisScore;
      const selected = selectedCountry?.code === code;

      circle.setStyle({
        weight: selected ? 2 : 1,
        opacity: selected ? 0.58 : 0.22,
        fillOpacity: selected ? 0.48 + score * 0.15 : 0.2 + score * 0.3
      });
    });

    markerRef.current.forEach((marker, code) => {
      const country = countriesByCode.get(code);
      if (!country) return;

      const score = country.crisisScore;
      const selected = selectedCountry?.code === code;

      marker.setStyle({
        radius: selected ? 8 + score * 9 : 4 + score * 11,
        weight: selected ? 2 : 1,
        color: '#ffffff'
      });
    });

    if (selectedCountry && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedCountry.coordinates, 4.7, { duration: 1.1 });
    }
  }, [countriesByCode, selectedCountry]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', background: '#0a0f1c' }} />

      <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255, 255, 255, 0.95)', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.25)', padding: 14, zIndex: 1000, width: 290, color: '#0f172a' }}>
        <h3 style={{ fontSize: 14, margin: '0 0 8px 0', color: '#0f172a' }}>Crisis Score Heat Map (Study-Aligned)</h3>
        <div style={{ display: 'grid', gap: 4, fontSize: 12, color: '#0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#b91c1c' }} /><span>Extreme (0.60+)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#dc2626' }} /><span>High (0.50-0.59)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ea580c' }} /><span>Elevated (0.40-0.49)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} /><span>Moderate (0.30-0.39)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#65a30d' }} /><span>Lower (&lt;0.30)</span></div>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: 11, color: '#475569' }}>
          Color uses `crisis_score`; glow size uses 2025 combined need (food + health + nutrition).
        </p>
      </div>
    </div>
  );
}
