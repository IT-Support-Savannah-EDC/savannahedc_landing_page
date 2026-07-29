export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fileKey = url.searchParams.get('fileKey');

    if (!fileKey) return new Response("Missing fileKey", { status: 400 });

    // 1. Fetch the object directly from the bound R2 bucket
    const object = await env.BUCKET.get(fileKey);

    if (object === null) {
      return new Response("File not found", { status: 404 });
    }

    // 2. Serve the file directly to the authorized staff member's browser
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return new Response(object.body, {
      headers,
    });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}