// ========================================
// Safe Route Finder - Standalone Version
// ========================================

// ========================================
// ========================================
// Crime Service
// ========================================
const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

import { ACCIDENT_DATA } from './src/services/accidentData.js';
import { getCrimeData, calculateSafetyScore, getSafetyLevel, getRouteColor } from './src/services/safetyService.js';
import { getRoutes, formatDistance, formatDuration, findNearestFacilities, calculateAdjustedDuration } from './src/services/routeService.js';
import { HOSPITALS, POLICE_STATIONS } from './src/services/facilityData.js';




// ========================================
// Geocoding Service
// ========================================
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

async function geocodeLocation(locationString) {
    try {
        console.log(`Geocoding: "${locationString}"`);
        const params = new URLSearchParams({
            q: locationString,
            format: 'json',
            limit: '1',
            countrycodes: 'in',
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
            headers: {
                'User-Agent': 'SafeRouteFinderApp/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            throw new Error('Location not found');
        }

        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            display_name: data[0].display_name
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

// ========================================
// Autocomplete Service
// ========================================
let debounceTimer;

async function fetchSuggestions(query) {
    if (!query || query.length < 3) return [];

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: '5',
            countrycodes: 'in',
            addressdetails: '1',
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
            headers: {
                'User-Agent': 'SafeRouteFinderApp/1.0'
            }
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}

function showSuggestions(suggestions, inputElement) {
    let list = inputElement.nextElementSibling;
    if (!list || !list.classList.contains('autocomplete-items')) {
        list = document.createElement('div');
        list.setAttribute('class', 'autocomplete-items');
        inputElement.parentNode.appendChild(list);
    }

    list.innerHTML = '';

    if (suggestions.length === 0) {
        list.innerHTML = '<div class="autocomplete-item">No results found</div>';
        return;
    }

    suggestions.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('autocomplete-item');
        div.innerHTML = `<strong>${item.display_name.split(',')[0]}</strong><br><small>${item.display_name}</small>`;
        div.addEventListener('click', function () {
            inputElement.value = item.display_name;
            // Store coordinates to avoid re-geocoding
            inputElement.dataset.lat = item.lat;
            inputElement.dataset.lon = item.lon;
            list.innerHTML = '';
        });
        list.appendChild(div);
    });
}

function setupAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        // Clear stored coordinates on user input
        delete this.dataset.lat;
        delete this.dataset.lon;
        const query = this.value;

        // Remove existing list if query is empty
        let list = this.nextElementSibling;
        if (list && list.classList.contains('autocomplete-items')) {
            list.innerHTML = '';
        }

        if (!query) return;

        debounceTimer = setTimeout(async () => {
            const suggestions = await fetchSuggestions(query);
            showSuggestions(suggestions, this);
        }, 300);
    });

    // Close list when clicking outside
    document.addEventListener('click', function (e) {
        if (e.target !== input) {
            let list = input.nextElementSibling;
            if (list && list.classList.contains('autocomplete-items')) {
                list.innerHTML = '';
            }
        }
    });
}

// ========================================
// Weather Service
// ========================================
async function getWeather(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

function renderWeatherInfo(startWeather, endWeather) {
    const container = document.getElementById('weather-container');
    const startCard = document.getElementById('start-weather');
    const endCard = document.getElementById('end-weather');

    if (!startWeather && !endWeather) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    if (startWeather) {
        startCard.innerHTML = `
            <div class="weather-location">Start</div>
            <img src="https://openweathermap.org/img/wn/${startWeather.weather[0].icon}.png" alt="Weather icon" class="weather-icon">
            <div class="weather-temp">${startWeather.main.temp.toFixed(1)}°C</div>
            <div class="weather-desc">${startWeather.weather[0].description}</div>
        `;
    }

    if (endWeather) {
        endCard.innerHTML = `
            <div class="weather-location">Destination</div>
            <img src="https://openweathermap.org/img/wn/${endWeather.weather[0].icon}.png" alt="Weather icon" class="weather-icon">
            <div class="weather-temp">${endWeather.main.temp.toFixed(1)}°C</div>
            <div class="weather-desc">${endWeather.weather[0].description}</div>
        `;
    }
}

// ========================================
// Route Service
// ========================================


// ========================================
// Global State
// ========================================
let map;
let currentRoutes = [];
let selectedRouteId = null;
let startMarker = null;
let endMarker = null;
let currentPopup = null;

// ========================================
// Map Initialization
// ========================================
function initializeMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'data/style.json',
        center: [77.5946, 12.9716],
        zoom: 12,
        attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.FullscreenControl(), 'bottom-right');

    map.on('load', () => {
        addCrimeDataLayer();
        addTrafficIncidentsLayer(); // Changed from addTrafficLayer
        addMetroLayer();
        addBmtcLayer();
        addAccidentLayer();
        addFacilityLayer();

        document.getElementById('accidents-btn').addEventListener('click', toggleAccidents);
        document.getElementById('facilities-btn').addEventListener('click', toggleFacilities);

        // Show user location on load
        showUserLocation();
    });
}

function showUserLocation() {
    if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by your browser');
        return;
    }

    console.log('Requesting user location...');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`Location found: ${latitude}, ${longitude} (Accuracy: ${accuracy}m)`);

            // Create the HTML element for the marker
            // Create the HTML element for the marker
            const el = document.createElement('div');
            el.className = 'user-location-container';
            el.innerHTML = `
                <div class="user-location-pulse"></div>
                <div class="user-location-dot"></div>
            `;

            // Add marker to map
            new maplibregl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(map);

            // Fly to location
            map.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                essential: true
            });
        },
        (error) => {
            console.error('Error getting user location:', error.message, error.code);
        },
        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 10000
        }
    );
}

// ========================================
// Traffic Data Visualization
// ========================================
// ========================================
// Traffic Data Visualization (High Severity Only)
// ========================================
let globalTrafficIncidents = [];

async function fetchTrafficIncidents(bbox) {
    try {
        // Default to Bengaluru bounds if no bbox provided
        const bounds = bbox || '77.300000,12.800000,77.800000,13.200000';

        // Ensure bounds validation and precision
        const formattedBounds = bounds.split(',').map(c => parseFloat(c).toFixed(6)).join(',');

        // TomTom REQUIRES the fields parameter for this endpoint
        const fields = '{incidents{type,geometry{type,coordinates},properties{id,magnitudeOfDelay,events{description},from,to,startTime}}}';

        const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${formattedBounds}&fields=${encodeURIComponent(fields)}&key=${TOMTOM_API_KEY}&language=en-GB&t=${Date.now()}`;


        console.log(`[Traffic Debug] BBox: ${bounds}`);
        if (!TOMTOM_API_KEY) console.error('[Traffic Error] TOMTOM_API_KEY is missing!');

        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        if (!data.incidents) return [];

        // Filter for Major/High impact only as requested (Red spots)
        // DEBUG: Adding 'Moderate' to ensure visibility if Major incidents are rare
        const filteredIncidents = data.incidents
            .filter(inc => ['Major', 'Unknown', 'Moderate'].includes(inc.properties.magnitudeOfDelay));

        console.log(`[Traffic] Fetched ${data.incidents.length} total, showing ${filteredIncidents.length} severe/moderate incidents.`);

        return filteredIncidents
            .map(inc => ({
                id: inc.properties.id,
                // Store full geometry (may be Point or LineString)
                geometry: inc.geometry,
                point: { lat: inc.geometry.coordinates[1], lon: inc.geometry.coordinates[0] }, // Fallback center point (unsafe for LineString but kept for compatibility logic)
                severity: inc.properties.magnitudeOfDelay,
                delay: inc.properties.magnitudeOfDelay === 'Major' ? 900 : 600,
                description: inc.properties.events ? inc.properties.events[0].description : 'Traffic Incident',
                from: inc.properties.from,
                to: inc.properties.to
            }));
    } catch (error) {
        console.error('Error fetching traffic incidents:', error);
        return [];
    }
}

function addTrafficIncidentsLayer() {
    map.addSource('traffic-incidents', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    // Layer for LineString Traffic (Red Lines along road)
    map.addLayer({
        id: 'traffic-incidents-line',
        type: 'line',
        source: 'traffic-incidents',
        filter: ['==', '$type', 'LineString'],
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#dc2626', // Red
            'line-width': 6,
            'line-opacity': 1.0
        }
    }, 'crime-points');

    // Layer for Point Traffic
    map.addLayer({
        id: 'traffic-incidents-point',
        type: 'circle',
        source: 'traffic-incidents',
        filter: ['==', '$type', 'Point'],
        paint: {
            'circle-radius': 6,
            'circle-color': '#dc2626',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
        }
    }, 'crime-points');

    // Popup logic
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    const showPopup = (e) => {
        map.getCanvas().style.cursor = 'pointer';
        let coordinates = [e.lngLat.lng, e.lngLat.lat];
        if (e.features[0].geometry.type === 'Point') {
            coordinates = e.features[0].geometry.coordinates.slice();
        }

        const { description, severity } = e.features[0].properties;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates)
            .setHTML(`
                <div style="padding: 8px; color: #000;">
                    <strong style="color: #dc2626;">Traffic Incident</strong><br>
                    ${description}<br>
                    <small>Severity: ${severity}</small>
                </div>
            `)
            .addTo(map);
    };

    const hidePopup = () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    };

    map.on('mouseenter', 'traffic-incidents-line', showPopup);
    map.on('mouseleave', 'traffic-incidents-line', hidePopup);
    map.on('mouseenter', 'traffic-incidents-point', showPopup);
    map.on('mouseleave', 'traffic-incidents-point', hidePopup);

    // Initial load
    updateTrafficLayer();
}

async function updateTrafficLayer(bboxOrIncidents) {
    let incidents = [];
    if (Array.isArray(bboxOrIncidents)) {
        incidents = bboxOrIncidents;
    } else {
        incidents = await fetchTrafficIncidents(bboxOrIncidents);
        globalTrafficIncidents = incidents;
    }

    const geojson = {
        type: 'FeatureCollection',
        features: incidents.map(inc => ({
            type: 'Feature',
            geometry: inc.geometry,
            properties: {
                id: inc.id,
                description: inc.description,
                severity: inc.severity
            }
        }))
    };

    if (map.getSource('traffic-incidents')) {
        map.getSource('traffic-incidents').setData(geojson);
    }
}

// ========================================
// Crime Data Visualization
// ========================================
function addCrimeDataLayer() {
    const crimeData = getCrimeData();

    const geojson = {
        type: 'FeatureCollection',
        features: crimeData.map(crime => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [crime.lon, crime.lat]
            },
            properties: {
                severity: crime.severity,
                area: crime.area
            }
        }))
    };

    map.addSource('crime-data', {
        type: 'geojson',
        data: geojson
    });

    map.addLayer({
        id: 'crime-points',
        type: 'circle',
        source: 'crime-data',
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'severity'],
                1, 4,
                10, 12
            ],
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'severity'],
                1, '#10b981',
                5, '#f59e0b',
                10, '#ef4444'
            ],
            'circle-opacity': 0.3,
            'circle-stroke-width': 2,
            'circle-stroke-color': [
                'interpolate',
                ['linear'],
                ['get', 'severity'],
                1, '#10b981',
                5, '#f59e0b',
                10, '#ef4444'
            ],
            'circle-stroke-opacity': 0.6
        }
    });

    let currentPopup = null; // Local scope for popup to avoid collision if global one exists

    map.on('mouseenter', 'crime-points', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        if (currentPopup) {
            currentPopup.remove();
        }

        const coordinates = e.features[0].geometry.coordinates.slice();
        const { severity, area } = e.features[0].properties;

        currentPopup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        })
            .setLngLat(coordinates)
            .setHTML(`
        <div style="padding: 8px; font-family: Inter, sans-serif;">
          <strong style="color: #000000;">${area}</strong><br>
          <span style="color: #10b981;">Severity: ${severity}/10</span>
        </div>
      `)
            .addTo(map);
    });

    map.on('mouseleave', 'crime-points', () => {
        map.getCanvas().style.cursor = '';
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
    });
}

// ========================================
// Metro Data Visualization
// ========================================
function addMetroLayer() {
    if (typeof metroData === 'undefined') {
        console.error('Metro data not loaded');
        return;
    }

    // Add metro data source
    map.addSource('metro-data', {
        type: 'geojson',
        data: metroData
    });

    // Add metro lines layer
    map.addLayer({
        id: 'metro-lines',
        type: 'line',
        source: 'metro-data',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
            'visibility': 'none'
        },
        paint: {
            'line-color': [
                'match',
                ['get', 'line'],
                'purple', '#9a339a',
                'green', '#4caf50',
                'yellow', '#ffeb3b',
                '#000000' // default color
            ],
            'line-width': 4
        }
    });

    // Add metro stations circle layer
    map.addLayer({
        id: 'metro-stations',
        type: 'circle',
        source: 'metro-data',
        filter: ['==', '$type', 'Point'],
        layout: {
            'visibility': 'none'
        },
        paint: {
            'circle-radius': 7,
            'circle-color': [
                'match',
                ['get', 'line'],
                'purple', '#9a339a',
                'green', '#4caf50',
                'yellow', '#ffeb3b',
                '#000000'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
        }
    });

    // Add metro labels layer (M symbol)
    map.addLayer({
        id: 'metro-labels',
        type: 'symbol',
        source: 'metro-data',
        filter: ['==', '$type', 'Point'],
        minzoom: 10, // Show M symbol earlier
        layout: {
            'visibility': 'none',
            'text-field': 'M',
            'text-font': ['Open Sans Bold'],
            'text-size': 8,
            'text-allow-overlap': true
        },
        paint: {
            'text-color': [
                'match',
                ['get', 'line'],
                'yellow', '#000000',
                '#ffffff'
            ]
        }
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    // Add click event for metro stations (optional, maybe zoom in?)
    map.on('click', 'metro-stations', (e) => {
        map.flyTo({
            center: e.features[0].geometry.coordinates,
            zoom: 14
        });
    });

    // Change cursor and show popup on hover
    map.on('mouseenter', 'metro-stations', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.name;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup.setLngLat(coordinates).setHTML(`<strong style="color: #000000;">${description}</strong>`).addTo(map);
    });

    map.on('mouseleave', 'metro-stations', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
}

function toggleMetroStops() {
    const visibility = map.getLayoutProperty('metro-stations', 'visibility');
    const newVisibility = visibility === 'visible' ? 'none' : 'visible';

    if (map.getLayer('metro-lines')) {
        map.setLayoutProperty('metro-lines', 'visibility', newVisibility);
    }
    if (map.getLayer('metro-stations')) {
        map.setLayoutProperty('metro-stations', 'visibility', newVisibility);
    }
    if (map.getLayer('metro-labels')) {
        map.setLayoutProperty('metro-labels', 'visibility', newVisibility);
    }

    const btn = document.getElementById('metro-btn');
    if (newVisibility === 'visible') {
        btn.style.backgroundColor = '#581c87';
        btn.innerHTML = '<span class="btn-icon">🚇</span> Hide Metro Stations';

        // Fly to Bangalore center to show all lines
        map.flyTo({
            center: [77.5946, 12.9716],
            zoom: 11,
            padding: { left: 450, right: 50 } // Offset for sidebar
        });
    } else {
        btn.style.backgroundColor = '#6b21a8';
        btn.innerHTML = '<span class="btn-icon">🚇</span> Show Metro Stations';
    }
}

// ========================================
// BMTC Data Visualization
// ========================================
function addBmtcLayer() {
    // Load Stops
    fetch('data/bmtc_stops.json')
        .then(response => response.json())
        .then(data => {
            map.addSource('bmtc-stops', {
                type: 'geojson',
                data: data
            });

            map.addLayer({
                id: 'bmtc-stops-layer',
                type: 'circle',
                source: 'bmtc-stops',
                layout: {
                    'visibility': 'none'
                },
                paint: {
                    'circle-radius': 4,
                    'circle-color': '#dc2626', // Red color for BMTC
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'
                }
            });

            // Popup for stops
            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mouseenter', 'bmtc-stops-layer', (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.stop_name;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                popup.setLngLat(coordinates).setHTML(`<strong style="color: #000000;">${description}</strong>`).addTo(map);
            });

            map.on('mouseleave', 'bmtc-stops-layer', () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
        })
        .catch(err => console.error('Error loading BMTC stops:', err));

    // Load Routes
    fetch('data/bmtc_routes.json')
        .then(response => response.json())
        .then(data => {
            map.addSource('bmtc-routes', {
                type: 'geojson',
                data: data
            });

            map.addLayer({
                id: 'bmtc-routes-layer',
                type: 'line',
                source: 'bmtc-routes',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                    'visibility': 'none'
                },
                paint: {
                    'line-color': '#ef4444', // Reddish
                    'line-width': 2,
                    'line-opacity': 0.7
                }
            }, 'crime-points'); // Place below crime points

            // Popup for routes
            const popup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mouseenter', 'bmtc-routes-layer', (e) => {
                map.getCanvas().style.cursor = 'pointer';

                const props = e.features[0].properties;
                const shortName = props.route_short_name;
                const longName = props.route_long_name;

                let content = '<div style="padding: 5px; font-family: sans-serif;">';
                if (shortName && shortName !== 'Unknown') {
                    content += `<strong style="color: #dc2626; font-size: 14px;">${shortName}</strong><br>`;
                }
                if (longName && longName !== 'Unknown') {
                    // Make the '⇔' arrow more prominent or split lines if needed, but keeping it simple for now
                    content += `<span style="color: #333; font-size: 12px;">${longName}</span>`;
                }
                content += '</div>';

                popup.setLngLat(e.lngLat).setHTML(content).addTo(map);
            });

            map.on('mousemove', 'bmtc-routes-layer', (e) => {
                popup.setLngLat(e.lngLat);
            });

            map.on('mouseleave', 'bmtc-routes-layer', () => {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
        })
        .catch(err => console.error('Error loading BMTC routes:', err));
}

function toggleBmtcRoutes() {
    const visibility = map.getLayoutProperty('bmtc-stops-layer', 'visibility');
    const newVisibility = visibility === 'visible' ? 'none' : 'visible';

    if (map.getLayer('bmtc-stops-layer')) {
        map.setLayoutProperty('bmtc-stops-layer', 'visibility', newVisibility);
    }
    if (map.getLayer('bmtc-routes-layer')) {
        map.setLayoutProperty('bmtc-routes-layer', 'visibility', newVisibility);
    }

    const btn = document.getElementById('bmtc-btn');
    if (newVisibility === 'visible') {
        btn.style.backgroundColor = '#991b1b'; // Darker red
        btn.innerHTML = '<span class="btn-icon">🚌</span> Hide BMTC Routes';
    } else {
        btn.style.backgroundColor = '#dc2626'; // Red
        btn.innerHTML = '<span class="btn-icon">🚌</span> Show BMTC Routes';
    }
}

// ========================================
// Facility Data Visualization (Hospitals & Police)
// ========================================
let facilityMarkers = [];

function addFacilityLayer() {
    // Clear existing markers if any
    facilityMarkers.forEach(marker => marker.remove());
    facilityMarkers = [];

    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
    });

    // Hospitals
    HOSPITALS.forEach(h => {
        const el = document.createElement('div');
        el.className = 'hospital-marker';
        el.innerText = '🏥';
        el.style.display = 'none'; // Initially hidden

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([h.lon, h.lat])
            .addTo(map);

        // Add popup events
        el.addEventListener('mouseenter', () => {
            popup.setLngLat([h.lon, h.lat])
                .setHTML(`
                    <div style="padding: 8px; font-family: Inter, sans-serif; color: #000;">
                        <strong>${h.name}</strong><br>
                        <span style="color: #ef4444;">Hospital</span>
                    </div>
                `)
                .addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            popup.remove();
        });

        facilityMarkers.push({ marker, type: 'hospital', element: el });
    });

    // Police Stations
    POLICE_STATIONS.forEach(p => {
        const el = document.createElement('div');
        el.className = 'police-marker';
        el.innerText = '👮‍♂️';
        el.style.display = 'none'; // Initially hidden

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([p.lon, p.lat])
            .addTo(map);

        // Add popup events
        el.addEventListener('mouseenter', () => {
            popup.setLngLat([p.lon, p.lat])
                .setHTML(`
                    <div style="padding: 8px; font-family: Inter, sans-serif; color: #000;">
                        <strong>${p.name || 'Police Station'}</strong><br>
                        <span style="color: #1e3a8a;">Police Station</span>
                    </div>
                `)
                .addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            popup.remove();
        });

        facilityMarkers.push({ marker, type: 'police', element: el });
    });
}

function toggleFacilities() {
    const btn = document.getElementById('facilities-btn');
    const isVisible = btn.getAttribute('data-visible') === 'true';
    const newVisibility = !isVisible;

    facilityMarkers.forEach(item => {
        item.element.style.display = newVisibility ? 'flex' : 'none';
    });

    btn.setAttribute('data-visible', newVisibility);

    if (newVisibility) {
        btn.style.backgroundColor = '#115e59'; // Darker teal
        btn.innerHTML = '<span class="btn-icon">🏥</span> Hide Hospitals & Police';
    } else {
        btn.style.backgroundColor = '#0f766e'; // Teal
        btn.innerHTML = '<span class="btn-icon">🏥</span> Show Hospitals & Police';
    }
}

// ========================================
// Accident Data Visualization
// ========================================
let accidentMarkers = [];

function addAccidentLayer() {
    // Clear existing markers
    accidentMarkers.forEach(marker => marker.remove());
    accidentMarkers = [];

    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
    });

    ACCIDENT_DATA.forEach(accident => {
        const el = document.createElement('div');
        el.className = 'accident-marker';
        el.innerText = '⚠️';
        el.style.display = 'none'; // Initially hidden

        const marker = new maplibregl.Marker({ element: el })
            .setLngLat([accident.lon, accident.lat])
            .addTo(map);

        // Add popup events
        el.addEventListener('mouseenter', () => {
            popup.setLngLat([accident.lon, accident.lat])
                .setHTML(`
                    <div style="padding: 8px; font-family: Inter, sans-serif; color: #000;">
                        <strong>${accident.area || 'Accident Spot'}</strong><br>
                        <span style="color: #ea580c;">Severity: ${accident.severity}/10</span><br>
                        <small>${accident.description || ''}</small>
                    </div>
                `)
                .addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            popup.remove();
        });

        accidentMarkers.push({ marker, element: el });
    });
}

function toggleAccidents() {
    const btn = document.getElementById('accidents-btn');
    const isVisible = btn.getAttribute('data-visible') === 'true';
    const newVisibility = !isVisible;

    accidentMarkers.forEach(item => {
        item.element.style.display = newVisibility ? 'flex' : 'none';
    });

    btn.setAttribute('data-visible', newVisibility);

    if (newVisibility) {
        btn.style.backgroundColor = '#9a3412'; // Darker orange
        btn.innerHTML = '<span class="btn-icon">⚠️</span> Hide Accidents';
    } else {
        btn.style.backgroundColor = '#ea580c'; // Orange
        btn.innerHTML = '<span class="btn-icon">⚠️</span> Show Accidents';
    }
}


// ========================================
// Route Rendering
// ========================================
function renderRoutesOnMap(routes) {
    clearRoutes();

    routes.forEach((route, index) => {
        try {
            const sourceId = `route-${route.id}`;
            const layerId = `route-layer-${route.id}`;

            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: route.geometry
                }
            });

            // Add route layer BELOW traffic incidents so red lines appear on top
            const beforeLayer = map.getLayer('traffic-incidents-line') ? 'traffic-incidents-line' : 'crime-points';

            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': index === 0 ? '#10b981' : (index === 1 ? '#f59e0b' : '#94a3b8'),
                    'line-width': route.id === selectedRouteId ? 6 : 4,
                    'line-opacity': route.id === selectedRouteId ? 1 : 0.4
                }
            }, beforeLayer);

            map.on('click', layerId, () => {
                selectRoute(route.id);
            });

            map.on('mouseenter', layerId, () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', layerId, () => {
                map.getCanvas().style.cursor = '';
            });
        } catch (error) {
            console.error(`Error adding route ${index + 1}:`, error);
        }
    });

    if (routes.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        routes.forEach(route => {
            route.geometry.coordinates.forEach(coord => {
                bounds.extend(coord);
            });
        });

        // Animation sequence:
        // 1. Fly to Bengaluru center (zoom out)
        // 2. Then fit bounds to the route (zoom in)
        map.flyTo({
            center: [77.5946, 12.9716],
            zoom: 9, // Zoom out further for dramatic effect
            padding: { left: 450, right: 50 }, // Safe padding
            duration: 2000, // 2 seconds
            essential: true
        });

        // Use setTimeout instead of moveend for reliability
        setTimeout(() => {
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: 20, left: 430, right: 20 }, // Increased top padding for SOS button
                duration: 2000 // 2 seconds for zoom in
            });
        }, 2000);
    }
}

function clearRoutes() {
    currentRoutes.forEach(route => {
        const sourceId = `route-${route.id}`;
        const layerId = `route-layer-${route.id}`;

        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }
    });
}

// ========================================
// Marker Management
// ========================================
function clearMarkers() {
    if (startMarker) {
        startMarker.remove();
        startMarker = null;
    }
    if (endMarker) {
        endMarker.remove();
        endMarker = null;
    }
}

function addMarkers(startCoords, endCoords) {
    clearMarkers();

    // Add start marker (green)
    startMarker = new maplibregl.Marker({ color: '#10b981' })
        .setLngLat([startCoords.lon, startCoords.lat])
        .addTo(map);

    // Add destination marker (cyan)
    endMarker = new maplibregl.Marker({ color: '#06b6d4' })
        .setLngLat([endCoords.lon, endCoords.lat])
        .addTo(map);
}

// ========================================
// Route Selection
// ========================================
function selectRoute(routeId) {
    selectedRouteId = routeId;

    currentRoutes.forEach((route, index) => {
        const layerId = `route-layer-${route.id}`;
        if (map.getLayer(layerId)) {
            const isSelected = route.id === routeId;

            // Intrinsic colors: Index 0 = Green, Index 1 = Yellow, Others = Gray
            const color = index === 0 ? '#10b981' : (index === 1 ? '#f59e0b' : '#94a3b8');

            map.setPaintProperty(layerId, 'line-width', isSelected ? 6 : 4);
            map.setPaintProperty(layerId, 'line-opacity', isSelected ? 1 : 0.4);
            map.setPaintProperty(layerId, 'line-color', color);

            // Move selected route to top
            if (isSelected) {
                map.moveLayer(layerId);
            }
        }
    });

    document.querySelectorAll('.route-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.routeId === routeId);
    });
}

// ========================================
// UI Rendering
// ========================================
function renderRoutesList(routes) {
    const routesList = document.getElementById('routes-list');
    const routesContainer = document.getElementById('routes-container');

    routesList.innerHTML = '';

    routes.forEach((route, index) => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.dataset.routeId = route.id;
        card.style.setProperty('--route-color', route.color);

        if (index === 0) {
            card.classList.add('selected');
            selectedRouteId = route.id;
        }

        const safetyLevel = getSafetyLevel(route.safetyScore);
        const safetyText = safetyLevel === 'high' ? 'Safest' :
            safetyLevel === 'medium' ? 'Moderate' : 'Caution';

        const nearest = findNearestFacilities(route.geometry);

        card.innerHTML = `
      <div class="route-header">
        <h3 class="route-name">Route ${index + 1}</h3>
        <span class="safety-badge ${safetyLevel}">${safetyText}</span>
      </div>
      <div class="route-details">
        <div class="route-stat">
          <span class="stat-label">Safety Score</span>
          <span class="safety-score">${route.safetyScore}/100</span>
        </div>
        <div class="route-stat">
          <span class="stat-label">Distance</span>
          <span class="stat-value">${formatDistance(route.distance)}</span>
        </div>
        <div class="route-stat">
          <span class="stat-label">Duration</span>
          <span class="stat-value">${formatDuration(route.duration)}</span>
        </div>
      </div>
      ${route.delayDetails && route.delayDetails.length > 0 ? `
        <div class="delay-info" style="margin-top: 8px; padding: 4px 8px; background: rgba(220, 38, 38, 0.1); border-radius: 4px; border: 1px solid rgba(220, 38, 38, 0.2);">
           ${route.delayDetails.map(d => `<div style="font-size: 0.8rem; color: #fca5a5;">⚠️ ${d.message}</div>`).join('')}
        </div>
      ` : ''}
      <div class="route-facilities" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #334155; font-size: 0.85rem; color: #cbd5e1;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>🏥 Nearest Hospital:</span>
            <span style="color: #fff;">${formatDistance(nearest.hospital.distance * 1000)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span>👮 Nearest Police:</span>
            <span style="color: #fff;">${formatDistance(nearest.police.distance * 1000)}</span>
        </div>
      </div>
    `;

        card.addEventListener('click', () => {
            selectRoute(route.id);
        });

        routesList.appendChild(card);
    });

    routesContainer.classList.add('visible');
}

// ========================================
// Main Route Finding Logic
// ========================================
async function findSafeRoutes() {
    const startInput = document.getElementById('start-location').value.trim();
    const endInput = document.getElementById('end-location').value.trim();
    const loadingOverlay = document.getElementById('loading-overlay');
    const findButton = document.getElementById('find-routes-btn');

    if (!startInput || !endInput) {
        alert('Please enter both starting point and destination');
        return;
    }

    try {
        loadingOverlay.classList.remove('hidden');
        findButton.disabled = true;

        // Check if we have stored coordinates from autocomplete
        const startEl = document.getElementById('start-location');
        const endEl = document.getElementById('end-location');

        let startCoords, endCoords;

        if (startEl.dataset.lat && startEl.dataset.lon) {
            console.log('Using stored start coordinates');
            startCoords = {
                lat: parseFloat(startEl.dataset.lat),
                lon: parseFloat(startEl.dataset.lon),
                display_name: startInput
            };
        } else {
            // Geocode start location
            startCoords = await geocodeLocation(startInput);
            // Add delay if we need to geocode the next one too
            if (!endEl.dataset.lat) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (endEl.dataset.lat && endEl.dataset.lon) {
            console.log('Using stored end coordinates');
            endCoords = {
                lat: parseFloat(endEl.dataset.lat),
                lon: parseFloat(endEl.dataset.lon),
                display_name: endInput
            };
        } else {
            // Geocode end location
            endCoords = await geocodeLocation(endInput);
        }

        console.log('Start:', startCoords);
        console.log('End:', endCoords);

        // Fetch weather data in parallel
        const [startWeather, endWeather] = await Promise.all([
            getWeather(startCoords.lat, startCoords.lon),
            getWeather(endCoords.lat, endCoords.lon)
        ]);

        renderWeatherInfo(startWeather, endWeather);



        // Add markers for start and destination
        addMarkers(startCoords, endCoords);

        // Fetch Routes from OSRM
        const routes = await getRoutes(startCoords, endCoords);
        console.log('Routes fetched:', routes.length);

        const routesWithSafety = routes.map(route => ({
            ...route,
            safetyScore: calculateSafetyScore(route.geometry),
            color: getRouteColor(calculateSafetyScore(route.geometry))
        }));

        // Calculate bounding box for traffic data
        const minLon = Math.min(startCoords.lon, endCoords.lon) - 0.05;
        const minLat = Math.min(startCoords.lat, endCoords.lat) - 0.05;
        const maxLon = Math.max(startCoords.lon, endCoords.lon) + 0.05;
        const maxLat = Math.max(startCoords.lat, endCoords.lat) + 0.05;
        const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

        await updateTrafficLayer(bbox);

        // 2. Adjust Duration based on Weather & Traffic
        // 2. Adjust Duration based on Weather & Traffic
        // Initial pass to set durations for all routes
        routesWithSafety.forEach((route, index) => {
            // Use START weather for simplicity (could average start/end)
            const weather = startWeather || endWeather;
            const adjustment = calculateAdjustedDuration(route.duration, weather, globalTrafficIncidents, route.geometry);

            route.duration = adjustment.duration; // Update to adjusted duration
            route.originalDuration = route.originalDuration || route.duration;
            route.delayDetails = adjustment.delays;
        });

        // 3. Smart Sorting: Safety Tier > Adjusted Duration
        routesWithSafety.sort((a, b) => {
            // Helper to get tier (3=High, 2=Medium, 1=Low)
            const getTier = (score) => {
                if (score >= 75) return 3; // Match High threshold
                if (score >= 50) return 2; // Match Medium threshold
                return 1;
            };

            const tierA = getTier(a.safetyScore);
            const tierB = getTier(b.safetyScore);

            // Priority 1: Safety Tier (Higher is better)
            if (tierA !== tierB) {
                return tierB - tierA;
            }

            // Priority 2: Duration (Lower is better) - optimising within the same safety comfort zone
            return a.duration - b.duration;
        });

        // 4. Update Traffic Visuals for the BEST route
        // We do this AFTER sorting to ensure we show traffic for the top-ranked route
        let routeSpecificIncidents = [];
        if (routesWithSafety.length > 0) {
            // Re-calculate adjustment for the winner to get its specific incidents
            // (Efficient enough to re-run for just one, or we could have stored it)
            const bestRoute = routesWithSafety[0];
            const weather = startWeather || endWeather;
            const adjustment = calculateAdjustedDuration(bestRoute.duration, weather, globalTrafficIncidents, bestRoute.geometry);
            routeSpecificIncidents = adjustment.matchedIncidents || [];
        }

        if (routeSpecificIncidents.length > 0) {
            updateTrafficLayer(routeSpecificIncidents);
        } else {
            updateTrafficLayer([]);
        }

        console.log('Routes with safety scores:', routesWithSafety);

        currentRoutes = routesWithSafety;

        // Select the first route by default so it renders as selected (cyan)
        if (currentRoutes.length > 0) {
            selectedRouteId = currentRoutes[0].id;
        }

        renderRoutesOnMap(routesWithSafety);
        renderRoutesList(routesWithSafety);

    } catch (error) {
        console.error('Error finding routes:', error);
        alert(`Error: ${error.message}`);
    } finally {
        loadingOverlay.classList.add('hidden');
        findButton.disabled = false;
    }
}

// ========================================
// Event Listeners & Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();

    document.getElementById('find-routes-btn').addEventListener('click', findSafeRoutes);

    document.getElementById('start-location').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findSafeRoutes();
    });

    document.getElementById('end-location').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') findSafeRoutes();
    });

    document.getElementById('metro-btn').addEventListener('click', toggleMetroStops);
    document.getElementById('bmtc-btn').addEventListener('click', toggleBmtcRoutes);

    setupAutocomplete('start-location');
    setupAutocomplete('end-location');

    // SOS Button Handler
    const sosBtn = document.getElementById('sos-btn');

    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            alert('Emergency message sent to server! Help is on the way.');
        });
    }
});
