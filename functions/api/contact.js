/**
 * functions/api/contact.js (savannahedc.com Cloudflare Pages)
 * Thin proxy that forwards all website form submissions (Contact Us,
 * Customer Data / KYC, Get a Meter, and future forms) to SEDC Orchestrator (SEDC  AI).
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

        // Forward raw multipart body & boundary untouched to sedc-orchestrator
        const upstreamResponse = await fetch(env.ORCHESTRATOR_PORTAL_URL, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                "X-Portal-Secret": env.PORTAL_INGEST_SECRET,
            },
            body: request.body,
        });

        const data = await upstreamResponse.json();
        return Response.json(data, { status: upstreamResponse.status });
    } catch (err) {
        console.error("Pages proxy error:", err.message);
        return Response.json(
            {
                ok: false,
                error: "Unable to reach the SEDC ticketing server. Please try again.",
            },
            { status: 502 }
        );
    }
}