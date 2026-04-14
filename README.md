# Cloud Carbon Tracker

Real-time cloud cost + CO₂ dashboard for engineers who care about environmental impact.

Track your AWS/GCP/Azure infrastructure's carbon footprint by region, get alerts when you're running on fossil fuels, and get actionable recommendations to cut both cost and emissions.

**Live demo:** coming soon · **Built by:** [MennovdLinde](https://github.com/MennovdLinde)

---

## What it does

- Pulls cloud usage data per region (compute hours, storage, data transfer)
- Calculates CO₂ emissions using real carbon intensity data (gCO₂eq/kWh per region)
- Shows a real-time dashboard: cost vs. carbon by region
- Fires alerts when a region runs mostly on fossil fuels
- Recommends greener regions, right-sizing, scheduling, and cold storage moves
- Works with **mock data out of the box** — plug in AWS/GCP credentials for live data

---

## Screenshots

> Dashboard showing 5 active regions, CO₂ bar chart, cost pie chart, alerts, and recommendations.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18 + TypeScript + Vite      |
| Backend  | Node.js + Express + TypeScript    |
| Charts   | Recharts                          |
| Data     | AWS Carbon Footprint Tool, Electricity Maps, IEA 2024 |
| Deploy   | Vercel (frontend) + Render (backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/MennovdLinde/Cloud-Carbon-Tracker.git
cd Cloud-Carbon-Tracker
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open `http://localhost:5173` — the dashboard loads immediately with mock data.

---

## API Endpoints

| Method | Endpoint                    | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/health`                   | Health check                             |
| GET    | `/api/carbon/summary`       | All regions: cost, CO₂, alerts, recs     |
| GET    | `/api/carbon/regions`       | All known regions with carbon intensity  |
| GET    | `/api/carbon/region/:id`    | Single region detailed breakdown         |

### Example response — `/api/carbon/summary`

```json
{
  "dataSource": "mock",
  "totals": {
    "monthlyCostUsd": 1266,
    "co2Kg": 94.8,
    "co2Tonnes": 0.095,
    "totalKwh": 251.6
  },
  "greenestAlternative": {
    "regionId": "europe-west6",
    "name": "GCP Europe West (Zurich)",
    "carbonIntensity": 28,
    "renewablePercent": 97
  },
  "alerts": [
    "High carbon grid: Virginia, USA runs at 415 gCO2/kWh — consider migrating to a greener region."
  ],
  "recommendations": [
    "Migrate to eu-north-1 (Stockholm, 45 gCO2/kWh) — up to 90% less CO2 for the same workload."
  ],
  "regions": [...]
}
```

---

## Carbon Intensity Data Sources

Carbon intensity figures (gCO₂eq/kWh) are sourced from:

- [AWS Customer Carbon Footprint Tool](https://aws.amazon.com/aws-cost-management/aws-customer-carbon-footprint-tool/)
- [Electricity Maps](https://electricitymaps.com/) — real-time grid carbon intensity
- [IEA Regional Averages 2024](https://www.iea.org/data-and-statistics)

| Region              | Provider | gCO₂/kWh | Renewable % |
|---------------------|----------|-----------|-------------|
| US East (Virginia)  | AWS      | 415       | 12%         |
| EU Central (Frankfurt) | AWS  | 350       | 38%         |
| EU West (Ireland)   | AWS      | 295       | 42%         |
| US West (Oregon)    | AWS      | 140       | 68%         |
| EU North (Stockholm)| AWS      | 45        | 95%         |
| Asia Pacific (Singapore) | AWS | 408      | 4%          |
| Asia Pacific (Tokyo)| AWS      | 480       | 22%         |
| GCP Zurich          | GCP      | 28        | 97%         |
| GCP Iowa            | GCP      | 380       | 22%         |
| GCP Finland         | GCP      | 55        | 90%         |

---

## Adding Live Cloud Credentials

By default the app runs on **mock data**. To connect real cloud accounts:

### AWS

1. Create an IAM user with read-only access to Cost Explorer and CloudWatch
2. Add to `backend/.env`:

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

3. The backend switches from mock to live AWS data automatically when these are present.

### GCP

1. Create a Service Account with `Billing Account Viewer` + `Cloud Monitoring Viewer` roles
2. Download the JSON key file
3. Add to `backend/.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json
GCP_PROJECT_ID=your-project-id
```

---

## Deployment

### Backend — Render

1. Create a new Web Service on [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in the Render dashboard

### Frontend — Vercel

1. Import the repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Set `VITE_API_URL` environment variable to your Render backend URL
4. Deploy

---

## Roadmap

- [ ] Live AWS Cost Explorer + CloudWatch integration
- [ ] Live GCP Billing API integration
- [ ] Azure integration
- [ ] Historical trend charts (30/90 day)
- [ ] Slack / email alerts
- [ ] Per-service breakdown (EC2, S3, RDS, Lambda)
- [ ] Export PDF report
- [ ] Docker Compose for local full-stack setup

---

## License

MIT — free to use, modify, and build on.

---

## Author

Built by [Menno van der Linde](https://github.com/MennovdLinde) as part of a green tech portfolio targeting sustainable software roles in Switzerland.

Part of a series:
- [greenwebaudit](https://github.com/MennovdLinde) — website carbon auditor (live)
- [green-audit-cli](https://github.com/MennovdLinde/green-audit-cli) — Rust CLI tool (live)
- **cloud-carbon-tracker** — this project
