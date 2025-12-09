
import { geocodeLocation } from './src/services/geocodingService.js';

async function test() {
    try {
        console.log("Testing concurrent geocoding...");
        const results = await Promise.all([
            geocodeLocation('Bengaluru'),
            geocodeLocation('Mysuru')
        ]);
        console.log("Results:", results);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
