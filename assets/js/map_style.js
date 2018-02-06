var style = {
    "version": 8,
    "sources": {
        "open-street-map": {
            "type": "raster",
            "tiles": [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            "tileSize": 256
        }
    },
    "layers": [{
        "id": "open-street-map",
        "type": "raster",
        "source": "open-street-map",
        "minzoom": 0,
        "maxzoom": 18
    }],
    "sprite": "mapbox://sprites/mapbox/streets-v8",
    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf"
};