from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, urlencode
import urllib.request
import urllib.error
import json
import os

from cities import CITIES

NOAA_BASE = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data'
DEFAULT_START_YEAR = 1995
DEFAULT_END_YEAR = 2024


def _city_by_id(city_id):
    for c in CITIES:
        if c['id'] == city_id:
            return c
    return None


def _fetch_noaa_page(station, datatype, start_year, end_year, token, offset=1, limit=1000):
    """Fetch one page of GSOY data for a single datatype (TMAX, TMIN, or PRCP).
    NOAA paginates at up to 1000 results per request."""
    params = {
        'datasetid': 'GSOY',
        'stationid': station,
        'datatypeid': datatype,
        'startdate': f'{start_year}-01-01',
        'enddate': f'{end_year}-12-31',
        'units': 'metric',
        'limit': limit,
        'offset': offset,
    }
    url = f'{NOAA_BASE}?{urlencode(params)}'
    req = urllib.request.Request(url, headers={'token': token})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def _fetch_all_years(station, datatype, start_year, end_year, token):
    """Page through NOAA results and return {year: value}. Real NOAA data is
    messy: some years are missing entirely, some stations report a given
    datatype only for part of the requested range, and results arrive
    paginated rather than as one blob."""
    by_year = {}
    offset = 1
    while True:
        data = _fetch_noaa_page(station, datatype, start_year, end_year, token, offset=offset)
        results = data.get('results', [])
        if not results:
            break
        for row in results:
            year = int(row['date'][:4])
            by_year[year] = row['value']
        count = data.get('metadata', {}).get('resultset', {}).get('count', len(results))
        offset += len(results)
        if offset > count or len(results) == 0:
            break
    return by_year


def _build_clean_series(station, start_year, end_year, token):
    """Combine TMAX/TMIN/PRCP into one aligned series, dropping any year that
    doesn't have all three values rather than guessing or zero-filling --
    that would quietly distort the regression."""
    tmax_by_year = _fetch_all_years(station, 'TMAX', start_year, end_year, token)
    tmin_by_year = _fetch_all_years(station, 'TMIN', start_year, end_year, token)
    prcp_by_year = _fetch_all_years(station, 'PRCP', start_year, end_year, token)

    years = sorted(set(tmax_by_year) & set(tmin_by_year) & set(prcp_by_year))
    skipped = sorted((set(range(start_year, end_year + 1)) - set(years)))

    out_years, out_temp, out_precip = [], [], []
    for y in years:
        # NOAA metric units: temperature in tenths of °C, precip in tenths of mm
        avg_temp_c = (tmax_by_year[y] + tmin_by_year[y]) / 2 / 10
        precip_mm = prcp_by_year[y] / 10
        out_years.append(y)
        out_temp.append(round(avg_temp_c, 2))
        out_precip.append(round(precip_mm, 1))

    return {
        'years': out_years,
        'temperatures': out_temp,
        'precipitations': out_precip,
        'years_skipped': skipped,
        'years_requested': end_year - start_year + 1,
        'years_returned': len(out_years),
    }


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        city_id = query.get('city', [None])[0]
        start_year = int(query.get('start', [DEFAULT_START_YEAR])[0])
        end_year = int(query.get('end', [DEFAULT_END_YEAR])[0])

        city = _city_by_id(city_id)
        if not city:
            return self._error(400, f"Unknown city '{city_id}'. See /api/cities for valid options.")

        token = os.environ.get('NOAA_TOKEN')
        if not token:
            return self._error(500, 'Server is missing NOAA_TOKEN. Set it in Vercel project env vars.')

        try:
            series = _build_clean_series(city['station'], start_year, end_year, token)
        except urllib.error.HTTPError as e:
            return self._error(e.code, f'NOAA API error: {e.reason}')
        except urllib.error.URLError as e:
            return self._error(502, f'Could not reach NOAA: {e.reason}')
        except Exception as e:
            return self._error(500, f'Unexpected error fetching climate data: {e}')

        if len(series['years']) < 4:
            return self._error(
                502,
                f"NOAA returned too little usable data for {city['label']} "
                f"({len(series['years'])} complete years). Try a wider year range."
            )

        result = {'city': city, **series}
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def _error(self, code, message):
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': message}).encode())

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, format, *args):
        pass
