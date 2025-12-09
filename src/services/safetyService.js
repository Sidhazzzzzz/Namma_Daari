
import { HOSPITALS, POLICE_STATIONS } from './facilityData.js';
import { ACCIDENT_DATA } from './accidentData.js';

const BENGALURU_CRIME_DATA = [
    // High crime areas
    { lat: 12.9716, lon: 77.5946, severity: 8, area: 'MG Road' },
    { lat: 12.9698, lon: 77.6489, severity: 7, area: 'Indiranagar' },
    { lat: 12.9352, lon: 77.6245, severity: 9, area: 'Koramangala' },
    { lat: 12.9279, lon: 77.6271, severity: 6, area: 'BTM Layout' },
    { lat: 13.0358, lon: 77.5970, severity: 7, area: 'Malleshwaram' },
    { lat: 12.9941, lon: 77.7110, severity: 8, area: 'Whitefield' },
    { lat: 13.0199, lon: 77.6498, severity: 5, area: 'Hebbal' },
    { lat: 12.9121, lon: 77.6446, severity: 6, area: 'Jayanagar' },

    // Medium crime areas
    { lat: 12.9634, lon: 77.6401, severity: 5, area: 'Domlur' },
    { lat: 12.9539, lon: 77.6309, severity: 4, area: 'HAL' },
    { lat: 13.0475, lon: 77.5980, severity: 5, area: 'Yeshwanthpur' },
    { lat: 12.9165, lon: 77.6101, severity: 4, area: 'JP Nagar' },
    { lat: 13.0097, lon: 77.5505, severity: 6, area: 'Rajajinagar' },
    { lat: 12.9539, lon: 77.4905, severity: 5, area: 'Vijayanagar' },
    { lat: 13.0827, lon: 77.5830, severity: 7, area: 'Yelahanka' },

    // Lower crime areas
    { lat: 12.8456, lon: 77.6632, severity: 3, area: 'Electronic City' },
    { lat: 13.0659, lon: 77.6040, severity: 3, area: 'Jakkur' },
    { lat: 12.8988, lon: 77.5847, severity: 2, area: 'Banashankari' },
    { lat: 13.0210, lon: 77.7380, severity: 4, area: 'Marathahalli' },
    { lat: 12.9250, lon: 77.4987, severity: 3, area: 'Kengeri' },
];

/**
 * Get all crime data
 * @returns {Array} Array of crime data points
 */
export function getCrimeData() {
    return BENGALURU_CRIME_DATA;
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
 * Calculate safety score for a route
 * @param {Object} routeGeometry - GeoJSON LineString geometry
 * @returns {number} Safety score (0-100, where 100 is safest)
 */
export function calculateSafetyScore(routeGeometry) {
    const coordinates = routeGeometry.coordinates;
    let totalRisk = 0;
    let pointsChecked = 0;

    // Sample points along the route (every 10th point to optimize)
    const sampleInterval = Math.max(1, Math.floor(coordinates.length / 50));

    for (let i = 0; i < coordinates.length; i += sampleInterval) {
        const [lon, lat] = coordinates[i];

        // Base risk for being in an urban environment
        let pointRisk = 1.0;

        // 1. Calculate Risk from Crime Data
        // Increased radius to 2km and weight to make it more impactful
        BENGALURU_CRIME_DATA.forEach(crime => {
            const distance = haversineDistance(lat, lon, crime.lat, crime.lon);
            const influenceRadius = 2.0; // 2km radius

            if (distance < influenceRadius) {
                // Quadratic falloff for more realistic impact
                const proximityFactor = Math.pow(1 - (distance / influenceRadius), 2);
                // Weight factor of 2.0 to increase impact
                pointRisk += (crime.severity * 2.0) * proximityFactor;
            }
        });

        // 2. Calculate Risk from Accident Data
        // Accidents are more localized, so smaller radius but significant impact
        ACCIDENT_DATA.forEach(accident => {
            const distance = haversineDistance(lat, lon, accident.lat, accident.lon);
            const influenceRadius = 1.0; // 1km radius

            if (distance < influenceRadius) {
                // Quadratic falloff
                const proximityFactor = Math.pow(1 - (distance / influenceRadius), 2);
                // Weight factor of 1.5 - accidents are serious but maybe less "pervasive" than crime hotspots
                pointRisk += (accident.severity * 1.5) * proximityFactor;
            }
        });

        // 3. Apply Safety Boost from Police Stations
        POLICE_STATIONS.forEach(station => {
            const distance = haversineDistance(lat, lon, station.lat, station.lon);
            if (distance < 1.5) { // Increased influence to 1.5km
                const safetyFactor = 0.6 * (1 - (distance / 1.5)); // Max 60% reduction
                pointRisk = pointRisk * (1 - safetyFactor);
            }
        });

        // 4. Apply Safety Boost from Hospitals
        HOSPITALS.forEach(hospital => {
            const distance = haversineDistance(lat, lon, hospital.lat, hospital.lon);
            if (distance < 1.0) { // Increased influence to 1km
                const safetyFactor = 0.3 * (1 - (distance / 1.0)); // Max 30% reduction
                pointRisk = pointRisk * (1 - safetyFactor);
            }
        });

        totalRisk += pointRisk;
        pointsChecked++;
    }

    // Normalize the risk score
    const avgRisk = pointsChecked > 0 ? totalRisk / pointsChecked : 0;

    // Convert to safety score (0-100)
    // Increased maxExpectedRisk to 12 to account for additive accident risk
    const maxExpectedRisk = 12;
    const riskPercentage = Math.min(100, (avgRisk / maxExpectedRisk) * 100);
    const safetyScore = 100 - riskPercentage;

    return Math.max(0, Math.min(100, Math.round(safetyScore)));
}

/**
 * Get safety level based on score
 * @param {number} score - Safety score (0-100)
 * @returns {string} Safety level: 'high', 'medium', or 'low'
 */
export function getSafetyLevel(score) {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
}

/**
 * Get color for route based on safety score
 * @param {number} score - Safety score (0-100)
 * @returns {string} Hex color code
 */
export function getRouteColor(score) {
    if (score >= 75) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
}
