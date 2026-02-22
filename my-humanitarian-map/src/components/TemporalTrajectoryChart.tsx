import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { TemporalTrend } from '../types/stories';

interface TemporalTrajectoryChartProps {
  data: TemporalTrend[];
  onCountryClick?: (country: string) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-bold text-lg">{data.country_iso3}</p>
        <p className="text-sm">2024: {data.year_2024.toLocaleString()}</p>
        <p className="text-sm">2025: {data.year_2025.toLocaleString()}</p>
        <p className="text-sm font-semibold">Change: {data.change_pct.toFixed(1)}%</p>
        <p className="text-sm">
          Trend: 
          <span className={`ml-1 px-2 py-1 rounded text-xs ${
            data.trend === 'worsening' ? 'bg-red-100 text-red-800' :
            data.trend === 'improving' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {data.trend}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const TemporalTrajectoryChart: React.FC<TemporalTrajectoryChartProps> = ({ 
  data, 
  onCountryClick 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const formatYAxis = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const getLineColor = (trend: string): string => {
    switch (trend) {
      case 'worsening': return '#ef4444';
      case 'improving': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getLineType = (trend: string): string => {
    return trend === 'stable' ? '5 5' : '0';
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentYear(2024);
  };

  const handleCountryClick = (country: string) => {
    if (onCountryClick) {
      onCountryClick(country);
    }
    
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const chartData = data.map(item => ({
    ...item,
    displayValue: currentYear === 2024 ? item.year_2024 : item.year_2025,
    year: currentYear
  }));

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Temporal Trajectories: Health Needs Evolution</h3>
        <p className="text-gray-600 mb-4">
          Watch how health needs evolve from 2024 to 2025. Red lines show worsening crises, green shows improvement.
        </p>
        
        {/* Animation Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={toggleAnimation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAnimating ? 'Pause' : 'Play'} Animation
          </button>
          
          <button
            onClick={resetAnimation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Year:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold">
              {currentYear}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-500"></div>
            <span>Worsening Crisis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-green-500"></div>
            <span>Improving Situation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gray-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }}></div>
            <span>Stable</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="country_iso3"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          
          <YAxis 
            tickFormatter={formatYAxis}
            label={{ 
              value: 'People in Need', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Lines for each country */}
          {data.map((item) => (
            <Line
              key={item.country_iso3}
              type="monotone"
              dataKey="displayValue"
              stroke={getLineColor(item.trend)}
              strokeWidth={selectedCountries.includes(item.country_iso3) ? 3 : 2}
              strokeDasharray={getLineType(item.trend)}
              dot={{ 
                r: selectedCountries.includes(item.country_iso3) ? 6 : 4,
                onClick: () => handleCountryClick(item.country_iso3),
                style: { cursor: 'pointer' }
              }}
              opacity={selectedCountries.length === 0 || selectedCountries.includes(item.country_iso3) ? 1 : 0.3}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Selected Countries Summary */}
      {selectedCountries.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Selected Countries:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedCountries.map(country => {
              const countryData = data.find(d => d.country_iso3 === country);
              if (!countryData) return null;
              
              return (
                <div key={country} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="font-medium">{country}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    countryData.trend === 'worsening' ? 'bg-red-100 text-red-800' :
                    countryData.trend === 'improving' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {countryData.change_pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-1">Most Worsening</h4>
          <p className="text-red-700 text-sm">
            {data.filter(d => d.trend === 'worsening').length} countries with increasing needs
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-1">Improving</h4>
          <p className="text-green-700 text-sm">
            {data.filter(d => d.trend === 'improving').length} countries with decreasing needs
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-1">Stable</h4>
          <p className="text-gray-700 text-sm">
            {data.filter(d => d.trend === 'stable').length} countries with stable needs
          </p>
        </div>
      </div>
    </div>
  );
};
