export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname.replace(/^\/api\/osrm2/, '');
    // Note: osrm2 target has a subpath /routed-car
    const targetUrl = 'https://routing.openstreetmap.de/routed-car' + path + url.search;

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
