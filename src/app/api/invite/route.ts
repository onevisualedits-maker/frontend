import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email, inviteId } = await req.json();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = req.headers.get('host') || 'localhost:3000';
        const setPasswordLink = `${protocol}://${host}/set-password?email=${encodeURIComponent(email)}&inviteId=${encodeURIComponent(inviteId)}`;

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Admin Portal'}" <${process.env.EMAIL_USER}>`,
            to: email, // Send to the invited user
            subject: `Invitation to Join Admin Portal`,
            html: `
        <div style="font-family: sans-serif; line-height: 1.6; max-w-lg margin: 0 auto; color: #333;">
          <h2 style="color: #6d28d9;">You've been invited!</h2>
          <p>You have been invited to join the Jeevan Editz Admin Portal as an administrator.</p>
          <p>Please click the button below to accept your invitation and securely set your password.</p>
          <br />
          <a href="${setPasswordLink}" style="display: inline-block; padding: 12px 24px; background-color: #6d28d9; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
          <br /><br />
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6d28d9;">${setPasswordLink}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, info });
    } catch (error) {
        console.error("Failed to send invite email:", error);
        return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
}
