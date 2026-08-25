import nodemailer from 'nodemailer';

interface SendAuthEmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
    otp?: string;
}

export async function sendAuthEmail(options: SendAuthEmailOptions): Promise<{ success: boolean; method: string }> {
    const { to, subject, htmlContent, otp } = options;
    const senderEmail = process.env.EMAIL_USER || 'newstolzy.ai@gmail.com';

    // 1. Try Brevo API first
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
        try {
            const emailData = {
                sender: { email: senderEmail, name: 'Tolzy Support' },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent,
            };

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': brevoApiKey,
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                return { success: true, method: 'brevo' };
            }
            const errorDetails = await response.text();
            console.warn('⚠️ Brevo API error, falling back to Nodemailer/SMTP:', errorDetails);
        } catch (e: any) {
            console.warn('⚠️ Brevo fetch failed, falling back:', e?.message || e);
        }
    }

    // 2. Try Nodemailer (Gmail / Custom SMTP)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });

            await transporter.sendMail({
                from: `Tolzy Platform <${emailUser}>`,
                to: to,
                subject: subject,
                html: htmlContent,
            });

            return { success: true, method: 'nodemailer' };
        } catch (nodemailerErr: any) {
            console.warn('⚠️ Nodemailer SMTP failed:', nodemailerErr?.message || nodemailerErr);
        }
    }

    // 3. Development / Sandbox Fallback
    console.log(`\n==================================================`);
    console.log(`📧 [AUTH EMAIL DISPATCHER] To: ${to}`);
    console.log(`🔑 [OTP CODE]: ${otp || 'N/A'}`);
    console.log(`📋 [SUBJECT]: ${subject}`);
    console.log(`==================================================\n`);

    return { success: true, method: 'dev_fallback' };
}
