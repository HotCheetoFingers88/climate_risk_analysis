# Climate Risk Analysis

A small Vercel-ready web app for exploring climate risk data: upload a CSV (or use the built-in sample) and get multiple regression, anomaly detection, and interactive charts in the browser.

## Features

- Upload your own CSV or run with built-in sample data
- Multiple regression (Temperature + Precipitation → RiskScore)
- Anomaly detection (2σ threshold)
- Interactive charts: timeline, scatter plots
- Full data table with error column
- Zero external Python dependencies (pure stdlib only)

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import that repo
3. No settings to change — Vercel auto-detects via `vercel.json`
4. Click **Deploy** ✓

## Local dev

```bash
npm i -g vercel
vercel dev
```
Then open http://localhost:3000

## CSV format

Your CSV must have these columns (header names exact):

```
Year,Temperature,Precipitation,RiskScore
1990,14.2,820,32.1
1991,14.5,790,33.4
...
```

## Project structure

```
├── api/
│   └── analyze.py        # Vercel serverless Python function — stats, regression, anomalies
├── public/
│   ├── index.html        # Single-page frontend (Sample Data / Analyze / Glossary tabs)
│   ├── script.js          # Tab switching, charts, fetch calls to the API
│   └── sample-data.json   # Built-in 21-year sample dataset (single source of truth)
├── climate_data.csv      # Example standalone CSV
├── data.sql              # Example SQL schema + queries for the same data shape
├── vercel.json            # Routing config
└── README.md
```

`sample-data.json` is the one place the sample dataset lives — `api/analyze.py` loads it at runtime instead of duplicating the rows as a hardcoded string, and `public/script.js` fetches it to render the preview table on the Sample Data tab.

## Usage

1. Open the app. The **Sample Data** tab shows the built-in dataset and column definitions.
2. Switch to **Analyze**, then either drop in your own CSV or click **Run Sample Data**.
3. The app calls `/api/analyze`, which fits a multiple linear regression (`RiskScore = b0 + b1·Temperature + b2·Precipitation`), flags anomalies (>2σ from the mean), and returns stats + per-row predictions.
4. Results render as summary stat cards, the regression equation, three charts (timeline + two scatter plots), and a full data table with per-year error.
5. The **Glossary** tab explains every metric (R², MSE, mean/median/σ, regression coefficients, anomaly threshold) in plain language.

## Files

- **api/analyze.py** — Pure-Python (stdlib only) linear regression, anomaly detection, and CSV parsing, served as a Vercel serverless function.
- **public/index.html** — Markup and styling for the three-tab UI.
- **public/script.js** — Client-side logic: tab switching, chart rendering (Chart.js), fetch calls to the API.
- **public/sample-data.json** — The built-in sample dataset, shared by both the frontend preview table and the API's sample-run endpoint.
- **climate_data.csv** / **data.sql** — Standalone example data and SQL for working with the same Year/Temperature/Precipitation/RiskScore shape outside the web app.
