
import { geocodeLocation } from './src/services/geocodingService.js';

async function test() {
    try {
        console.log("Testing sequential geocoding...");

        console.log("Requesting Bengaluru...");
        const startCoords = await geocodeLocation('Bengaluru');
        console.log("Got start:", startCoords);

        console.log("Waiting 1s...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Requesting Mysuru...");
        const endCoords = await geocodeLocation('Mysuru');
        console.log("Got end:", endCoords);

        console.log("Success!");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
