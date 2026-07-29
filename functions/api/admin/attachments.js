export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const fileKey = url.searchParams.get("fileKey");

    if (!fileKey) {
        return new Response("Error: Missing 'fileKey' query parameter", { 
            status: 400,
            headers: { "Content-Type": "text/plain" }
        });
    }

    if (!env.BUCKET) {
        return new Response("Error: 'BUCKET' binding is missing in Cloudflare Pages settings.", { 
            status: 500,
            headers: { "Content-Type": "text/plain" }
        });
    }

    const object = await env.BUCKET.get(fileKey);

    if (!object) {
        return new Response(`File not found in R2 for key: ${fileKey}`, { 
            status: 404,
            headers: { "Content-Type": "text/plain" }
        });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Disposition", "inline");

    return new Response(object.body, { headers });
}