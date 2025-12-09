/**
 * Geocoding Service
 * Uses Nominatim API to convert place names to coordinates
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Geocode a location string to coordinates
 * @param {string} locationString - The location to geocode
 * @returns {Promise<{lat: number, lon: number, display_name: string}>}
 */
export async function geocodeLocation(locationString) {
  try {
    console.log(`Geocoding: "${locationString}"`);
    const params = new URLSearchParams({
      q: locationString,
      format: 'json',
      limit: '1',
      countrycodes: 'in', // Restrict to India
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
