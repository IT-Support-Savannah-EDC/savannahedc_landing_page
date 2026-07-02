export async function onRequestPost(context) {
    try {
        const formData = await context.request.formData();
        const RESEND_API_KEY = context.env.RESEND_API_KEY;

        // 1. Extract Form Fields
        const name = formData.get('name') || 'Customer';
        const email = formData.get('email'); // The customer's email address
        const phone = formData.get('phone') || 'N/A';
        const subject = formData.get('subject') || 'New Inquiry';
        const message = formData.get('message') || '';
        const file = formData.get('attachments'); 

        // 2. Safely Process Attachment (Iterative approach to prevent call stack crashes)
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

        // 3. HTML Template 1: For Customer Service (Includes all data & attachment)
        const internalHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #003366; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">New Website Submission</h2>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
                </div>
            </div>
        `;

        // 4. HTML Template 2: Auto-Acknowledgement for the Customer
        const customerHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #003366; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0;">We've Received Your Message!</h2>
                </div>
                <div style="padding: 30px 20px; text-align: center;">
                    <h3 style="color: #28a745;">Hello ${name},</h3>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for contacting Savannah Electricity Distribution Company (SEDC). We have successfully received your inquiry regarding <strong>"${subject}"</strong>.</p>
                    <p style="font-size: 16px; line-height: 1.5;">Our customer service team is reviewing your message and will get back to you shortly.</p>
                    <br>
                    <p style="font-size: 14px; color: #666;">This is an automated confirmation. Please do not reply directly to this email.</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                    &copy; ${new Date().getFullYear()} Savannah Electricity Distribution Company. All rights reserved.
                </div>
            </div>
        `;

        // IMPORTANT: Replace 'no-reply@savannahedc.com' with your actual verified sender domain in Resend.
        const senderEmail = 'no-reply@savannahedc.com'; 

        // 5. Build the Payload for Customer Service
        const internalPayload = {
            from: `SEDC Website <${senderEmail}>`,
            to: ['customer.service@savannahedc.com'],
            reply_to: email, // Allows your reps to hit "Reply" and email the customer directly
            subject: `New Lead: ${subject}`,
            html: internalHtml,
            attachments: attachmentsArray // The JPG is only sent to your internal team
        };

        // 6. Build the Payload for the Customer
        const customerPayload = {
            from: `Savannah EDC <${senderEmail}>`,
            to: [email],
            subject: 'We have received your inquiry',
            html: customerHtml
        };

        // 7. Network Execution Engine
        const sendEmail = async (payload) => {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorLog = await response.text();
                throw new Error(errorLog); // Pushes API errors back to the Catch block
            }
            return response.json();
        };

        // Execute both email dispatches concurrently 
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