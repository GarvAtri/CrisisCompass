/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { type CountryData, getRiskColor, formatCurrency, formatNumber } from '../countries/countriesData';
import { X, Users, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';

interface CountryDetailsProps {
  country: CountryData;
  onClose: () => void;
}

export function CountryDetails({ country, onClose }: CountryDetailsProps) {
  // Sector breakdown data
  const sectorData = [
    { sector: 'Food Security', inNeed: country.metrics.inNeed.foodSecurity || 0, targeted: country.metrics.targeted.foodSecurity || 0, color: '#10b981' },
    { sector: 'Health', inNeed: country.metrics.inNeed.health || 0, targeted: country.metrics.targeted.health || 0, color: '#ef4444' },
    { sector: 'Nutrition', inNeed: country.metrics.inNeed.nutrition || 0, targeted: country.metrics.targeted.nutrition || 0, color: '#f59e0b' },
    { sector: 'Education', inNeed: country.metrics.inNeed.education || 0, targeted: country.metrics.targeted.education || 0, color: '#3b82f6' },
    { sector: 'WASH', inNeed: country.metrics.inNeed.wash || 0, targeted: country.metrics.targeted.wash || 0, color: '#06b6d4' }
  ].filter(s => s.inNeed > 0);

  // Funding pie chart data
  const fundingPieData = [
    { name: 'Funded', value: country.metrics.totalFunded, fill: '#22c55e' },
    { name: 'Gap', value: country.metrics.fundingGap, fill: '#ef4444' }
  ];

  // Coverage radar data
  const coverageData = sectorData.map(s => ({
    sector: s.sector,
    coverage: s.inNeed > 0 ? ((s.targeted / s.inNeed) * 100) : 0
  }));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl">{country.name}</h2>
              <span 
                className="px-3 py-1 rounded-full text-white text-sm capitalize"
                style={{ backgroundColor: getRiskColor(country.riskLevel) }}
              >
                {country.riskLevel} Risk
              </span>
            </div>
            <p className="text-gray-600">
              {country.metrics.inNeed.all ? `${formatNumber(country.metrics.inNeed.all)} people in need` : 'Humanitarian crisis'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Total Required</span>
              </div>
              <div className="text-2xl">{formatCurrency(country.metrics.totalRequired)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Total Funded</span>
              </div>
              <div className="text-2xl">{formatCurrency(country.metrics.totalFunded)}</div>
              <div className="text-xs text-green-600 mt-1">{country.metrics.fundingPercentage.toFixed(1)}% funded</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Funding Gap</span>
              </div>
              <div className="text-2xl">{formatCurrency(country.metrics.fundingGap)}</div>
            </div>
            {country.metrics.pooledBudget && country.metrics.pooledBudget > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Pooled Budget</span>
                </div>
                <div className="text-2xl">{formatCurrency(country.metrics.pooledBudget)}</div>
              </div>
            )}
          </div>

          {/* Funding Distribution */}
          <div>
            <h3 className="text-lg mb-4">Funding Distribution</h3>
            <div className="grid grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={fundingPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fundingPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Funding Coverage</div>
                  <div className="text-3xl">{country.metrics.fundingPercentage.toFixed(1)}%</div>
                </div>
                {country.metrics.pooledDependency !== undefined && (
                  <div>
                    <div className="text-sm text-gray-600">Pooled Dependency</div>
                    <div className="text-xl">{(country.metrics.pooledDependency * 100).toFixed(1)}%</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sector Needs Analysis */}
          {sectorData.length > 0 && (
            <div>
              <h3 className="text-lg mb-4">Sector Needs Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" angle={-15} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'People', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => formatNumber(value as number)} />
                  <Legend />
                  <Bar dataKey="inNeed" name="In Need" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targeted" name="Targeted" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Coverage Radar */}
          {coverageData.length > 0 && (
            <div>
              <h3 className="text-lg mb-4">Sector Coverage Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={coverageData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="sector" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Coverage %" dataKey="coverage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip formatter={(value: any) => `${(value as number).toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-sm text-gray-600 text-center">
                Percentage of people in need that are being targeted
              </div>
            </div>
          )}

          {/* Special Indicators */}
          <div>
            <h3 className="text-lg mb-4">Special Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              {country.metrics.neglectIndex !== undefined && country.metrics.neglectIndex > 0 && (
                <div className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Neglect Index</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((country.metrics.neglectIndex / 10) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm">{country.metrics.neglectIndex.toFixed(2)}</span>
                  </div>
                </div>
              )}
              {country.metrics.healthToFoodNeedRatio !== undefined && country.metrics.healthToFoodNeedRatio > 0 && (
                <div className="border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Health to Food Need Ratio</div>
                  <div className="text-lg">{country.metrics.healthToFoodNeedRatio.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {country.metrics.healthToFoodNeedRatio > 1 ? 'Health needs exceed food' : 'Food needs exceed health'}
                  </div>
                </div>
              )}
              {country.metrics.healthBudgetPerPerson !== undefined && country.metrics.healthBudgetPerPerson > 0 && (
                <div className="border border-gray-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Health Budget per Person</div>
                  <div className="text-lg">${country.metrics.healthBudgetPerPerson.toFixed(2)}</div>
                </div>
              )}
              {country.metrics.combinedSocialNeed !== undefined && country.metrics.combinedSocialNeed > 0 && (
                <div className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span>Combined Social Need</span>
                  </div>
                  <div className="text-lg">{formatNumber(country.metrics.combinedSocialNeed)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sector Breakdown Table */}
          {sectorData.length > 0 && (
            <div>
              <h3 className="text-lg mb-4">Detailed Sector Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Sector</th>
                      <th className="px-4 py-2 text-right">In Need</th>
                      <th className="px-4 py-2 text-right">Targeted</th>
                      <th className="px-4 py-2 text-right">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sectorData.map((sector) => {
                      const coverage = sector.inNeed > 0 ? (sector.targeted / sector.inNeed) * 100 : 0;
                      return (
                        <tr key={sector.sector} className="hover:bg-gray-50">
                          <td className="px-4 py-2 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                            {sector.sector}
                          </td>
                          <td className="px-4 py-2 text-right">{formatNumber(sector.inNeed)}</td>
                          <td className="px-4 py-2 text-right">{formatNumber(sector.targeted)}</td>
                          <td className="px-4 py-2 text-right">{coverage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}