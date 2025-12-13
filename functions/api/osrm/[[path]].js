export async function onRequest(context) {
    const url = new URL(context.request.url);
    // Strip the /api/osrm prefix to get the path for the upstream server
    const path = url.pathname.replace(/^\/api\/osrm/, '');
    const targetUrl = 'https://router.project-osrm.org' + path + url.search;

    try {
        const response = await fetch(targetUrl, {
            method: context.request.method,
            headers: context.request.headers,
            body: context.request.body,
        });
        return response;
    } catch (err) {
        return new Response('Proxy Error: ' + err.message, { status: 500 });
    }
}
