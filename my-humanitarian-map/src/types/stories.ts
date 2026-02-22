export interface CountryCrisis {
  country_iso3: string;
  crisis_rank: number;
  invisible_crisis_score: number;
  health_in_need_24: number;
  health_in_need_25: number;
  health_need_change_pct: number;
  food_in_need_24: number;
  health_required: number;
  health_funded: number;
  health_gap: number;
  health_coverage: number;
  food_required?: number;
  food_funded?: number;
  food_coverage?: number;
  health_funding_per_person_in_need: number;
  health_vs_food_coverage_gap?: number;
  total_pop?: number;
  total_funding_per_capita?: number;
  food_to_health_lag: boolean;
}

export interface FundingFlow {
  source: string;
  destination: string;
  amount: number;
  sector: string;
}

export interface TemporalTrend {
  country_iso3: string;
  year_2024: number;
  year_2025: number;
  change_pct: number;
  trend: 'improving' | 'worsening' | 'stable';
}

export interface CrisisMatrixPoint {
  country_iso3: string;
  health_needs: number;
  funding_gap: number;
  population: number;
  invisible_crisis_score: number;
  health_coverage: number;
  crisis_rank: number;
}

export interface CountryComparison {
  countries: CountryCrisis[];
}

export interface HealthVsFoodDisparity {
  country_iso3: string;
  health_coverage: number;
  food_coverage: number;
  health_vs_food_coverage_gap: number;
  health_in_need_24: number;
  food_in_need_24: number;
  invisible_crisis_score: number;
}

export interface StorySection {
  id: string;
  title: string;
  narrative: string;
  chartType: 'invisible-crises' | 'funding-flows' | 'temporal-trends' | 'crisis-matrix' | 'health-vs-food';
  dataEndpoint: string;
  scrollTrigger: number;
}
