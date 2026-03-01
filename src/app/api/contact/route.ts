/// <reference types="node" />
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use implicitly TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Jeevan Contact'}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact Request: ${subject}`,
            text: `You have received a new message from ${name} (${email}):\n\n${message}`,
        };

        const info = await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, info });
    } catch (error) {
        console.error("Failed to send email:", error);
        return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
}
