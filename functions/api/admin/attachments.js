export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        
        // 1. Extract the fileKey query parameter from the request URL
        const fileKey = url.searchParams.get('fileKey');

        if (!fileKey) {
            return new Response("Error: Missing fileKey parameter", { status: 400 });
        }

        // 2. Ensure your Cloudflare Pages project is bound to R2
        if (!env.BUCKET) {
            return new Response("Error: R2 BUCKET binding is missing in Cloudflare Pages configuration.", { status: 500 });
        }

        // 3. Fetch the object directly from your R2 bucket
        const object = await env.BUCKET.get(fileKey);

        if (!object) {
            return new Response("Error: Attachment file was not found in storage.", { status: 404 });
        }

        // 4. Set headers so the browser renders PDFs and images inline or downloads the file
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        
        if (!headers.get("Content-Type")) {
            headers.set("Content-Type", "application/octet-stream");
        }

        // 'inline' lets PDFs and images open directly in the browser tab instead of forcing an immediate download
        headers.set("Content-Disposition", "inline");

        return new Response(object.body, {
            headers
        });

    } catch (error) {
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}