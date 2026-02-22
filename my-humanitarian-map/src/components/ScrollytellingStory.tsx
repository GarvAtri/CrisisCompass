import React, { useEffect, useState, useRef } from 'react';
import { StoryCard } from './StoryCard';
import { InvisibleCrisisMatrix } from './InvisibleCrisisMatrix';
import { TemporalTrajectoryChart } from './TemporalTrajectoryChart';
import { apiService } from '../services/api';
import type { CountryCrisis, CrisisMatrixPoint, TemporalTrend } from '../types/stories';

interface StorySection {
  id: string;
  title: string;
  narrative: string[];
  chartComponent: React.ReactNode;
  scrollProgress: number;
}

export const ScrollytellingStory: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [invisibleCrises, setInvisibleCrises] = useState<CountryCrisis[]>([]);
  const [crisisMatrix, setCrisisMatrix] = useState<CrisisMatrixPoint[]>([]);
  const [temporalTrends, setTemporalTrends] = useState<TemporalTrend[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [crisesData, matrixData, trendsData] = await Promise.all([
          apiService.getInvisibleCrises(15),
          apiService.getCrisisMatrix(),
          apiService.getTemporalTrends(12)
        ]);
        
        setInvisibleCrises(crisesData);
        setCrisisMatrix(matrixData);
        setTemporalTrends(trendsData);
      } catch (error) {
        console.error('Failed to load story data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const progress = scrollTop / (scrollHeight - clientHeight);
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const storySections: StorySection[] = [
    {
      id: 'intro',
      title: 'The Invisible Crisis',
      narrative: [
        "Every day, millions of people face health crises that never make headlines.",
        "These are the invisible crises - situations where human needs far outstrip available resources.",
        "We've analyzed humanitarian data from 2024-2025 to uncover the most critical gaps in health funding worldwide."
      ],
      chartComponent: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invisibleCrises.slice(0, 6).map((country) => (
            <StoryCard
              key={country.country_iso3}
              country={country}
              compact={true}
              onClick={() => setSelectedCountry(country.country_iso3)}
            />
          ))}
        </div>
      ),
      scrollProgress: 0
    },
    {
      id: 'matrix',
      title: 'Mapping the Crisis',
      narrative: [
        "When we plot countries by their health needs against funding gaps, a clear pattern emerges.",
        "The top-right quadrant represents our 'invisible crises' - countries with high needs and severe funding shortages.",
        "Each bubble's size represents the affected population, while color indicates crisis severity.",
        "Notice how the most critical cases cluster in the upper right - these are the countries that need our attention most urgently."
      ],
      chartComponent: (
        <InvisibleCrisisMatrix
          data={crisisMatrix}
          onCountryClick={setSelectedCountry}
        />
      ),
      scrollProgress: 0.33
    },
    {
      id: 'temporal',
      title: 'The Changing Landscape',
      narrative: [
        "Crises are not static - they evolve over time.",
        "Between 2024 and 2025, we've seen some countries make remarkable progress while others face deteriorating situations.",
        "Watch how the lines move: red shows worsening crises, green shows improvement, and gray indicates stability.",
        "The most alarming trend is the number of countries where health needs are increasing despite global attention."
      ],
      chartComponent: (
        <TemporalTrajectoryChart
          data={temporalTrends}
          onCountryClick={setSelectedCountry}
        />
      ),
      scrollProgress: 0.66
    },
    {
      id: 'conclusion',
      title: 'What This Means',
      narrative: [
        "The data reveals a stark reality: health funding is not reaching the places that need it most.",
        "Countries with the highest needs often receive the lowest per-capita funding.",
        "This mismatch creates a cycle where preventable health crises become chronic emergencies.",
        "But there's hope: by identifying these invisible crises, we can direct resources more effectively and save lives."
      ],
      chartComponent: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-red-50 rounded-xl border border-red-200">
            <h3 className="text-xl font-bold text-red-800 mb-3">The Challenge</h3>
            <ul className="space-y-2 text-red-700">
              <li>• {invisibleCrises.filter(c => c.health_coverage < 0.5).length} countries with less than 50% health funding</li>
              <li>• ${invisibleCrises.reduce((sum, c) => sum + c.health_gap, 0).toLocaleString()} total funding gap</li>
              <li>• {invisibleCrises.filter(c => c.health_need_change_pct > 10).length} countries with rapidly worsening needs</li>
            </ul>
          </div>
          
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3">The Opportunity</h3>
            <ul className="space-y-2 text-green-700">
              <li>• Early intervention can prevent crises from escalating</li>
              <li>• Data-driven targeting maximizes impact of limited resources</li>
              <li>• Community-based health solutions show proven results</li>
            </ul>
          </div>
        </div>
      ),
      scrollProgress: 1.0
    }
  ];

  const getCurrentSection = () => {
    const sectionIndex = Math.floor(scrollProgress * storySections.length);
    return storySections[Math.min(sectionIndex, storySections.length - 1)];
  };

  const currentSection = getCurrentSection();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading humanitarian crisis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CrisisCompass</h1>
              <p className="text-sm text-gray-600">Humanitarian Crisis Storytelling</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentSection.title}</p>
              <p className="text-xs text-gray-500">{Math.round(scrollProgress * 100)}% complete</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 py-8 h-screen overflow-y-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Section 1: Introduction */}
        <section className="min-h-screen flex items-center py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                The Invisible Crisis
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                {storySections[0].narrative.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div>
              {storySections[0].chartComponent}
            </div>
          </div>
        </section>

        {/* Section 2: Crisis Matrix */}
        <section className="min-h-screen flex items-center py-16">
          <div className="space-y-8 w-full">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mapping the Crisis
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                {storySections[1].narrative.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="max-w-6xl mx-auto">
              {storySections[1].chartComponent}
            </div>
          </div>
        </section>

        {/* Section 3: Temporal Trends */}
        <section className="min-h-screen flex items-center py-16">
          <div className="space-y-8 w-full">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                The Changing Landscape
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                {storySections[2].narrative.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="max-w-6xl mx-auto">
              {storySections[2].chartComponent}
            </div>
          </div>
        </section>

        {/* Section 4: Conclusion */}
        <section className="min-h-screen flex items-center py-16">
          <div className="space-y-8 w-full">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                What This Means
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                {storySections[3].narrative.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="max-w-4xl mx-auto">
              {storySections[3].chartComponent}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Take Action
            </h2>
            <p className="text-lg text-gray-700">
              Explore the data, share these stories, and help bring attention to the world's invisible crises.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Explore Full Dashboard
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Share This Story
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCountry(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{selectedCountry}</h3>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              {(() => {
                const country = invisibleCrises.find(c => c.country_iso3 === selectedCountry);
                return country ? (
                  <StoryCard country={country} />
                ) : (
                  <p>Country data not found</p>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
