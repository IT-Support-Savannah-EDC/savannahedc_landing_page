// 1. Define the security headers to allow cross-domain requests
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// 2. Handle the Browser's "Preflight" Security Check
export async function onRequestOptions() {
    return new Response(null, { 
        status: 204,
        headers: corsHeaders 
    });
}

// Utility function to make form keys human-readable (e.g., "firstName" -> "First Name")
function formatFieldName(key) {
    return key
        .replace(/([A-Z])/g, ' $1') // insert a space before all caps
        .replace(/[_-]/g, ' ')      // replace underscores and dashes with spaces
        .replace(/^./, str => str.toUpperCase()) // capitalize the first letter
        .trim();
}

// 3. Handle the POST Request from the Form Submission
export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const RESEND_API_KEY = context.env.RESEND_API_KEY;
        const senderEmail = "no-reply@savannahedc.com";
        const customerServiceEmail = "customer.service@savannahedc.com";

        // Dynamic storage for all extracted data
        let textData = {};
        let attachmentsArray = [];
        
        // Auto-discovery variables
        let customerEmail = "";
        let customerName = "Valued Customer";
        let formTitle = "Website Form Submission";
        let fallbackNameParts = [];

        // --- STEP 1: DYNAMICALLY LOOP THROUGH ALL FORM DATA ---
        for (const [key, value] of formData.entries()) {
            if (!value) continue; // Skip empty fields

            // Check if the entry is a file/attachment
            if (value instanceof File || (typeof value === 'object' && value.size !== undefined)) {
                if (value.size > 0) {
                    const arrayBuffer = await value.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    attachmentsArray.push({
                        filename: value.name || `${key}_attachment`,
                        content: btoa(binary)
                    });
                }
            } else {
                // It's a regular text field
                textData[key] = value;
                const lowerKey = key.toLowerCase();

                // Auto-discover specific fields for personalized emailing
                if (lowerKey === 'email' || lowerKey === 'emailaddress') {
                    customerEmail = value.trim();
                } else if (lowerKey === 'fullname' || lowerKey === 'name') {
                    customerName = value.trim();
                } else if (lowerKey === 'firstname' || lowerKey === 'lastname' || lowerKey === 'surname') {
                    fallbackNameParts.push(value.trim());
                } else if (lowerKey === 'formtitle') {
                    formTitle = value.trim();
                }
            }
        }

        // If 'fullname' wasn't found but 'firstName'/'lastName' were, assemble the name
        if (customerName === "Valued Customer" && fallbackNameParts.length > 0) {
            customerName = fallbackNameParts.join(" ");
        }

        // Ensure we actually got an email address to send the acknowledgement to
        if (!customerEmail) {
            throw new Error("Validation Error: No valid email address provided in the submission.");
        }

        const ticketId = `SEDC-${Math.floor(100000 + Math.random() * 900000)}`;

        // --- STEP 2: GENERATE DYNAMIC HTML ROWS FOR THE TABLE ---
        let dataRowsHtml = '';
        for (const [key, value] of Object.entries(textData)) {
            // Hide internal structural fields from the table output
            if (key.toLowerCase() === 'formtitle') continue;

            dataRowsHtml += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; font-weight: bold; color: #0A1931; width: 35%; font-size: 14px;">
                        ${formatFieldName(key)}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; color: #334155; font-size: 14px;">
                        ${value.replace(/\n/g, '<br>')}
                    </td>
                </tr>
            `;
        }

        // --- STEP 3: HTML EMAIL TEMPLATE COMPILER ---
        const generateTemplate = (headerTitle, greeting, messageBody) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Montserrat', Helvetica, Arial, sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                                <tr><td height="6" style="background-color: #004DC2;"></td></tr>
                                <tr>
                                    <td style="padding: 30px 30px 15px 30px; border-bottom: 1px solid #F1F5F9;">
                                        <img src="https://savannahedc.com/assets/logo.png" alt="SEDC Logo" width="15" height="20" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
                                        <a href="https://savannahedc.com" style="vertical-align: middle; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none; color: #000000a1;">Savannah Electricity Distribution Company</a>
                                        <h3 style="margin: 5px 0 0 0; color: #004DC2; font-size: 15px; font-weight: 650;">${headerTitle}</h3>
                                        <p style="margin: 5px 0 0 0; font-size: 12px; font-weight: bold; color: #64748B;">Ticket Ref: ${ticketId}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 30px 30px 30px;">
                                        <p style="font-size: 15px; color: #1E293B; margin-top: 0;"><strong>${greeting}</strong></p>
                                        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 25px;">${messageBody}</p>
                                        
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                                            ${dataRowsHtml}
                                        </table>

                                        ${attachmentsArray.length > 0 ? `<div style="background-color: #F0FDF4; border-left: 4px solid #5DB922; padding: 10px; margin-top: 20px;"><p style="margin: 0; font-size: 13px; color: #166534; font-weight: 600;">📎 ${attachmentsArray.length} file(s) attached to this submission.</p></div>` : ''}
                                    </td>
                                </tr>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; text-align: center;">
                                  <tr>
                                      <td style="padding: 20px; text-align: center; font-size: 12px; color: #000000;">
                                          &copy; ${new Date().getFullYear()} Savannah EDC. All rights reserved.
                                      </td>
                                      <td style="padding: 20px; text-align: center; font-size: 12px; color: #000000;">
                                          <a href="https://savannahedc.com" style="color: #94A3B8; text-decoration: none;">Visit our website</a>
                                      </td>
                                      <td style="padding: 20px; text-align: center; font-size: 12px; color: #000000;">
                                          <a href="mailto:customer.service@savannahedc.com" style="color: #94A3B8; text-decoration: none;">Contact us</a>
                                          <span style="color: #CBD5E1; margin: 0 8px;">|</span>
                                          <a href="tel:+2349160277148" style="color: #94A3B8; text-decoration: none;">+234 916 027 7148</a>
                                      </td>
                                  </tr>
                                </table>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        // --- STEP 4: PACKAGE EMAILS ---
        const customerPayload = {
            from: `Savannah EDC <${senderEmail}>`,
            to: [customerEmail],
            subject: `Request Acknowledgement: ${formTitle} [${ticketId}]`,
            html: generateTemplate(
                `${formTitle} Received`,
                `Hello ${customerName},`,
                `Thank you for contacting us. We have successfully received your submission and our support team will process it shortly. Below is a copy of the information you submitted:`
            )
        };

        const staffPayload = {
            from: `Savannah EDC Portal <${senderEmail}>`,
            to: [customerServiceEmail],
            subject: `[NEW SUBMISSION] ${formTitle} - Ref: ${ticketId}`,
            html: generateTemplate(
                `Internal Notification: ${formTitle}`,
                `Dear Support Team,`,
                `A new form has been submitted through the portal. Please review the extracted data points below:`
            ),
            attachments: attachmentsArray
        };

        // --- STEP 5: TRANSMIT VIA RESEND API ---
        const sendEmail = async (payload) => {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(await response.text());
            return response.json();
        };

        // Execute both email transmissions concurrently
        await Promise.all([
            sendEmail(customerPayload),
            sendEmail(staffPayload)
        ]);

        return new Response(JSON.stringify({ success: true, message: 'Submission fully processed and emails sent.' }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });
    }
}