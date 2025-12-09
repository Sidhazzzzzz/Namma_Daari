const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const HOSPITALS_FILE = path.join(__dirname, '..', 'data', 'hospitals_with_coordinates.xlsx');
const POLICE_FILE = path.join(__dirname, '..', 'data', 'police_stations_coordinates.csv');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'services', 'facilityData.js');

function convertData() {
    console.log('Starting data conversion...');

    // 1. Process Hospitals
    console.log(`Reading ${HOSPITALS_FILE}...`);
    const hospitalWorkbook = XLSX.readFile(HOSPITALS_FILE);
    const hospitalSheetName = hospitalWorkbook.SheetNames[0];
    const hospitalSheet = hospitalWorkbook.Sheets[hospitalSheetName];
    const rawHospitals = XLSX.utils.sheet_to_json(hospitalSheet);

    const hospitals = rawHospitals.map(h => ({
        name: h['Hospital Name'] || h['Name'] || h['name'], // Adjust based on actual header
        lat: parseFloat(h['Latitude'] || h['latitude'] || h['Lat']),
        lon: parseFloat(h['Longitude'] || h['longitude'] || h['Long'])
    })).filter(h => !isNaN(h.lat) && !isNaN(h.lon));

    console.log(`Processed ${hospitals.length} hospitals.`);

    // 2. Process Police Stations
    console.log(`Reading ${POLICE_FILE}...`);
    // We can use XLSX to read CSV as well, it's robust
    const policeWorkbook = XLSX.readFile(POLICE_FILE);
    const policeSheetName = policeWorkbook.SheetNames[0];
    const policeSheet = policeWorkbook.Sheets[policeSheetName];
    const rawPolice = XLSX.utils.sheet_to_json(policeSheet);

    const policeStations = rawPolice.map(p => ({
        name: p['name'] || p['Station Name'] || p['Name'],
        lat: parseFloat(p['latitude'] || p['Latitude'] || p['Lat']),
        lon: parseFloat(p['longitude'] || p['Longitude'] || p['Long'])
    })).filter(p => !isNaN(p.lat) && !isNaN(p.lon));

    console.log(`Processed ${policeStations.length} police stations.`);

    // 3. Generate JS File
    const fileContent = `
// Auto-generated facility data
// Generated on: ${new Date().toISOString()}

export const HOSPITALS = ${JSON.stringify(hospitals, null, 4)};

export const POLICE_STATIONS = ${JSON.stringify(policeStations, null, 4)};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Successfully wrote data to ${OUTPUT_FILE}`);
}

try {
    convertData();
} catch (error) {
    console.error('Error converting data:', error);
}
