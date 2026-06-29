# Underscore prefix tells Vercel this is a shared utility file, not its own
# serverless function endpoint. Imported by both cities.py and climate.py so
# the station list lives in exactly one place.

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


def city_by_id(city_id):
    for c in CITIES:
        if c["id"] == city_id:
            return c
    return None
