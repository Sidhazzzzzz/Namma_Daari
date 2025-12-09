import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelFilePath = path.join(__dirname, '..', 'data', 'accidents_with_coordinates.xlsx');
const outputFilePath = path.join(__dirname, '..', 'src', 'services', 'accidentData.js');

try {
    console.log(`Reading file from: ${excelFilePath}`);
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} records.`);

    const processedData = data.map(row => {
        // Adjust these keys based on the actual Excel column names
        // I'll assume common names or try to find them if this fails, 
        // but based on the user prompt "lat and long", I'll look for those.
        // I will also look for 'Latitude' and 'Longitude' just in case.

        const lat = row.lat || row.Lat || row.latitude || row.Latitude;
        const lon = row.long || row.Long || row.longitude || row.Longitude || row.lng || row.Lng;

        // Default severity to 5 if not present, or map from some other column if available
        // For now, I'll just give them a high severity since they are accidents.
        const severity = 8;

        if (lat && lon) {
            return {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                severity: severity,
                area: 'Accident Spot', // Placeholder, maybe use another column if available
                description: 'Reported accident location'
            };
        }
        return null;
    }).filter(item => item !== null);

    console.log(`Processed ${processedData.length} valid records.`);

    const fileContent = `
// Auto-generated accident data
export const ACCIDENT_DATA = ${JSON.stringify(processedData, null, 4)};

export function getAccidentData() {
    return ACCIDENT_DATA;
}
`;

    fs.writeFileSync(outputFilePath, fileContent);
    console.log(`Successfully wrote accident data to ${outputFilePath}`);

} catch (error) {
    console.error('Error processing accident data:', error);
}
