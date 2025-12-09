window.metroData = {
    "type": "FeatureCollection",
    "features": [
        // --- Purple Line Route ---
        {
            "type": "Feature",
            "properties": { "line": "purple", "type": "route" },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [77.7617, 12.9958], [77.7512, 12.9928], [77.7435, 12.9896], [77.7348, 12.9865],
                    [77.7265, 12.9834], [77.7182, 12.9802], [77.7098, 12.9771], [77.7015, 12.9740],
                    [77.6932, 12.9708], [77.6848, 12.9677], [77.6765, 12.9645], [77.6786, 12.9963],
                    [77.6685, 12.9905], [77.6525, 12.9908], [77.6425, 12.9863], [77.6387, 12.9784],
                    [77.6268, 12.9758], [77.6168, 12.9735], [77.6068, 12.9755], [77.5968, 12.9812],
                    [77.5925, 12.9798], [77.5845, 12.9738], [77.5728, 12.9757], [77.5655, 12.9753],
                    [77.5552, 12.9755], [77.5458, 12.9745], [77.5365, 12.9725], [77.5285, 12.9685],
                    [77.5205, 12.9625], [77.5155, 12.9565], [77.5105, 12.9485], [77.5055, 12.9385],
                    [77.5005, 12.9285], [77.4955, 12.9185], [77.4905, 12.9085], [77.4855, 12.8985],
                    [77.4805, 12.8885]
                ]
            }
        },
        // --- Green Line Route ---
        {
            "type": "Feature",
            "properties": { "line": "green", "type": "route" },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [77.5005, 13.0485], [77.5055, 13.0385], [77.5105, 13.0285], [77.5155, 13.0185],
                    [77.5205, 13.0085], [77.5405, 13.0285], [77.5505, 13.0235], [77.5555, 13.0145],
                    [77.5585, 13.0085], [77.5585, 12.9985], [77.5625, 12.9905], [77.5655, 12.9855],
                    [77.5705, 12.9905], [77.5728, 12.9757], // Majestic (Interchange)
                    [77.5745, 12.9665], [77.5755, 12.9605], [77.5765, 12.9505], [77.5805, 12.9455],
                    [77.5805, 12.9365], [77.5825, 12.9285], [77.5845, 12.9205], [77.5735, 12.9155],
                    [77.5735, 12.9085], [77.5735, 12.8985], [77.5735, 12.8885], [77.5735, 12.8785],
                    [77.5735, 12.8685], [77.5735, 12.8585], [77.5735, 12.8485]
                ]
            }
        },
        // --- Yellow Line Route ---
        {
            "type": "Feature",
            "properties": { "line": "yellow", "type": "route" },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [77.5845, 12.9205], // RV Road (Interchange)
                    [77.5884, 12.9170], [77.6001, 12.9167], [77.6083, 12.9166], [77.6206, 12.9165],
                    [77.6266, 12.9107], [77.6321, 12.9017], [77.6393, 12.8900], [77.6450, 12.8806],
                    [77.6525, 12.8708], [77.6580, 12.8639], [77.6711, 12.8465], [77.6740, 12.8430],
                    [77.6775, 12.8390], [77.6814, 12.8292], [77.6883, 12.8194]
                ]
            }
        },
        // --- Stations (Points) ---
        // Purple Line Stations
        { "type": "Feature", "properties": { "name": "Whitefield (Kadugodi)", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7617, 12.9958] } },
        { "type": "Feature", "properties": { "name": "Hopefarm Channasandra", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7512, 12.9928] } },
        { "type": "Feature", "properties": { "name": "Kadugodi Tree Park", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7435, 12.9896] } },
        { "type": "Feature", "properties": { "name": "Pattandur Agrahara", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7348, 12.9865] } },
        { "type": "Feature", "properties": { "name": "Sri Sathya Sai Hospital", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7265, 12.9834] } },
        { "type": "Feature", "properties": { "name": "Nallurhalli", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7182, 12.9802] } },
        { "type": "Feature", "properties": { "name": "Kundalahalli", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7098, 12.9771] } },
        { "type": "Feature", "properties": { "name": "Seetharampalya", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.7015, 12.9740] } },
        { "type": "Feature", "properties": { "name": "Hoodi", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6932, 12.9708] } },
        { "type": "Feature", "properties": { "name": "Garudacharapalya", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6848, 12.9677] } },
        { "type": "Feature", "properties": { "name": "Singayyanapalya", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6765, 12.9645] } },
        { "type": "Feature", "properties": { "name": "Krishnarajapura (K.R. Puram)", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6786, 12.9963] } },
        { "type": "Feature", "properties": { "name": "Benniganahalli", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6685, 12.9905] } },
        { "type": "Feature", "properties": { "name": "Baiyappanahalli", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6525, 12.9908] } },
        { "type": "Feature", "properties": { "name": "Swami Vivekananda Road", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6425, 12.9863] } },
        { "type": "Feature", "properties": { "name": "Indiranagar", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6387, 12.9784] } },
        { "type": "Feature", "properties": { "name": "Halasuru", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6268, 12.9758] } },
        { "type": "Feature", "properties": { "name": "Trinity", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6168, 12.9735] } },
        { "type": "Feature", "properties": { "name": "Mahatma Gandhi Road", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.6068, 12.9755] } },
        { "type": "Feature", "properties": { "name": "Cubbon Park", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5968, 12.9812] } },
        { "type": "Feature", "properties": { "name": "Dr. B.R. Ambedkar Station (Vidhana Soudha)", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5925, 12.9798] } },
        { "type": "Feature", "properties": { "name": "Sir M. Visvesvaraya Station", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5845, 12.9738] } },
        { "type": "Feature", "properties": { "name": "Nadaprabhu Kempegowda Station (Majestic)", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5728, 12.9757] } },
        { "type": "Feature", "properties": { "name": "Krantivira Sangolli Rayanna (City Railway Station)", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5655, 12.9753] } },
        { "type": "Feature", "properties": { "name": "Magadi Road", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5552, 12.9755] } },
        { "type": "Feature", "properties": { "name": "Hosahalli", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5458, 12.9745] } },
        { "type": "Feature", "properties": { "name": "Vijayanagar", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5365, 12.9725] } },
        { "type": "Feature", "properties": { "name": "Attiguppe", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5285, 12.9685] } },
        { "type": "Feature", "properties": { "name": "Deepanjali Nagar", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5205, 12.9625] } },
        { "type": "Feature", "properties": { "name": "Mysore Road", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5155, 12.9565] } },
        { "type": "Feature", "properties": { "name": "Pantharapalya (Nayandahalli)", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5105, 12.9485] } },
        { "type": "Feature", "properties": { "name": "Rajarajeshwari Nagar", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5055, 12.9385] } },
        { "type": "Feature", "properties": { "name": "Jnanabharathi", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.5005, 12.9285] } },
        { "type": "Feature", "properties": { "name": "Pattanagere", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.4955, 12.9185] } },
        { "type": "Feature", "properties": { "name": "Kengeri Bus Terminal", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.4905, 12.9085] } },
        { "type": "Feature", "properties": { "name": "Kengeri", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.4855, 12.8985] } },
        { "type": "Feature", "properties": { "name": "Challaghatta", "line": "purple" }, "geometry": { "type": "Point", "coordinates": [77.4805, 12.8885] } },

        // Green Line Stations
        { "type": "Feature", "properties": { "name": "Nagasandra", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5005, 13.0485] } },
        { "type": "Feature", "properties": { "name": "Dasarahalli", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5055, 13.0385] } },
        { "type": "Feature", "properties": { "name": "Jalahalli", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5105, 13.0285] } },
        { "type": "Feature", "properties": { "name": "Peenya Industry", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5155, 13.0185] } },
        { "type": "Feature", "properties": { "name": "Peenya", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5205, 13.0085] } },
        { "type": "Feature", "properties": { "name": "Goraguntepalya", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5405, 13.0285] } },
        { "type": "Feature", "properties": { "name": "Yeshwanthpur", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5505, 13.0235] } },
        { "type": "Feature", "properties": { "name": "Sandal Soap Factory", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5555, 13.0145] } },
        { "type": "Feature", "properties": { "name": "Mahalakshmi", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5585, 13.0085] } },
        { "type": "Feature", "properties": { "name": "Rajajinagar", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5585, 12.9985] } },
        { "type": "Feature", "properties": { "name": "Mahakavi Kuvempu Road", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5625, 12.9905] } },
        { "type": "Feature", "properties": { "name": "Srirampura", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5655, 12.9855] } },
        { "type": "Feature", "properties": { "name": "Mantri Square Sampige Road", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5705, 12.9905] } },
        { "type": "Feature", "properties": { "name": "Chickpete", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5745, 12.9665] } },
        { "type": "Feature", "properties": { "name": "Krishna Rajendra Market", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5755, 12.9605] } },
        { "type": "Feature", "properties": { "name": "National College", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5765, 12.9505] } },
        { "type": "Feature", "properties": { "name": "Lalbagh", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5805, 12.9455] } },
        { "type": "Feature", "properties": { "name": "South End Circle", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5805, 12.9365] } },
        { "type": "Feature", "properties": { "name": "Jayanagar", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5825, 12.9285] } },
        { "type": "Feature", "properties": { "name": "Rashtreeya Vidyalaya Road", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5845, 12.9205] } },
        { "type": "Feature", "properties": { "name": "Banashankari", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.9155] } },
        { "type": "Feature", "properties": { "name": "Jaya Prakash Nagar", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.9085] } },
        { "type": "Feature", "properties": { "name": "Yelachenahalli", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.8985] } },
        { "type": "Feature", "properties": { "name": "Konankunte Cross", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.8885] } },
        { "type": "Feature", "properties": { "name": "Doddakallasandra", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.8785] } },
        { "type": "Feature", "properties": { "name": "Vajarahalli", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.8685] } },
        { "type": "Feature", "properties": { "name": "Thalaghattapura", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.8585] } },
        { "type": "Feature", "properties": { "name": "Silk Institute", "line": "green" }, "geometry": { "type": "Point", "coordinates": [77.5735, 12.8485] } },

        // Yellow Line Stations
        { "type": "Feature", "properties": { "name": "Ragigudda", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.5884, 12.9170] } },
        { "type": "Feature", "properties": { "name": "Jayadeva Hospital", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6001, 12.9167] } },
        { "type": "Feature", "properties": { "name": "BTM Layout", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6083, 12.9166] } },
        { "type": "Feature", "properties": { "name": "Central Silk Board", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6206, 12.9165] } },
        { "type": "Feature", "properties": { "name": "Bommanahalli", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6266, 12.9107] } },
        { "type": "Feature", "properties": { "name": "Hongasandra", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6321, 12.9017] } },
        { "type": "Feature", "properties": { "name": "Kudlu Gate", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6393, 12.8900] } },
        { "type": "Feature", "properties": { "name": "Singasandra", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6450, 12.8806] } },
        { "type": "Feature", "properties": { "name": "Hosa Road", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6525, 12.8708] } },
        { "type": "Feature", "properties": { "name": "Beratena Agrahara", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6580, 12.8639] } },
        { "type": "Feature", "properties": { "name": "Electronic City", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6711, 12.8465] } },
        { "type": "Feature", "properties": { "name": "Konappana Agrahara", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6740, 12.8430] } },
        { "type": "Feature", "properties": { "name": "Huskur Road", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6775, 12.8390] } },
        { "type": "Feature", "properties": { "name": "Hebbagodi", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6814, 12.8292] } },
        { "type": "Feature", "properties": { "name": "Bommasandra", "line": "yellow" }, "geometry": { "type": "Point", "coordinates": [77.6883, 12.8194] } }
    ]
};
