// 1. Define the security headers to allow cross-domain requests
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allows any website to send data. (Can be restricted to "https://savannahedc.com" later)
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

// 3. Handle the POST Request from the Form Submission
export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const RESEND_API_KEY = context.env.RESEND_API_KEY;

        // 1. Extract Form Fields (Updated to match Log-a-Complaint layout)
        const name = formData.get('fullName');
        const email = formData.get('email'); 
        const phone = formData.get('phoneNumber');
        const address = formData.get('address');
        const accountNumber = formData.get('accountNumber') || 'N/A';
        const meterNumber = formData.get('meterNumber') || 'N/A';
        
        // Extract Dropdown logic
        const type = formData.get('complaintType');
        let subType = formData.get('subCategory');
        const otherIssue = formData.get('otherIssue');
        
        // If they chose 'Other', swap the subType for their typed text
        if (subType === 'Other (Specify)' && otherIssue) {
            subType = otherIssue;
        }

        const additionalInfo = formData.get('additionalInfo') || 'No additional information provided.';
        const file = formData.get('attachments'); 

        // 2. Safely Process Attachment
        let attachmentsArray = [];
        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            attachmentsArray.push({
                filename: file.name,
                content: btoa(binary)
            });
        }

        // 3. Generate a Unique Ticket ID
        const ticketId = `SEDC-${Math.floor(100000 + Math.random() * 900000)}`;

        // 4. Formulate the dynamic Subject Line
        // Example output: "Complaint: Billing - Overbilling"
        const finalSubject = `Complaint: ${type} - ${subType}`;

        // 5. Centralized Email Template Builder
        const buildEmailTemplate = (params) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${params.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; width: 100% !important; font-family: 'Montserrat', sans-serif; background-color: #F1F5F9; }
            table { border-collapse: collapse !important; }
          </style>
        </head>
        <body bgcolor="#F1F5F9">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#F1F5F9">
            <tr>
              <td align="center" style="padding: 40px 14px;">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0;">
                  <tr>
                    <td height="6" style="background-color: ${params.statusColor}; line-height: 6px; font-size: 6px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px 24px 40px;">
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="left" style="font-size: 13px; font-weight: 800; color: #004DC2; line-height: 1.4;">
                            <img src="https://savannahedc.com/assets/logo.png" alt="SEDC Logo" width="24" height="24" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
                            <span style="vertical-align: middle; letter-spacing: 0.5px; text-transform: uppercase;">Savannah Electricity Distribution Company</span>
                          </td>
                        </tr>
                        <tr>
                          <td align="left" style="padding-top: 12px;">
                            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${params.statusColor}; border: 1px solid ${params.statusColor}; padding: 3px 8px; border-radius: 6px; display: inline-block;">
                              ${params.statusLabel}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px;">
                      <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 0;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px 40px 40px; font-size: 15px; line-height: 1.65; color: #334155;">
                      <p style="margin-top: 0; margin-bottom: 18px; font-weight: 700; color: #0A1931;">${params.greeting}</p>
                      
                      <div style="margin-bottom: 28px;">
                        ${params.contentBody}
                      </div>

                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border-radius: 16px; border: 1px dashed #CBD5E1;">
                        <tr>
                          <td style="padding: 16px 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                            <strong style="color: #0A1931;">Case Reference:</strong> #${ticketId}<br>
                            <strong style="color: #0A1931;">Issue Type:</strong> ${type}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                            <tr>
                                <td align="center" style="font-size: 12px; color: #64748B; line-height: 1.6;">
                                    <strong style="color: #0A1931; font-size: 14px; text-transform: uppercase;">Savannah Electricity Distribution Company Ltd.</strong>
                                    <div style="margin-top: 8px;">Bauchi Street Adjacent Ministry of Works, Gombe, Nigeria.</div>
                                </td>
                            </tr>
                        </table>
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                            <tr>
                                <td align="center" style="font-size: 12px; line-height: 1.6;">
                                    <a href="mailto:customer.service@savannahedc.com" style="color: #004DC2; text-decoration: none; font-weight: 600;">customer.service@savannahedc.com</a>
                                    <span style="color: #CBD5E1; margin: 0 8px;">|</span>
                                    <a href="tel:+2349069746636" style="color: #004DC2; text-decoration: none; font-weight: 600;">+234 906 974 6636</a>
                                </td>
                            </tr>
                        </table>
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="font-size: 10px; line-height: 1.6; color: #94A3B8;">
                                    <p style="margin: 0 0 12px 0; font-weight: 500;">&copy; ${new Date().getFullYear()} SEDC Ltd. All rights reserved.</p>
                                    <p style="margin: 0; font-style: italic; display: inline-block;">
                                        Disclaimer: This is an automated email. Please do not reply directly to this address.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        // 6. Build the Details Block (Updated for new specific payload criteria)
        const detailsBlock = `
            <table role="presentation" width="100%" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin: 16px 0; padding: 16px; font-size: 14px;">
                <tr><td style="padding-bottom: 8px;"><strong>Name:</strong> ${name}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Email:</strong> ${email}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Phone:</strong> ${phone}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Address:</strong> ${address}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Account Number:</strong> ${accountNumber}</td></tr>
                <tr><td style="padding-bottom: 16px; border-bottom: 1px solid #CBD5E1;"><strong>Meter Number:</strong> ${meterNumber}</td></tr>
                
                <tr><td style="padding-top: 16px; padding-bottom: 8px;"><strong>Category:</strong> ${type}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Specific Issue:</strong> ${subType}</td></tr>
                <tr><td><strong>Additional Information:</strong><br><div style="white-space: pre-wrap; margin-top: 6px; color: #475569; border-left: 3px solid #004DC2; padding-left: 10px;">${additionalInfo}</div></td></tr>
            </table>
        `;

        // 7. Compile the Emails
        const internalHtml = buildEmailTemplate({
            title: 'New Support Ticket',
            statusColor: '#004DC2', // Blue
            statusLabel: 'NEW TICKET',
            greeting: 'Hello Customer Service Team,',
            contentBody: `
                <p style="margin: 0;">A new complaint has been logged via the website portal.</p>
                ${detailsBlock}
                <p style="margin: 0;">Please review the provided data and respond to the customer appropriately.</p>
            `
        });

        const customerHtml = buildEmailTemplate({
            title: 'Complaint Logged Successfully',
            statusColor: '#5DB922', // Green
            statusLabel: 'RECEIVED',
            greeting: `Hi ${name},`,
            contentBody: `
                <p style="margin: 0;">Thank you for contacting Savannah Electricity Distribution Company (SEDC). Your complaint has been successfully mapped into our telemetry queues. Below is a copy of your submission details:</p>
                ${detailsBlock}
                <p style="margin: 0;">Our customer support team is reviewing your ticket and will reach out to you shortly to help resolve this issue.</p>
            `
        });

        const senderEmail = 'no-reply@savannahedc.com';

        // 8. Execute Payloads (using unique ticket IDs in subjects to prevent threading)
        const internalPayload = {
            from: `SEDC Portal <${senderEmail}>`,
            to: ['customer.service@savannahedc.com'],
            reply_to: email, 
            subject: `${finalSubject} [${ticketId}]`, 
            html: internalHtml,
            attachments: attachmentsArray 
        };

        const customerPayload = {
            from: `Savannah EDC <${senderEmail}>`,
            to: [email],
            subject: `Support Ticket Created: Ref ${ticketId}`,
            html: customerHtml
        };

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

        await Promise.all([
            sendEmail(internalPayload),
            sendEmail(customerPayload)
        ]);

        return new Response(JSON.stringify({ success: true, message: 'Complaint filed successfully.' }), {
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