const fs = require('fs');
const readline = require('readline');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'bmtc_data');
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

async function processStops() {
    console.log('Processing stops...');
    const fileStream = fs.createReadStream(path.join(DATA_DIR, 'stops.txt'));
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const features = [];
    let headers = null;

    for await (const line of rl) {
        if (!headers) {
            headers = line.split(',').map(h => h.trim());
            continue;
        }

        const values = line.split(','); // Simple split, assuming no commas in quoted fields for now
        const stop = {};
        headers.forEach((h, i) => stop[h] = values[i]);

        if (stop.stop_lat && stop.stop_lon) {
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)]
                },
                properties: {
                    stop_id: stop.stop_id,
                    stop_name: stop.stop_name
                }
            });
        }
    }

    const geojson = {
        type: 'FeatureCollection',
        features: features
    };

    fs.writeFileSync(path.join(OUTPUT_DIR, 'bmtc_stops.json'), JSON.stringify(geojson));
    console.log(`Saved ${features.length} stops to bmtc_stops.json`);
}

async function processRoutes() {
    console.log('Processing routes...');

    // 1. Load Routes
    const routesMap = new Map(); // route_id -> { short_name, long_name }
    const routesContent = fs.readFileSync(path.join(DATA_DIR, 'routes.txt'), 'utf-8');
    const routeLines = routesContent.split('\n');
    const routeHeaders = routeLines[0].split(',').map(h => h.trim());

    for (let i = 1; i < routeLines.length; i++) {
        if (!routeLines[i].trim()) continue;
        const values = routeLines[i].split(',');
        const route = {};
        routeHeaders.forEach((h, j) => route[h] = values[j]);
        routesMap.set(route.route_id, {
            short_name: route.route_short_name,
            long_name: route.route_long_name
        });
    }

    // 2. Load Trips to map Shape -> Route
    console.log('Mapping trips...');
    const shapeToRoute = new Map(); // shape_id -> route_id
    const tripsStream = fs.createReadStream(path.join(DATA_DIR, 'trips.txt'));
    const tripsRl = readline.createInterface({ input: tripsStream, crlfDelay: Infinity });

    let tripHeaders = null;
    for await (const line of tripsRl) {
        if (!tripHeaders) {
            tripHeaders = line.split(',').map(h => h.trim());
            continue;
        }
        const values = line.split(',');
        const trip = {};
        tripHeaders.forEach((h, i) => trip[h] = values[i]);

        if (trip.shape_id && trip.route_id) {
            shapeToRoute.set(trip.shape_id, trip.route_id);
        }
    }

    // 3. Process Shapes
    console.log('Processing shapes...');
    const shapesMap = new Map(); // shape_id -> [{lat, lon, seq}]
    const shapesStream = fs.createReadStream(path.join(DATA_DIR, 'shapes.txt'));
    const shapesRl = readline.createInterface({ input: shapesStream, crlfDelay: Infinity });

    let shapeHeaders = null;
    for await (const line of shapesRl) {
        if (!shapeHeaders) {
            shapeHeaders = line.split(',').map(h => h.trim());
            continue;
        }
        const values = line.split(',');
        const shape = {};
        shapeHeaders.forEach((h, i) => shape[h] = values[i]);

        if (!shapesMap.has(shape.shape_id)) {
            shapesMap.set(shape.shape_id, []);
        }
        shapesMap.get(shape.shape_id).push({
            lat: parseFloat(shape.shape_pt_lat),
            lon: parseFloat(shape.shape_pt_lon),
            seq: parseInt(shape.shape_pt_sequence)
        });
    }

    // 4. Build GeoJSON
    console.log('Building route GeoJSON...');
    const features = [];

    for (const [shapeId, points] of shapesMap) {
        points.sort((a, b) => a.seq - b.seq);
        const coordinates = points.map(p => [p.lon, p.lat]);
        const routeId = shapeToRoute.get(shapeId);
        const routeInfo = routesMap.get(routeId) || {};

        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            },
            properties: {
                shape_id: shapeId,
                route_id: routeId,
                route_short_name: routeInfo.short_name || 'Unknown',
                route_long_name: routeInfo.long_name || 'Unknown'
            }
        });
    }

    const geojson = {
        type: 'FeatureCollection',
        features: features
    };

    fs.writeFileSync(path.join(OUTPUT_DIR, 'bmtc_routes.json'), JSON.stringify(geojson));
    console.log(`Saved ${features.length} routes to bmtc_routes.json`);
}

async function main() {
    try {
        await processStops();
        await processRoutes();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
