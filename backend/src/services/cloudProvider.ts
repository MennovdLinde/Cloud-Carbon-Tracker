import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  Granularity,
  GroupDefinitionType,
} from '@aws-sdk/client-cost-explorer';
import { UsageRecord } from '../data/mock';

// Map AWS region codes to our region IDs (same format)
const SUPPORTED_REGIONS = new Set([
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'eu-north-1',
  'ap-southeast-1',
  'ap-northeast-1',
]);

function getDateRange(): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0]; // today YYYY-MM-DD
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]; // first of current month
  return { start, end };
}

export async function fetchAwsUsage(): Promise<UsageRecord[]> {
  const key = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'eu-central-1';

  if (!key || !secret || key === 'your_key_here') {
    return []; // no creds — caller falls back to mock
  }

  const client = new CostExplorerClient({
    region: 'us-east-1', // Cost Explorer API only available in us-east-1
    credentials: { accessKeyId: key, secretAccessKey: secret },
  });

  const { start, end } = getDateRange();

  const command = new GetCostAndUsageCommand({
    TimePeriod: { Start: start, End: end },
    Granularity: Granularity.MONTHLY,
    GroupBy: [{ Type: GroupDefinitionType.DIMENSION, Key: 'REGION' }],
    Metrics: ['UnblendedCost'],
  });

  const response = await client.send(command);
  const results: UsageRecord[] = [];

  for (const group of response.ResultsByTime?.[0]?.Groups ?? []) {
    const regionId = group.Keys?.[0] ?? '';
    if (!SUPPORTED_REGIONS.has(regionId)) continue;

    const costStr = group.Metrics?.UnblendedCost?.Amount ?? '0';
    const monthlyCostUsd = parseFloat(costStr);

    if (monthlyCostUsd < 0.01) continue; // skip near-zero regions

    // Cost Explorer doesn't give instance hours directly.
    // Estimate compute hours from cost: assume ~$0.04/hr average (t3.medium equivalent)
    const estimatedComputeHours = Math.round((monthlyCostUsd * 0.65) / 0.04); // 65% of bill = compute
    const estimatedStorageGb = Math.round((monthlyCostUsd * 0.2) / 0.023); // 20% of bill = S3 (~$0.023/GB)
    const estimatedTransferGb = Math.round((monthlyCostUsd * 0.05) / 0.09); // 5% of bill = transfer

    results.push({
      regionId,
      computeHours: Math.max(estimatedComputeHours, 1),
      storageGb: Math.max(estimatedStorageGb, 1),
      dataTransferGb: Math.max(estimatedTransferGb, 0),
      monthlyCostUsd: Math.round(monthlyCostUsd * 100) / 100,
      instanceTypes: ['default'], // Cost Explorer doesn't surface this without extra call
    });
  }

  return results;
}

export function hasAwsCredentials(): boolean {
  const key = process.env.AWS_ACCESS_KEY_ID;
  return !!key && key !== 'your_key_here';
}
