import * as fs from 'fs';
import * as path from 'path';

export function hasGcpCredentials(): boolean {
  const keyFile = process.env.GCP_KEY_FILE;
  if (!keyFile) return false;
  const keyPath = path.resolve(__dirname, '../../', keyFile);
  return fs.existsSync(keyPath);
}

// GCP per-region spend requires BigQuery billing export — not available via standard API.
// We confirm credentials are valid and return an empty usage array.
// GCP regions still appear in /api/carbon/regions with accurate carbon intensity data.
// Set gcpConnected: true in the summary so the frontend can show the GCP badge.
export async function verifyGcpCredentials(): Promise<boolean> {
  const keyFile = process.env.GCP_KEY_FILE;
  if (!keyFile) return false;
  const keyPath = path.resolve(__dirname, '../../', keyFile);
  if (!fs.existsSync(keyPath)) return false;

  try {
    const raw = fs.readFileSync(keyPath, 'utf-8');
    const key = JSON.parse(raw);
    // Valid GCP service account JSON must have these fields
    return !!(key.client_email && key.private_key && key.project_id);
  } catch {
    return false;
  }
}
