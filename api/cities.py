from http.server import BaseHTTPRequestHandler
import json

# Duplicated in climate.py on purpose -- see the comment there for why.
CITIES = [
    {
        "id": "nyc",
        "label": "New York (Central Park)",
        "station": "GHCND:USW00094728",
        "lat": 40.7794,
        "lon": -73.9692,
    },
    {
        "id": "chicago",
        "label": "Chicago (O'Hare)",
        "station": "GHCND:USW00094846",
        "lat": 41.9786,
        "lon": -87.9048,
    },
    {
        "id": "phoenix",
        "label": "Phoenix (Sky Harbor)",
        "station": "GHCND:USW00023183",
        "lat": 33.4297,
        "lon": -112.0112,
    },
    {
        "id": "seattle",
        "label": "Seattle-Tacoma",
        "station": "GHCND:USW00024233",
        "lat": 47.4444,
        "lon": -122.3138,
    },
]


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'cities': CITIES}).encode())

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, format, *args):
        pass
