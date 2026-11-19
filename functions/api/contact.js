/**
 * functions/api/contact.js (savannahedc.com Cloudflare Pages)
 * Uses Cloudflare Service Binding (`env.ORCHESTRATOR`) and normalizes
 * responses for both legacy Apps Script handlers and SEDC AI clients.
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        if (!env.PORTAL_INGEST_SECRET) {
            return Response.json(
                {
                    ok: false,
                    result: "error",
                    error: "PORTAL_INGEST_SECRET is not configured on Cloudflare Pages.",
                },
                { status: 500 }
            );
        }

        if (!env.ORCHESTRATOR && !env.ORCHESTRATOR_PORTAL_URL) {
            return Response.json(
                {
                    ok: false,
                    result: "error",
                    error: "ORCHESTRATOR service binding is not configured on Cloudflare Pages.",
                },
                { status: 500 }
            );
        }

        const contentType = request.headers.get("content-type") || "";
        const rawBody = await request.arrayBuffer();

        const forwardHeaders = {
            "Content-Type": contentType,
            "X-Portal-Secret": env.PORTAL_INGEST_SECRET,
        };

        const upstreamResponse = env.ORCHESTRATOR
            ? await env.ORCHESTRATOR.fetch("https://sedc-orchestrator.internal/api/portal/submit", {
                method: "POST",
                headers: forwardHeaders,
                body: rawBody,
            })
            : await fetch(env.ORCHESTRATOR_PORTAL_URL, {
                method: "POST",
                headers: forwardHeaders,
                body: rawBody,
            });

        const responseText = await upstreamResponse.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = {
                ok: false,
                result: "error",
                error: `Upstream Worker returned HTTP ${upstreamResponse.status}: ${responseText.slice(0, 200)}`,
            };
        }

        // Include legacy Apps Script success flags so existing frontend handlers succeed
        if (upstreamResponse.ok && data && data.ok) {
            data = {
                ...data,
                success: true,
                result: "success",
                status: "success",
                ticketId: data.ticket_ref,
            };
        } else if (data && !data.result) {
            data.result = "error";
        }

        return Response.json(data, { status: upstreamResponse.status });
    } catch (err) {
        console.error("Pages proxy error:", err.message);
        return Response.json(
            {
                ok: false,
                result: "error",
                error: `Proxy fetch failed: ${err.message}`,
            },
            { status: 502 }
        );
    }
}