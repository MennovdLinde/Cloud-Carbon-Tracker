import { Router, Request, Response } from 'express';
import { regions, getRegionById } from '../data/regions';
import { mockUsage } from '../data/mock';
import { calculateCarbon, CarbonResult } from '../services/carbonCalc';
import { fetchAwsUsage, hasAwsCredentials } from '../services/cloudProvider';
import { hasGcpCredentials, verifyGcpCredentials } from '../services/gcpProvider';

const router = Router();

// GET /api/carbon/summary
// Returns carbon + cost data for all active regions
router.get('/summary', async (_req: Request, res: Response) => {
  let usageData = mockUsage;
  const sources: string[] = [];

  // Try AWS
  if (hasAwsCredentials()) {
    try {
      const awsData = await fetchAwsUsage();
      if (awsData.length > 0) {
        usageData = awsData;
        sources.push('aws');
      }
    } catch (err) {
      console.error('AWS fetch failed:', err);
    }
  }

  // GCP: verify credentials only — per-region spend needs BigQuery export
  // GCP regions appear in /api/carbon/regions with accurate carbon intensity data
  let gcpConnected = false;
  if (hasGcpCredentials()) {
    gcpConnected = await verifyGcpCredentials();
    if (gcpConnected) sources.push('gcp');
  }

  const dataSource = sources.length > 0 ? sources.join('+') : 'mock';

  const results: CarbonResult[] = [];

  for (const usage of usageData) {
    const region = getRegionById(usage.regionId);
    if (!region) continue;
    results.push(calculateCarbon(usage, region));
  }

  const totalCostUsd = results.reduce((sum, r) => sum + r.monthlyCostUsd, 0);
  const totalCo2Kg = results.reduce((sum, r) => sum + r.co2Kg, 0);
  const totalKwh = results.reduce((sum, r) => sum + r.totalKwh, 0);
  const allAlerts = results.flatMap((r) => r.alerts);
  const allRecs = results.flatMap((r) => r.recommendations);

  // Greenest alternative: find the region we're NOT in with lowest carbon intensity
  const activeIds = new Set(results.map((r) => r.regionId));
  const greenestAlternative = regions
    .filter((r) => !activeIds.has(r.id))
    .sort((a, b) => a.carbonIntensity - b.carbonIntensity)[0];

  res.json({
    generatedAt: new Date().toISOString(),
    dataSource,
    gcpConnected,
    totals: {
      monthlyCostUsd: Math.round(totalCostUsd * 100) / 100,
      co2Kg: Math.round(totalCo2Kg * 10) / 10,
      co2Tonnes: Math.round((totalCo2Kg / 1000) * 1000) / 1000,
      totalKwh: Math.round(totalKwh * 10) / 10,
    },
    greenestAlternative: greenestAlternative
      ? {
          regionId: greenestAlternative.id,
          name: greenestAlternative.name,
          carbonIntensity: greenestAlternative.carbonIntensity,
          renewablePercent: greenestAlternative.renewablePercent,
        }
      : null,
    alerts: allAlerts,
    recommendations: [...new Set(allRecs)], // deduplicate
    regions: results,
  });
});

// GET /api/carbon/regions
// Returns all known regions with carbon intensity data (not just active ones)
router.get('/regions', (_req: Request, res: Response) => {
  const allRegions = regions.map((r) => ({
    ...r,
    rating: r.carbonIntensity < 150 ? 'green' : r.carbonIntensity <= 350 ? 'yellow' : 'red',
  }));
  res.json(allRegions);
});

// GET /api/carbon/region/:id
// Returns detailed carbon data for a single region
router.get('/region/:id', (req: Request, res: Response) => {
  const region = getRegionById(req.params.id);
  if (!region) {
    res.status(404).json({ error: 'Region not found' });
    return;
  }

  const usage = mockUsage.find((u) => u.regionId === req.params.id);
  if (!usage) {
    res.status(404).json({ error: 'No usage data for this region' });
    return;
  }

  res.json(calculateCarbon(usage, region));
});

export default router;
