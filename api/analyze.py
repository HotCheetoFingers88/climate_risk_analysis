from http.server import BaseHTTPRequestHandler
import json
import io
import csv
import math

# Pure-Python linear regression (no sklearn needed on Vercel)
def mean(vals):
    return sum(vals) / len(vals)

def linear_regression(X1, X2, y):
    n = len(y)
    mx1, mx2, my = mean(X1), mean(X2), mean(y)
    # Normal equations for multiple regression: y = b0 + b1*x1 + b2*x2
    Sx1x1 = sum((x - mx1)**2 for x in X1)
    Sx2x2 = sum((x - mx2)**2 for x in X2)
    Sx1x2 = sum((X1[i] - mx1)*(X2[i] - mx2) for i in range(n))
    Sx1y  = sum((X1[i] - mx1)*(y[i] - my) for i in range(n))
    Sx2y  = sum((X2[i] - mx2)*(y[i] - my) for i in range(n))

    denom = Sx1x1 * Sx2x2 - Sx1x2**2
    if denom == 0:
        b1, b2 = 0, 0
    else:
        b1 = (Sx2x2 * Sx1y - Sx1x2 * Sx2y) / denom
        b2 = (Sx1x1 * Sx2y - Sx1x2 * Sx1y) / denom
    b0 = my - b1 * mx1 - b2 * mx2

    predictions = [b0 + b1*X1[i] + b2*X2[i] for i in range(n)]
    ss_res = sum((y[i] - predictions[i])**2 for i in range(n))
    ss_tot = sum((yi - my)**2 for yi in y)
    r2 = 1 - ss_res/ss_tot if ss_tot != 0 else 0
    mse = ss_res / n

    return predictions, b0, b1, b2, r2, mse

def detect_anomalies(vals, threshold=2.0):
    m = mean(vals)
    variance = sum((v - m)**2 for v in vals) / len(vals)
    std = math.sqrt(variance)
    return [abs(v - m) > threshold * std for v in vals]

def parse_csv(text):
    reader = csv.DictReader(io.StringIO(text))
    rows = [r for r in reader if all(r.get(c, '').strip() for c in ['Temperature', 'Precipitation', 'RiskScore'])]
    years = []
    temps, precips, risks = [], [], []
    for r in rows:
        try:
            yr = str(r.get('Year', '')).strip()[:4]
            years.append(yr if yr else str(len(years)+1990))
            temps.append(float(r['Temperature']))
            precips.append(float(r['Precipitation']))
            risks.append(float(r['RiskScore']))
        except ValueError:
            continue
    return years, temps, precips, risks

SAMPLE_CSV = """Year,Temperature,Precipitation,RiskScore
1990,14.2,820,32.1
1991,14.5,790,33.4
1992,14.8,810,35.2
1993,15.1,760,37.8
1994,15.3,740,39.1
1995,15.7,720,41.5
1996,16.0,700,43.2
1997,16.2,680,45.8
1998,16.8,650,49.3
1999,17.1,630,52.1
2000,17.4,610,54.7
2001,17.6,590,57.2
2002,18.0,570,60.1
2003,18.3,550,63.4
2004,18.7,530,67.2
2005,19.1,510,71.0
2006,19.4,490,74.5
2007,19.8,470,78.3
2008,20.2,450,82.1
2009,20.6,430,86.4
2010,21.0,410,90.8
"""

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        years, temps, precips, risks = parse_csv(SAMPLE_CSV)
        self._run_and_respond(years, temps, precips, risks)

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            payload = json.loads(body)
            csv_text = payload.get('csv', SAMPLE_CSV)
        except Exception:
            csv_text = SAMPLE_CSV
        years, temps, precips, risks = parse_csv(csv_text)
        if len(years) < 4:
            self.send_response(400)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Need at least 4 valid rows with Year, Temperature, Precipitation, RiskScore columns.'}).encode())
            return
        self._run_and_respond(years, temps, precips, risks)

    def _run_and_respond(self, years, temps, precips, risks):
        predictions, b0, b1, b2, r2, mse = linear_regression(temps, precips, risks)
        anomalies = detect_anomalies(risks)

        m = mean(risks)
        variance = sum((v - m)**2 for v in risks) / len(risks)
        std = math.sqrt(variance)

        result = {
            'years': years,
            'temperatures': temps,
            'precipitations': precips,
            'actual_risk': risks,
            'predicted_risk': [round(p, 3) for p in predictions],
            'anomalies': anomalies,
            'stats': {
                'mean': round(m, 3),
                'median': round(sorted(risks)[len(risks)//2], 3),
                'std': round(std, 3),
                'mse': round(mse, 3),
                'r2': round(r2, 4),
                'b0': round(b0, 4),
                'b1_temp': round(b1, 4),
                'b2_precip': round(b2, 4),
                'n': len(risks),
                'n_anomalies': sum(anomalies),
                'temp_risk_corr': round(self._corr(temps, risks), 4),
                'precip_risk_corr': round(self._corr(precips, risks), 4),
            }
        }
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _corr(self, x, y):
        n = len(x)
        mx, my = mean(x), mean(y)
        num = sum((x[i]-mx)*(y[i]-my) for i in range(n))
        den = math.sqrt(sum((v-mx)**2 for v in x) * sum((v-my)**2 for v in y))
        return num/den if den else 0

    def log_message(self, format, *args):
        pass
    