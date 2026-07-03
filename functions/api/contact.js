export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const RESEND_API_KEY = context.env.RESEND_API_KEY;

        // 1. Extract Form Fields
        const name = formData.get('fullName');
        const email = formData.get('email'); 
        const phone = formData.get('phoneNumber');
        const address = formData.get('address') || 'Not provided';
        const subject = formData.get('subject') || 'New Inquiry';
        const message = formData.get('message') || 'No message provided.';
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

        // 4. Centralized Email Template Builder (Derived from your custom HTML)
        const buildEmailTemplate = (params) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
          <title>${params.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            @media (prefers-color-scheme: dark) {
              .body-wrapper { background-color: #050C18 !important; background-image: none !important; }
              .main-container { background-color: #0A1931 !important; border: 1px solid #1E293B !important; }
              .text-primary { color: #FFFFFF !important; }
              .text-body-dark { color: #E2E8F0 !important; }
              .text-muted { color: #94A3B8 !important; }
              .info-box { background-color: #0F172A !important; border-color: #334155 !important; }
              .footer-section { background-color: #030712 !important; border-top: 1px solid #1E293B !important; }
              .contact-link { color: #5DB922 !important; }
              .divider-line { border-top: 1px solid #1E293B !important; }
              .social-icon { filter: invert(0.8) brightness(2) !important; }
            }
          </style>
        </head>
        <body class="body-wrapper" bgcolor="#F1F5F9" style="margin: 0; padding: 0; background-color: #F1F5F9;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#F1F5F9" style="table-layout: fixed; width: 100% !important; background-color: #F1F5F9;">
            <tr>
              <td align="center" class="body-wrapper" bgcolor="#F1F5F9" style="padding: 40px 14px; background-color: #F1F5F9; background-image: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%); background-repeat: no-repeat; background-size: cover;">
                <table class="main-container" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(10,25,49,0.04); border: 1px solid #E2E8F0;">
                  <tr>
                    <td height="6" style="background-color: ${params.statusColor}; line-height: 6px; font-size: 6px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px 24px 40px;">
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="left" style="font-size: 13px; font-weight: 800; color: #004DC2; line-height: 1.4; font-family: 'Montserrat', sans-serif;" class="text-primary">
                            
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
                      <hr class="divider-line" style="border: 0; border-top: 1px solid #E2E8F0; margin: 0;">
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px 40px 40px; font-size: 15px; line-height: 1.65; color: #334155; font-family: 'Montserrat', sans-serif;" class="text-body-dark">
                      <p style="margin-top: 0; margin-bottom: 18px; font-weight: 700; color: #0A1931;" class="text-primary">${params.greeting}</p>
                      
                      <div style="padding: 5px 5px; margin-bottom: 28px;">
                        ${params.contentBody}
                      </div>

                      <table class="info-box" role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border-radius: 16px; border: 1px dashed #CBD5E1;">
                        <tr>
                          <td style="padding: 16px 20px; font-size: 13px; color: #475569; line-height: 1.6;" class="text-muted">
                            <strong style="color: #0A1931;" class="text-primary">Case Reference:</strong> #${ticketId}<br>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="footer-section" style="padding: 40px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-family: 'Montserrat', sans-serif;">
                        
                        <!-- Company Info & Address Block -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                            <tr>
                                <td align="center" style="font-size: 12px; color: #64748B; line-height: 1.6;" class="text-muted">
                                    <img src="https://savannahedc.com/assets/logo.png" alt="SEDC Logo" width="24" height="24" style="vertical-align: middle; margin-right: 8px; display: inline-block;">
                                    <strong style="color: #0A1931; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;" class="text-primary">Savannah Electricity Distribution Company Ltd.</strong>
                                    <div style="margin-top: 8px;">Savannah EDC Headquarters, Bauchi Street Adjacent Ministry of Works, Gombe, Gombe State, Nigeria.</div>
                                </td>
                            </tr>
                        </table>

                        <!-- Contact Links Block -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                            <tr>
                                <td align="center" style="font-size: 12px; line-height: 1.6;">
                                    <span style="white-space: nowrap; color: #64748B;" class="text-muted">Support: </span>
                                    <a href="mailto:customer.service@savannahedc.com" style="color: #004DC2; text-decoration: none; font-weight: 600;" class="contact-link">customer.service@savannahedc.com</a>
                                    <span style="color: #CBD5E1; margin: 0 8px;">|</span>
                                    <a href="tel:+234123456789" style="color: #004DC2; text-decoration: none; font-weight: 600;" class="contact-link">+234 123 456 789</a>
                                    <br>
                                    <div style="margin-top: 8px;">
                                        <a href="https://savannahedc.com" style="color: #004DC2; text-decoration: none; font-weight: 600; letter-spacing: 0.3px;" class="contact-link">www.savannahedc.com</a>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <!-- Social Icons Block -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                            <tr>
                                <td align="center">
                                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td style="padding: 0 10px;">
                                                <a href="https://facebook.com/SavannahEDC" target="_blank" style="text-decoration: none; display: inline-block;">
                                                    <img class="social-icon" src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000" alt="Facebook" width="24" height="24" style="display: block; border: 0;">
                                                </a>
                                            </td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://x.com/SavannahEDC" target="_blank" style="text-decoration: none; display: inline-block;">
                                                    <img class="social-icon" src="https://img.icons8.com/?size=100&id=ClbD5JTFM7FA&format=png&color=000000" alt="X" width="24" height="24" style="display: block; border: 0;">
                                                </a>
                                            </td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://instagram.com/savannah_edc" target="_blank" style="text-decoration: none; display: inline-block;">
                                                    <img class="social-icon" src="https://img.icons8.com/?size=100&id=32323&format=png&color=000000" alt="Instagram" width="24" height="24" style="display: block; border: 0;">
                                                </a>
                                            </td>
                                            <td style="padding: 0 10px;">
                                                <a href="https://wa.me/2349000000000" target="_blank" style="text-decoration: none; display: inline-block;">
                                                    <img class="social-icon" src="https://img.icons8.com/?size=100&id=16713&format=png&color=000000" alt="WhatsApp" width="24" height="24" style="display: block; border: 0;">
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <!-- Legal / Disclaimer Block -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="font-size: 10px; line-height: 1.6; color: #94A3B8;" class="text-muted">
                                    <p style="margin: 0 0 12px 0; font-weight: 500;">&copy; ${new Date().getFullYear()} Savannah Electricity Distribution Company Ltd. All rights reserved.</p>
                                    <p style="margin: 0; font-style: italic; line-height: 1.5; max-width: 520px; display: inline-block;">
                                        <strong>Disclaimer:</strong> This Email was sent from an automated system. Please do not reply directly to this email. If you have any questions or require further assistance, please contact our customer service team at <a href="mailto:customer.service@savannahedc.com" style="color: #004DC2; text-decoration: none; font-weight: 600;" class="contact-link">customer.service@savannahedc.com</a>
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

        // 5. Build the Shared Details Block (Ensures ALL form fields are displayed)
        const detailsBlock = `
            <table role="presentation" width="100%" style="background-color: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; margin: 16px 0; padding: 16px; font-size: 14px;">
                <tr><td style="padding-bottom: 8px;"><strong>Name:</strong> ${name}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Email:</strong> ${email}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Phone:</strong> ${phone}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Address:</strong> ${address}</td></tr>
                <tr><td style="padding-bottom: 8px;"><strong>Subject:</strong> ${subject}</td></tr>
                <tr><td><strong>Message:</strong><br><div style="white-space: pre-wrap; margin-top: 6px; color: #475569;">${message}</div></td></tr>
            </table>
        `;

        // 6. Compile the Internal Customer Service Email
        const internalHtml = buildEmailTemplate({
            title: 'New Website Submission',
            statusColor: '#004DC2', // Blue
            statusLabel: 'NEW SUBMISSION',
            greeting: 'Hello Customer Service Team,',
            contentBody: `
                <p style="margin: 0;">A new form submission has been made via the website.</p>
                ${detailsBlock}
                <p style="margin: 0;">Please review and respond to the customer as soon as possible.</p>
            `
        });

        // 7. Compile the Auto-Acknowledgement Customer Email
        const customerHtml = buildEmailTemplate({
            title: 'We have received your inquiry',
            statusColor: '#5DB922', // Green
            statusLabel: 'RECEIVED',
            greeting: `Hi ${name},`,
            contentBody: `
                <p style="margin: 0;">Thank you for contacting Savannah Electricity Distribution Company (SEDC). We have successfully received your inquiry[cite: 1]. For your records, below is a copy of the details you submitted:</p>
                ${detailsBlock}
                <p style="margin: 0;">Our customer service team is reviewing your message and will get back to you shortly.</p>
            `
        });

        const senderEmail = 'no-reply@savannahedc.com';

        // 8. Execute Dual Payloads
        const internalPayload = {
            from: `SEDC Website <${senderEmail}>`,
            to: ['customer.service@savannahedc.com'],
            reply_to: email, 
            subject: `New Lead: ${subject} [Ticket ID: ${ticketId}]`,
            html: internalHtml,
            attachments: attachmentsArray 
        };

        const customerPayload = {
            from: `Savannah EDC <${senderEmail}>`,
            to: [email],
            subject: `We have received your inquiry - [Ticket ID: ${ticketId}]`,
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

        return new Response(JSON.stringify({ success: true, message: 'Emails dispatched successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}