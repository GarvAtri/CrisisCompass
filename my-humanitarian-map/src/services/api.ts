import type { CountryCrisis, FundingFlow, TemporalTrend, CrisisMatrixPoint, CountryComparison, HealthVsFoodDisparity } from '../types/stories';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  async getInvisibleCrises(limit: number = 20): Promise<CountryCrisis[]> {
    return this.fetchWithErrorHandling<CountryCrisis[]>(`${API_BASE_URL}/api/stories/invisible-crises?limit=${limit}`);
  }

  async getFundingFlows(sector?: string): Promise<FundingFlow[]> {
    const url = sector 
      ? `${API_BASE_URL}/api/stories/funding-flows?sector=${sector}`
      : `${API_BASE_URL}/api/stories/funding-flows`;
    return this.fetchWithErrorHandling<FundingFlow[]>(url);
  }

  async getTemporalTrends(limit: number = 15): Promise<TemporalTrend[]> {
    return this.fetchWithErrorHandling<TemporalTrend[]>(`${API_BASE_URL}/api/stories/temporal-trends?limit=${limit}`);
  }

  async getCrisisMatrix(): Promise<CrisisMatrixPoint[]> {
    return this.fetchWithErrorHandling<CrisisMatrixPoint[]>(`${API_BASE_URL}/api/stories/crisis-matrix`);
  }

  async compareCountries(country1: string, country2: string): Promise<CountryComparison> {
    return this.fetchWithErrorHandling<CountryComparison>(`${API_BASE_URL}/api/stories/country-comparison/${country1}/${country2}`);
  }

  async getHealthVsFoodDisparity(): Promise<HealthVsFoodDisparity[]> {
    return this.fetchWithErrorHandling<HealthVsFoodDisparity[]>(`${API_BASE_URL}/api/stories/health-vs-food`);
  }
}

export const apiService = new ApiService();
