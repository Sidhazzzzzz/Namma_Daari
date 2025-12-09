/**
 * Route Service
 * Fetches routes from OSRM API
 */

import { HOSPITALS, POLICE_STATIONS } from './facilityData.js';

const OSRM_BASE_URL = '/api/osrm';

/**
 * Fetch routes between two coordinates
 * @param {Object} start - Starting coordinates {lat, lon}
 * @param {Object} end - Ending coordinates {lat, lon}
 * @returns {Promise<Array>} Array of route objects
 */
export async function getRoutes(start, end) {
    try {
        // OSRM expects lon,lat format
        const coordinates = `${start.lon},${start.lat};${end.lon},${end.lat}`;

        const params = new URLSearchParams({
            overview: 'full',
            geometries: 'geojson',
            steps: 'true',
            alternatives: 'true', // Request alternative routes
        });

        const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${params}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OSRM API failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok') {
            throw new Error(`OSRM error: ${data.message || 'Unknown error'}`);
        }

        // Return all routes (main + alternatives)
        return data.routes.map((route, index) => ({
            id: `route-${index}`,
            geometry: route.geometry,
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
            steps: route.legs[0].steps,
            originalDuration: route.duration // Keep original for reference
        }));
    } catch (error) {
        console.error('Route fetching error:', error);
        throw error;
    }
}

/**
 * Calculate adjusted duration based on weather and traffic
 * @param {number} originalDuration - Base duration in seconds
 * @param {Object} weatherData - Weather object
 * @param {Array} trafficIncidents - Array of traffic incidents
 * @param {Object} routeGeometry - Route geometry
 * @returns {Object} { duration: number, delayDetails: Array }
 */
export function calculateAdjustedDuration(originalDuration, weatherData, trafficIncidents, routeGeometry) {
    // BASELINE ADJUSTMENT for Bengaluru Density
    // OSRM is too optimistic (free flow). We apply a 1.4x multiplier for general city congestion.
    let adjustedDuration = originalDuration * 1.4;

    const delays = [];
    const matchedIncidents = [];

    console.log(`[Duration Calc] Original: ${originalDuration}s, Base Adjusted (1.4x): ${adjustedDuration}s`);

    // 1. Weather Adjustment
    if (weatherData && weatherData.weather && weatherData.weather.length > 0) {
        const mainWeather = weatherData.weather[0].main.toLowerCase();
        // Bad weather conditions
        if (['rain', 'snow', 'thunderstorm', 'drizzle', 'mist', 'fog'].includes(mainWeather)) {
            const weatherDelay = originalDuration * 0.20; // +20%
            adjustedDuration += weatherDelay;
            delays.push({ type: 'Weather', message: `Poor conditions (${mainWeather}) (+${Math.round(weatherDelay / 60)}m)` });
            console.log(`[Duration Calc] Weather Delay Applied: +${weatherDelay}s (${mainWeather})`);
        }
    }

    // 2. Traffic Incidents Adjustment
    if (trafficIncidents && trafficIncidents.length > 0 && routeGeometry && routeGeometry.coordinates) {
        let trafficDelay = 0;
        const coordinates = routeGeometry.coordinates;
        // Sample route points to reduce computation
        const sampleInterval = Math.max(1, Math.floor(coordinates.length / 30));

        const incidentHits = new Set(); // Avoid double counting same incident

        console.log(`[Duration Calc] Checking ${trafficIncidents.length} global incidents against route...`);

        for (let i = 0; i < coordinates.length; i += sampleInterval) {
            const [lon, lat] = coordinates[i]; // Correct order [lon, lat] for GeoJSON

            trafficIncidents.forEach(incident => {
                if (!incidentHits.has(incident.id)) {
                    // Check if point is close to incident (approx 500m)
                    // Note: incident.point is our fallback center from fetchTrafficIncidents
                    const iLat = incident.point ? incident.point.lat : 0;
                    const iLon = incident.point ? incident.point.lon : 0;

                    const distLat = Math.abs(lat - iLat);
                    const distLon = Math.abs(lon - iLon);

                    // Increased sensitivity slightly: 0.005 approx 500-600m
                    if (distLat < 0.005 && distLon < 0.005) {
                        const incidentDelay = incident.delay || 900; // Default 15 mins if major
                        trafficDelay += incidentDelay;
                        incidentHits.add(incident.id);
                        matchedIncidents.push(incident);
                        delays.push({ type: 'Traffic', message: `Incident at ${incident.from || 'Location'} (+${Math.round(incidentDelay / 60)}m)` });
                        console.log(`[Duration Calc] Hit Incident: ${incident.description} (+${incidentDelay}s)`);
                    }
                }
            });
        }

        if (trafficDelay > 0) {
            adjustedDuration += trafficDelay;
            console.log(`[Duration Calc] Total Traffic Delay Added: +${trafficDelay}s`);
        } else {
            console.log(`[Duration Calc] No route-specific incidents found.`);
        }
    }

    return {
        duration: adjustedDuration,
        delays: delays,
        matchedIncidents: matchedIncidents
    };
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}
/**
 * Calculate the distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find nearest facilities for a route
 * @param {Object} routeGeometry - GeoJSON LineString geometry
 * @returns {Object} Nearest hospital and police station
 */
export function findNearestFacilities(routeGeometry) {
    const coordinates = routeGeometry.coordinates;
    let nearestHospital = { distance: Infinity, name: '' };
    let nearestPolice = { distance: Infinity, name: '' };

    // Check sample points along the route
    const sampleInterval = Math.max(1, Math.floor(coordinates.length / 20));

    for (let i = 0; i < coordinates.length; i += sampleInterval) {
        const [lon, lat] = coordinates[i];

        // Check Hospitals
        HOSPITALS.forEach(hospital => {
            const dist = haversineDistance(lat, lon, hospital.lat, hospital.lon);
            if (dist < nearestHospital.distance) {
                nearestHospital = { distance: dist, name: hospital.name };
            }
        });

        // Check Police Stations
        POLICE_STATIONS.forEach(station => {
            const dist = haversineDistance(lat, lon, station.lat, station.lon);
            if (dist < nearestPolice.distance) {
                nearestPolice = { distance: dist, name: station.name || 'Police Station' };
            }
        });
    }

    return {
        hospital: nearestHospital,
        police: nearestPolice
    };
}
