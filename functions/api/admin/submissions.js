export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // 1. Get filters from URL (e.g., ?formType=kyc)
    const formType = url.searchParams.get('formType');
    
    // 2. Build the SQL query
    let sql = "SELECT * FROM form_submissions ORDER BY submitted_at DESC LIMIT 100";
    let params = [];

    if (formType && formType !== 'all') {
      sql = "SELECT * FROM form_submissions WHERE form_type = ? ORDER BY submitted_at DESC LIMIT 100";
      params.push(formType);
    }

    // 3. Execute query on D1
    const { results } = await env.DB.prepare(sql).bind(...params).all();

    // 4. Return results as JSON
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}