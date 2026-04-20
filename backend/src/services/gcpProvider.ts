import * as fs from 'fs';
import * as path from 'path';

function getGcpKeyJson(): Record<string, string> | null {
  // Priority 1: GCP_KEY_BASE64 env var (used on Heroku — avoids escaping issues)
  const keyBase64 = process.env.GCP_KEY_BASE64;
  if (keyBase64) {
    try {
      return JSON.parse(Buffer.from(keyBase64, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }

  // Priority 2: GCP_KEY_JSON env var (raw JSON string)
  const keyJson = process.env.GCP_KEY_JSON;
  if (keyJson) {
    try {
      return JSON.parse(keyJson);
    } catch {
      return null;
    }
  }

  // Priority 2: GCP_KEY_FILE path (used locally)
  const keyFile = process.env.GCP_KEY_FILE;
  if (keyFile) {
    const keyPath = path.resolve(__dirname, '../../', keyFile);
    if (fs.existsSync(keyPath)) {
      try {
        return JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function hasGcpCredentials(): boolean {
  return getGcpKeyJson() !== null;
}

// GCP per-region spend requires BigQuery billing export — not available via standard API.
// We confirm credentials are valid and return an empty usage array.
// GCP regions still appear in /api/carbon/regions with accurate carbon intensity data.
export async function verifyGcpCredentials(): Promise<boolean> {
  const key = getGcpKeyJson();
  if (!key) return false;
  return !!(key.client_email && key.private_key && key.project_id);
}
