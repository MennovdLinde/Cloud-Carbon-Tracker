export interface RegionResult {
  regionId: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  regionName: string;
  location: string;
  carbonIntensity: number;
  renewablePercent: number;
  rating: 'green' | 'yellow' | 'red';
  computeKwh: number;
  totalKwh: number;
  co2Kg: number;
  co2Tonnes: number;
  monthlyCostUsd: number;
  costPerKgCo2: number;
  instanceTypes: string[];
  alerts: string[];
  recommendations: string[];
}

export interface GreenestAlternative {
  regionId: string;
  name: string;
  carbonIntensity: number;
  renewablePercent: number;
}

export interface SummaryData {
  generatedAt: string;
  dataSource: string;
  gcpConnected: boolean;
  totals: {
    monthlyCostUsd: number;
    co2Kg: number;
    co2Tonnes: number;
    totalKwh: number;
  };
  greenestAlternative: GreenestAlternative | null;
  alerts: string[];
  recommendations: string[];
  regions: RegionResult[];
}
