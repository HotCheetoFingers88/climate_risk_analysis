# Climate Risk Analysis

A Vercel-ready app that pulls **real historical climate data from NOAA** for four US cities, lets you
define what "climate risk" means via two adjustable weights, and runs a live multiple regression +
anomaly detection on the result. Frontend is React (Vite); the data/stats layer is a set of Python
serverless functions.

## What's real vs. computed

- **Real**: Year, average temperature, and total precipitation come straight from NOAA's Global Summary
  of the Year (GSOY) dataset for the selected station.
- **Computed**: NOAA doesn't publish a "climate risk score" — there isn't a universal definition of one.
  RiskScore here is a transparent z-score blend of temperature and precipitation, weighted by two sliders
  you control (see the Glossary tab for the exact formula). This is a deliberate design choice, not a
  limitation we're hiding: "risk" depends on what you're protecting against, so the weights are yours to set.

## Cities / stations

| City | NOAA Station |
|---|---|
| New York (Central Park) | GHCND:USW00094728 |
| Chicago (O'Hare) | GHCND:USW00094846 |
| Phoenix (Sky Harbor) | GHCND:USW00023183 |
| Seattle-Tacoma | GHCND:USW00024233 |

## Project structure

```
├── api/
│   ├── cities.py          # Static preset city/station list
│   ├── climate.py         # Fetches + cleans real NOAA GSOY data for one city
│   ├── analyze.py         # Regression + anomaly detection (real data or CSV upload)
│   ├── sample-data.json   # Legacy synthetic dataset, used by the Upload/Sample tab
│   └── requirements.txt   # Empty on purpose — stdlib only
├── src/
│   ├── components/        # CityPicker, WeightControls, Analyze, UploadCsv, Glossary, charts, etc.
│   ├── hooks/              # useClimateData, useAnalysis
│   ├── lib/riskScore.js    # The user-adjustable RiskScore formula
│   ├── App.jsx / App.css   # Tab shell + layout (same cream/olive palette as the original design)
│   └── main.jsx
├── public/
│   └── sample-data.json    # Same legacy dataset, served as a static asset
├── .env.example             # Documents NOAA_TOKEN — copy to .env for local dev
└── vercel.json               # SPA rewrite only; Vercel auto-detects Vite + /api/*.py
```

## Setup

### 1. Get a free NOAA token

Go to https://www.ncdc.noaa.gov/cdo-web/token, enter your email, and you'll get a token in seconds.
Rate limit is 5 requests/sec and 10,000/day — far more than this app needs.

### 2. Set the environment variable

**Local dev:**
```bash
cp .env.example .env
# edit .env and paste your token in place of your_noaa_token_here
```

**On Vercel:** Project Settings → Environment Variables → add `NOAA_TOKEN` with your token as the value.
Never commit your real token — `.env` is already gitignored.

### 3. Install and run

```bash
npm install
npm run dev        # Vite dev server (frontend only)
# or, to also run the Python API locally:
npm i -g vercel
vercel dev
```

### 4. Deploy

```bash
vercel
```
Or push to GitHub and import the repo at vercel.com — no build settings to change, Vercel auto-detects
the Vite frontend and the Python functions under `api/`.

## How real-world data gets handled

NOAA station records aren't perfectly clean. `api/climate.py`:
- Fetches TMAX, TMIN, and PRCP separately per year (that's how the API is structured) and pages through
  results since NOAA caps each response at 1000 rows.
- Converts NOAA's metric units (tenths of °C, tenths of mm) to plain °C/mm.
- **Drops any year missing one of the three values** rather than interpolating or zero-filling — silently
  guessing would distort the regression. The app tells you how many years were skipped and why.
- Returns a clear error (not a silent empty result) if a station has too little usable data in the
  requested range.

## Tabs

- **Live Climate Data** — pick a city, adjust the RiskScore weights, see real NOAA data analyzed live.
- **Upload / Sample** — bring your own CSV, or run the original synthetic 21-year example.
- **Glossary** — explains every metric, the regression model, and exactly how RiskScore is computed.
