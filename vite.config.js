import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            port: 8080,
            open: true,
            proxy: {
                // TomTom Search API for autocomplete (local dev proxy)
                '/api/tomtom-search': {
                    target: 'https://api.tomtom.com',
                    changeOrigin: true,
                    configure: (proxy, options) => {
                        proxy.on('proxyReq', (proxyReq, req, res) => {
                            // Parse our custom query params and build TomTom URL
                            const url = new URL(req.url, 'http://localhost');
                            const query = url.searchParams.get('query') || '';
                            const lat = url.searchParams.get('lat') || '12.9716';
                            const lon = url.searchParams.get('lon') || '77.5946';
                            const limit = url.searchParams.get('limit') || '5';

                            // Build new path for TomTom Fuzzy Search
                            const newPath = `/search/2/search/${encodeURIComponent(query)}.json?key=${env.VITE_TOMTOM_API_KEY}&limit=${limit}&countrySet=IN&lat=${lat}&lon=${lon}&radius=50000&language=en-US&typeahead=true`;
                            proxyReq.path = newPath;
                        });
                    },
                    rewrite: () => '' // Path is built dynamically in configure
                },
                // OSRM Primary - Project OSRM (driving)
                '/api/osrm': {
                    target: 'https://router.project-osrm.org',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/osrm/, '')
                },
                // OSRM Fallback - OpenStreetMap Germany (car)
                '/api/osrm-car': {
                    target: 'https://routing.openstreetmap.de/routed-car',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/osrm-car/, '')
                },
                // TomTom Routing Fallback (uses existing API key)
                '/api/tomtom-routing': {
                    target: 'https://api.tomtom.com/routing/1',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/tomtom-routing/, '')
                }
            }
        }
    };
});
