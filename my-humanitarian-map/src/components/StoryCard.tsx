import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Users, DollarSign, Activity } from 'lucide-react';
import type { CountryCrisis } from '../types/stories';

interface StoryCardProps {
  country: CountryCrisis;
  onClick?: () => void;
  compact?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({ country, onClick, compact = false }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toFixed(0);
  };

  const formatPercent = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (Math.abs(change) < 5) return <Activity className="w-4 h-4 text-gray-500" />;
    return change > 0 ? 
      <TrendingUp className="w-4 h-4 text-red-500" /> : 
      <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getSeverityColor = (rank: number): string => {
    if (rank <= 5) return 'border-red-500 bg-red-50';
    if (rank <= 10) return 'border-orange-500 bg-orange-50';
    if (rank <= 15) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-300 bg-white';
  };

  if (compact) {
    return (
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${getSeverityColor(country.crisis_rank)}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{country.country_iso3}</h3>
          <span className="text-sm font-semibold text-gray-600">#{country.crisis_rank}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-500" />
            <span>{formatNumber(country.health_in_need_24)} in need</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-500" />
            <span>{formatPercent(country.health_coverage)} funded</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${getSeverityColor(country.crisis_rank)}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{country.country_iso3}</h3>
          <p className="text-sm text-gray-600">Crisis Rank: #{country.crisis_rank}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-red-600">
            {country.invisible_crisis_score.toFixed(3)}
          </div>
          <p className="text-xs text-gray-500">Invisible Score</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg">
          <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
          <div className="font-semibold">{formatNumber(country.health_in_need_24)}</div>
          <p className="text-xs text-gray-600">Health Needs '24</p>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg">
          <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-500" />
          <div className="font-semibold">{formatPercent(country.health_coverage)}</div>
          <p className="text-xs text-gray-600">Health Coverage</p>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg">
          <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-500" />
          <div className="font-semibold">{formatNumber(country.health_gap)}</div>
          <p className="text-xs text-gray-600">Funding Gap</p>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg">
          <div className="flex items-center justify-center gap-1">
            {getTrendIcon(country.health_need_change_pct)}
            <span className="font-semibold">{country.health_need_change_pct.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-gray-600">Need Change</p>
        </div>
      </div>

      {/* Additional Context */}
      <div className="space-y-2 text-sm">
        {country.health_vs_food_coverage_gap && country.health_vs_food_coverage_gap > 0.1 && (
          <div className="flex items-center gap-2 p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-orange-800">
              Health funding {formatPercent(country.health_vs_food_coverage_gap)} lower than food
            </span>
          </div>
        )}
        
        {country.food_to_health_lag && (
          <div className="flex items-center gap-2 p-2 bg-yellow-100 rounded-lg">
            <Activity className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800">
              Food-to-Health lag pattern detected
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-gray-600">
          <span>Per person: ${country.health_funding_per_person_in_need.toFixed(2)}</span>
          <span>Food needs: {formatNumber(country.food_in_need_24)}</span>
        </div>
      </div>
    </div>
  );
};
