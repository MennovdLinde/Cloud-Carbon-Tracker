import { Region, getRatingLabel } from '../data/regions';
import { UsageRecord, instanceKwhPerHour } from '../data/mock';

export interface CarbonResult {
  regionId: string;
  provider: string;
  regionName: string;
  location: string;
  carbonIntensity: number;       // gCO2eq/kWh
  renewablePercent: number;
  rating: 'green' | 'yellow' | 'red';
  computeKwh: number;            // kWh used by compute
  totalKwh: number;              // total kWh (compute + storage overhead)
  co2Kg: number;                 // kg CO2 this month
  co2Tonnes: number;             // tonnes CO2 this month
  monthlyCostUsd: number;
  costPerKgCo2: number;          // cost efficiency: $ per kg CO2 produced
  instanceTypes: string[];
  alerts: string[];
  recommendations: string[];
}

// Storage energy: ~0.0013 kWh per GB per month (HDD-based, rough average)
const KWH_PER_GB_STORAGE = 0.0013;

// Data transfer energy: ~0.06 kWh per GB (CDN + networking overhead)
const KWH_PER_GB_TRANSFER = 0.06;

function calcComputeKwh(usage: UsageRecord): number {
  let totalKwh = 0;
  const instancesPerType: Record<string, number> = {};

  for (const type of usage.instanceTypes) {
    instancesPerType[type] = (instancesPerType[type] || 0) + 1;
  }

  const hoursPerInstance = usage.computeHours / usage.instanceTypes.length;

  for (const [type, count] of Object.entries(instancesPerType)) {
    const kwhPerHour = instanceKwhPerHour[type] ?? instanceKwhPerHour['default'];
    totalKwh += kwhPerHour * hoursPerInstance * count;
  }

  return Math.round(totalKwh * 10) / 10;
}

function buildAlerts(region: Region, co2Kg: number, usage: UsageRecord): string[] {
  const alerts: string[] = [];

  if (region.carbonIntensity > 400) {
    alerts.push(
      `High carbon grid: ${region.location} runs at ${region.carbonIntensity} gCO2/kWh — consider migrating to a greener region.`
    );
  }

  if (region.renewablePercent < 15) {
    alerts.push(
      `Only ${region.renewablePercent}% renewable energy in ${region.location}. Your workload emits ${co2Kg.toFixed(1)} kg CO2/month here.`
    );
  }

  if (co2Kg > 200) {
    alerts.push(
      `This region accounts for ${co2Kg.toFixed(0)} kg CO2/month — your biggest carbon hotspot.`
    );
  }

  if (usage.dataTransferGb > 100) {
    alerts.push(
      `High data transfer (${usage.dataTransferGb} GB/mo) — consider a CDN or edge caching to reduce transfer and energy use.`
    );
  }

  return alerts;
}

function buildRecommendations(region: Region, usage: UsageRecord): string[] {
  const recs: string[] = [];

  if (region.carbonIntensity > 350) {
    const greenerAlts: Record<string, string> = {
      'us-east-1':       'eu-north-1 (Stockholm, 45 gCO2/kWh) or us-west-2 (Oregon, 140 gCO2/kWh)',
      'eu-central-1':    'eu-north-1 (Stockholm, 45 gCO2/kWh)',
      'ap-southeast-1':  'europe-west6 (Zurich, 28 gCO2/kWh) or eu-north-1 (Stockholm)',
      'ap-northeast-1':  'eu-north-1 (Stockholm, 45 gCO2/kWh)',
      'us-central1':     'europe-north1 (Finland, 55 gCO2/kWh)',
    };
    const alt = greenerAlts[region.id];
    if (alt) {
      recs.push(`Migrate to ${alt} — up to 90% less CO2 for the same workload.`);
    }
  }

  if (usage.computeHours > 1440 && usage.instanceTypes.length > 1) {
    recs.push(
      `Schedule batch jobs during off-peak hours (nights/weekends) when grid carbon intensity is typically 10-30% lower.`
    );
  }

  if (usage.storageGb > 500) {
    recs.push(
      `${usage.storageGb} GB stored — move infrequently accessed data to cold storage (e.g. S3 Glacier) to cut both cost and energy by ~75%.`
    );
  }

  if (usage.instanceTypes.includes('m5.large') || usage.instanceTypes.includes('c5.xlarge')) {
    recs.push(
      `Consider right-sizing: replace on-demand instances with Spot/Preemptible instances for fault-tolerant workloads — saves up to 90% cost and energy.`
    );
  }

  if (region.renewablePercent < 30) {
    recs.push(
      `Purchase Renewable Energy Certificates (RECs) or ask your cloud provider about 100% renewable energy commitment for this region.`
    );
  }

  return recs;
}

export function calculateCarbon(usage: UsageRecord, region: Region): CarbonResult {
  const computeKwh = calcComputeKwh(usage);
  const storageKwh = usage.storageGb * KWH_PER_GB_STORAGE;
  const transferKwh = usage.dataTransferGb * KWH_PER_GB_TRANSFER;
  const totalKwh = computeKwh + storageKwh + transferKwh;

  // CO2 = kWh × gCO2/kWh → convert grams to kg
  const co2Kg = (totalKwh * region.carbonIntensity) / 1000;
  const co2Tonnes = co2Kg / 1000;

  const costPerKgCo2 = co2Kg > 0
    ? Math.round((usage.monthlyCostUsd / co2Kg) * 100) / 100
    : 0;

  const alerts = buildAlerts(region, co2Kg, usage);
  const recommendations = buildRecommendations(region, usage);

  return {
    regionId: region.id,
    provider: region.provider,
    regionName: region.name,
    location: region.location,
    carbonIntensity: region.carbonIntensity,
    renewablePercent: region.renewablePercent,
    rating: getRatingLabel(region.carbonIntensity),
    computeKwh: Math.round(computeKwh * 10) / 10,
    totalKwh: Math.round(totalKwh * 10) / 10,
    co2Kg: Math.round(co2Kg * 10) / 10,
    co2Tonnes: Math.round(co2Tonnes * 1000) / 1000,
    monthlyCostUsd: usage.monthlyCostUsd,
    costPerKgCo2,
    instanceTypes: usage.instanceTypes,
    alerts,
    recommendations,
  };
}
