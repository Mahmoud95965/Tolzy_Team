import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
// You should add EMAIL_USER and EMAIL_PASS to your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp.your-provider.com' for others
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});



export async function POST(request: NextRequest) {
    try {
        const { recipients, subject, message } = await request.json();

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
        }

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        // Batch sending to avoid limits (e.g., 50 at a time)
        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < recipients.length; i += batchSize) {
            batches.push(recipients.slice(i, i + batchSize));
        }

        console.log(`Sending email to ${recipients.length} recipients in ${batches.length} batches`);

        for (const batch of batches) {
            await transporter.sendMail({
                from: `Tolzy Platform <${process.env.EMAIL_USER}>`, // Custom sender name
                to: process.env.EMAIL_USER, // Send to self (recipients in BCC to hide others)
                bcc: batch,
                subject: subject,
                html: message,
            });
        }

        return NextResponse.json({ success: true, message: `Sent to ${recipients.length} users` });

    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
    }
}
