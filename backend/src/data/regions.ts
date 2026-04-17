// Carbon intensity data based on public datasets:
// - AWS Carbon Footprint Tool (2024)
// - Electricity Maps (electricitymaps.com)
// - IEA regional grid averages
// Unit: gCO2eq per kWh

export interface Region {
  id: string;
  provider: 'AWS' | 'GCP' | 'Azure';
  name: string;
  location: string;
  country: string;
  carbonIntensity: number; // gCO2eq/kWh
  renewablePercent: number; // % renewable energy
  energyCostPerKwh: number; // USD
}

export const regions: Region[] = [
  // AWS Regions
  {
    id: 'us-east-1',
    provider: 'AWS',
    name: 'US East (N. Virginia)',
    location: 'Virginia, USA',
    country: 'US',
    carbonIntensity: 415,
    renewablePercent: 12,
    energyCostPerKwh: 0.08,
  },
  {
    id: 'us-west-2',
    provider: 'AWS',
    name: 'US West (Oregon)',
    location: 'Oregon, USA',
    country: 'US',
    carbonIntensity: 140,
    renewablePercent: 68,
    energyCostPerKwh: 0.07,
  },
  {
    id: 'eu-west-1',
    provider: 'AWS',
    name: 'Europe (Ireland)',
    location: 'Dublin, Ireland',
    country: 'IE',
    carbonIntensity: 295,
    renewablePercent: 42,
    energyCostPerKwh: 0.12,
  },
  {
    id: 'eu-central-1',
    provider: 'AWS',
    name: 'Europe (Frankfurt)',
    location: 'Frankfurt, Germany',
    country: 'DE',
    carbonIntensity: 350,
    renewablePercent: 38,
    energyCostPerKwh: 0.14,
  },
  {
    id: 'eu-north-1',
    provider: 'AWS',
    name: 'Europe (Stockholm)',
    location: 'Stockholm, Sweden',
    country: 'SE',
    carbonIntensity: 45,
    renewablePercent: 95,
    energyCostPerKwh: 0.06,
  },
  {
    id: 'ap-southeast-1',
    provider: 'AWS',
    name: 'Asia Pacific (Singapore)',
    location: 'Singapore',
    country: 'SG',
    carbonIntensity: 408,
    renewablePercent: 4,
    energyCostPerKwh: 0.19,
  },
  {
    id: 'ap-northeast-1',
    provider: 'AWS',
    name: 'Asia Pacific (Tokyo)',
    location: 'Tokyo, Japan',
    country: 'JP',
    carbonIntensity: 480,
    renewablePercent: 22,
    energyCostPerKwh: 0.18,
  },
  // GCP Regions
  {
    id: 'europe-west6',
    provider: 'GCP',
    name: 'GCP Europe West (Zurich)',
    location: 'Zurich, Switzerland',
    country: 'CH',
    carbonIntensity: 28,
    renewablePercent: 97,
    energyCostPerKwh: 0.13,
  },
  {
    id: 'us-central1',
    provider: 'GCP',
    name: 'GCP US Central (Iowa)',
    location: 'Iowa, USA',
    country: 'US',
    carbonIntensity: 380,
    renewablePercent: 22,
    energyCostPerKwh: 0.06,
  },
  {
    id: 'europe-north1',
    provider: 'GCP',
    name: 'GCP Europe North (Finland)',
    location: 'Hamina, Finland',
    country: 'FI',
    carbonIntensity: 55,
    renewablePercent: 90,
    energyCostPerKwh: 0.07,
  },
];

export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id);
}

export function getRatingLabel(carbonIntensity: number): 'green' | 'yellow' | 'red' {
  if (carbonIntensity < 150) return 'green';
  if (carbonIntensity <= 350) return 'yellow';
  return 'red';
}
