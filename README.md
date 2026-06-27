 # Climate Risk Analysis Tool

## Overview

The **Climate Risk Analysis Tool** is a Python-based project designed to analyze climate data and assess the potential risk of environmental changes based on key climate metrics like temperature, precipitation, and risk scores. This tool uses a combination of statistical analysis, anomaly detection, clustering, and machine learning techniques to provide insights into climate risk.

The tool can process historical climate data, calculate important statistical metrics, detect anomalies, and generate visualizations to aid in understanding the impact of climate change over time.

## Features

### 1. **Data Preprocessing**
- **Load and Clean Data**: Reads climate data from a CSV file, drops rows with missing values, and ensures correct data formats (e.g., date conversion).
- **Data Selection**: Selects relevant features such as `Temperature`, `Precipitation`, and `RiskScore` for further analysis.

### 2. **Statistical Analysis**
- **Mean, Median, Mode**: Computes basic statistical metrics to summarize the climate data.
- **Skewness**: Measures the asymmetry of the data distribution.
- **Correlation**: Calculates correlations between different features (e.g., between temperature and risk score).
  
### 3. **Anomaly Detection**
- Identifies outliers or unusual data points in the climate dataset using statistical methods.

### 4. **Clustering**
- **K-Means Clustering**: Groups climate data into clusters based on temperature and precipitation, helping identify patterns and correlations that could represent different risk levels.

### 5. **Machine Learning Model**
- **Linear Regression**: Predicts the `RiskScore` based on `Temperature` and `Precipitation`. The model is trained on historical data to predict future climate risk.

### 6. **Visualization**
- **Scatter Plots**: Visualizes the relationship between temperature and risk scores (actual vs predicted).
- **Trend Line**: Shows how risk scores change over time.
- **Histograms**: Displays the distribution of key statistical metrics such as mean, median, and mode.
- **Anomaly Detection Plot**: Visualizes outliers detected in the dataset.

## Installation

### Requirements
- **Python 3.x**
- **Fortran compiler** (e.g., `gfortran`)
- **Libraries**: pandas, numpy, matplotlib, scikit-learn, meson (for Fortran extensions)
- **GitHub Desktop** (for version control)

### Setting Up the Environment

# Climate Risk Analysis — Web Version

A Vercel-ready web app that replicates the climate_risk_analysis_tool.py functionality in the browser.

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
│   └── analyze.py      # Vercel serverless Python function
├── public/
│   └── index.html      # Single-page frontend
├── vercel.json         # Routing config
└── README.md
```
   ```

## Usage

### Running the Climate Risk Analysis

1. **Prepare your climate data** in a CSV file format with the following columns:
   - `Year`: The year of the data point (should be in `YYYY` format).
   - `Temperature`: The average temperature for that year.
   - `Precipitation`: The total precipitation for that year.
   - `RiskScore`: The calculated or expected risk score for that year.

2. **Run the script**:
   To analyze the climate risk, run the following command:
   ```bash
   python climate_risk_analysis_tool.py
   ```

   The script will:
   - Load the CSV file containing climate data.
   - Preprocess and clean the data.
   - Perform statistical analysis, including calculating mean, median, mode, skewness, and correlation.
   - Apply anomaly detection to find unusual data points.
   - Use K-means clustering to identify patterns in the data.
   - Train a machine learning model (linear regression) to predict the risk score based on temperature and precipitation.
   - Generate visualizations that compare actual vs predicted risk scores, display statistical distributions, and highlight anomalies.

### Sample Output
Once the script is executed, you will see:
- **Visualizations**: Plots displaying the actual vs predicted risk, temperature vs risk, and trend lines showing risk score changes over time.
- **Statistical Output**: Printed values for mean, median, mode, and correlation of the dataset.
- **Anomaly Detection**: A plot showing any detected anomalies (outliers).
  
## Files

- **climate_risk_analysis_tool.py**: The main Python script that performs data analysis and generates visualizations.
- **normalize.f90**: (If applicable) Fortran code used for data normalization.
- **requirements.txt**: A list of Python dependencies required for the project.
- **meson.build**: (If applicable) Meson build configuration for compiling Fortran code.

## Visualizations

The tool generates the following visualizations to help understand the climate risk analysis:

- **Actual vs Predicted Risk**: Scatter plots showing how predicted risk scores compare to the actual ones.
- **Risk Over Time**: Trend lines showing how risk scores change year-over-year.
- **Statistical Distributions**: Histograms for mean, median, and mode values.
- **Anomaly Detection**: A plot of outliers or anomalies detected in the climate data.
