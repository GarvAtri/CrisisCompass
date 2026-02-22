import React, { useEffect, useState } from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ReferenceLine } from 'recharts';
import type { CrisisMatrixPoint } from '../types/stories';

interface InvisibleCrisisMatrixProps {
  data: CrisisMatrixPoint[];
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
        <p className="text-sm text-gray-600">Rank: #{data.crisis_rank}</p>
        <p className="text-sm">Health Needs: {data.health_needs.toLocaleString()}</p>
        <p className="text-sm">Funding Gap: ${data.funding_gap.toLocaleString()}</p>
        <p className="text-sm">Population: {data.population.toLocaleString()}</p>
        <p className="text-sm">Coverage: {(data.health_coverage * 100).toFixed(1)}%</p>
        <p className="text-sm font-semibold text-red-600">
          Crisis Score: {data.invisible_crisis_score.toFixed(3)}
        </p>
      </div>
    );
  }
  return null;
};

export const InvisibleCrisisMatrix: React.FC<InvisibleCrisisMatrixProps> = ({ 
  data, 
  onCountryClick 
}) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('matrix-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.min(600, container.clientWidth * 0.75)
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatAxisLabel = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const getBubbleSize = (population: number): number => {
    // Scale bubble size based on population
    const maxSize = 100;
    const minSize = 20;
    const maxPop = Math.max(...data.map(d => d.population));
    const minPop = Math.min(...data.map(d => d.population));
    
    return minSize + ((population - minPop) / (maxPop - minPop)) * (maxSize - minSize);
  };

  const getBubbleColor = (crisisScore: number): string => {
    // Color based on crisis severity
    if (crisisScore > 0.7) return '#ef4444'; // red
    if (crisisScore > 0.5) return '#f97316'; // orange
    if (crisisScore > 0.3) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const processedData = data.map(point => ({
    ...point,
    bubbleSize: getBubbleSize(point.population),
    fill: getBubbleColor(point.invisible_crisis_score)
  }));

  const handleDotClick = (data: any) => {
    if (onCountryClick && data.country_iso3) {
      onCountryClick(data.country_iso3);
    }
  };

  return (
    <div id="matrix-container" className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Invisible Crisis Matrix</h3>
        <p className="text-gray-600">
          Countries in the top-right quadrant have high health needs and large funding gaps - these are your "invisible crises."
        </p>
        <div className="flex flex-wrap gap-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Critical (Score &gt; 0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>High (Score &gt; 0.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Medium (Score &gt; 0.3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Low (Score &le; 0.3)</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={dimensions.height}>
        <ComposedChart
          data={processedData}
          margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            dataKey="health_needs"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={formatAxisLabel}
            label={{
              value: 'Health Needs (People in Need)',
              position: 'insideBottom',
              offset: -10,
              style: { textAnchor: 'middle' }
            }}
          />
          
          <YAxis
            dataKey="funding_gap"
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(value) => `$${formatAxisLabel(value)}`}
            label={{
              value: 'Funding Gap (USD)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference lines to show quadrants */}
          <ReferenceLine
            x={data.reduce((sum, d) => sum + d.health_needs, 0) / data.length}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            strokeWidth={1}
          />
          <ReferenceLine
            y={data.reduce((sum, d) => sum + d.funding_gap, 0) / data.length}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            strokeWidth={1}
          />
          
          <Scatter
            dataKey="funding_gap"
            fill="#8884d8"
            shape={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.bubbleSize / 10}
                  fill={payload.fill}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: 'pointer', opacity: 0.8 }}
                  onClick={() => handleDotClick(payload)}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-1">Top-Right Quadrant: Invisible Crises</h4>
          <p className="text-red-700">
            High needs + Large gaps = Most urgent attention required
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-1">Bottom-Left Quadrant: Managed Crises</h4>
          <p className="text-green-700">
            Lower needs + Smaller gaps = Better funding coverage
          </p>
        </div>
      </div>
    </div>
  );
};
