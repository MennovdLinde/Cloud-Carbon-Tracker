// Mock cloud usage data — realistic figures for a mid-size startup
// When real AWS/GCP credentials are added, this file gets replaced
// by live API calls in services/cloudProvider.ts

export interface UsageRecord {
  regionId: string;
  computeHours: number;      // EC2/GCE instance hours per month
  storageGb: number;         // S3/GCS storage in GB
  dataTransferGb: number;    // Outbound data transfer in GB
  monthlyCostUsd: number;    // Actual cloud bill for this region
  instanceTypes: string[];   // What instance types are running
}

// Simulates a startup running workloads across 5 regions
export const mockUsage: UsageRecord[] = [
  {
    regionId: 'us-east-1',
    computeHours: 2160,   // 3x t3.medium running 24/7
    storageGb: 850,
    dataTransferGb: 120,
    monthlyCostUsd: 487,
    instanceTypes: ['t3.medium', 't3.medium', 'm5.large'],
  },
  {
    regionId: 'eu-central-1',
    computeHours: 720,    // 1x t3.large running 24/7
    storageGb: 300,
    dataTransferGb: 45,
    monthlyCostUsd: 198,
    instanceTypes: ['t3.large'],
  },
  {
    regionId: 'ap-southeast-1',
    computeHours: 1440,   // 2x t3.medium running 24/7
    storageGb: 120,
    dataTransferGb: 30,
    monthlyCostUsd: 312,
    instanceTypes: ['t3.medium', 't3.medium'],
  },
  {
    regionId: 'eu-west-1',
    computeHours: 720,
    storageGb: 200,
    dataTransferGb: 25,
    monthlyCostUsd: 165,
    instanceTypes: ['t3.medium'],
  },
  {
    regionId: 'us-west-2',
    computeHours: 480,
    storageGb: 150,
    dataTransferGb: 18,
    monthlyCostUsd: 104,
    instanceTypes: ['t3.small', 't3.small'],
  },
];

// kWh per compute hour per instance type (approximate averages)
// Based on cloud provider TDP data and utilization estimates
export const instanceKwhPerHour: Record<string, number> = {
  't3.nano':    0.005,
  't3.micro':   0.009,
  't3.small':   0.017,
  't3.medium':  0.034,
  't3.large':   0.068,
  't3.xlarge':  0.136,
  'm5.large':   0.077,
  'm5.xlarge':  0.154,
  'c5.large':   0.068,
  'c5.xlarge':  0.136,
  'default':    0.05,  // fallback
};
