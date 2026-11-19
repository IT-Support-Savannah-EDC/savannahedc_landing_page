/**
 * functions/api/contact.js (savannahedc.com Cloudflare Pages)
 * Thin proxy forwarding all website form submissions to SEDC Orchestrator.
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.ORCHESTRATOR_PORTAL_URL || !env.PORTAL_INGEST_SECRET) {
            return Response.json(
                {
                    ok: false,
                    error: "Portal gateway is not configured on the web server.",
                },
                { status: 500 }
            );
        }

        const contentType = request.headers.get("content-type") || "";
        const rawBody = await request.arrayBuffer();

        const upstreamResponse = await fetch(env.ORCHESTRATOR_PORTAL_URL, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                "X-Portal-Secret": env.PORTAL_INGEST_SECRET,
            },
            body: rawBody,
        });

        const responseText = await upstreamResponse.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = {
                ok: false,
                error: `Upstream Worker returned HTTP ${upstreamResponse.status}: ${responseText.slice(0, 200)}`,
            };
        }

        return Response.json(data, { status: upstreamResponse.status });
    } catch (err) {
        console.error("Pages proxy error:", err.message);
        return Response.json(
            {
                ok: false,
                error: `Proxy fetch failed: ${err.message}`,
            },
            { status: 502 }
        );
    }
}