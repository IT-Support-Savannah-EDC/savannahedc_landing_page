// functions/api/contact.js

export async function onRequestPost(context) {
    // context.env holds your environmental variables (like the Resend API key)
    // context.request holds the incoming data from the frontend form
    const { request, env } = context;

    try {
        // 1. Grab the form data exactly as the browser sends it (no manual JSON formatting needed)
        const formData = await request.formData();

        // 2. Extract the specific text fields submitted by the user
        const fullName = formData.get('fullName');
        const email = formData.get('email');
        const phoneNumber = formData.get('phoneNumber');
        const address = formData.get('address');
        const message = formData.get('message');
        
        // Extract optional fields, defaulting to "N/A" if they don't exist
        const accountNumber = formData.get('accountNumber') || "N/A";
        const meterNumber = formData.get('meterNumber') || "N/A";

        // 3. Handle the optional file attachment
        const file = formData.get('attachments');
        let attachmentsArray = [];

        if (file && file.size > 0) {
            // Convert the file into a format the Resend API accepts
            const arrayBuffer = await file.arrayBuffer();
            // Cloudflare Workers use standard web APIs, so we convert the buffer to a base64 string here on the server
            const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            attachmentsArray.push({
                filename: file.name,
                content: base64String,
            });
        }

        // 4. Construct the email payload for Resend
        const resendPayload = {
            // The verified domain email you set up in Phase 1
            from: "it.support@savannahedc.com", 
            // The destination inbox
            to: ["customer.service@savannahedc.com"], 
            subject: `New Customer Submission from ${fullName}`,
            html: `
                <h2>New Intake Form Submission</h2>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phoneNumber}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Account Number:</strong> ${accountNumber}</p>
                <p><strong>Meter Number:</strong> ${meterNumber}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
            attachments: attachmentsArray
        };

        // 5. Send the payload to the Resend API
        const resendRequest = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(resendPayload)
        });

        // 6. Check if Resend accepted the email
        if (resendRequest.ok) {
            return new Response(JSON.stringify({ success: true, message: "Email routed successfully." }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            const errorText = await resendRequest.text();
            throw new Error(`Resend API Error: ${errorText}`);
        }

    } catch (error) {
        // If anything fails, log it and tell the frontend
        console.error("Worker Error:", error.message);
        return new Response(JSON.stringify({ success: false, error: "Internal server anomaly during transmission." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}