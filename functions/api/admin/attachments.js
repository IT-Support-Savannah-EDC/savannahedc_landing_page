// functions/api/admin/attachment.js

export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        
        // 1. Get raw fileKey parameter and decode it
        const rawFileKey = url.searchParams.get('fileKey');

        if (!rawFileKey || rawFileKey === "undefined") {
            return new Response("Error: Missing or invalid fileKey parameter.", { 
                status: 400,
                headers: { "Content-Type": "text/plain" }
            });
        }

        const fileKey = decodeURIComponent(rawFileKey);

        if (!env.BUCKET) {
            return new Response("Error: R2 'BUCKET' binding is missing in Cloudflare Pages.", { 
                status: 500,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // 2. Fetch object from R2
        const object = await env.BUCKET.get(fileKey);

        if (!object) {
            return new Response(`File non-existent in R2 for key: "${fileKey}"`, { 
                status: 404,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // 3. Construct file response
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Content-Type", headers.get("Content-Type") || "application/octet-stream");
        headers.set("Content-Disposition", "inline");

        return new Response(object.body, { headers });

    } catch (error) {
        return new Response(`Server Error: ${error.message}`, { 
            status: 500,
            headers: { "Content-Type": "text/plain" }
        });
    }
}