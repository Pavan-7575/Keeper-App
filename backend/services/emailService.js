import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env with override: true
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createTransporter = () => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    if (user && pass && user !== 'your_email@gmail.com') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user,
                pass,
            },
        });
    }
    return null;
};

export const sendVerificationEmail = async (email, token) => {
    try {
        const transporter = createTransporter();
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #f5ba13;">Keeper App - Verify Your Email</h2>
                <p>Thank you for registering with Keeper App. Please click the button below to verify your email address:</p>
                <a href="${verifyUrl}" style="background-color: #f5ba13; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 15px 0;">Verify Email</a>
                <p>Or copy and paste this link in your browser:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>
            </div>
        `;

        if (transporter) {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || `Keeper App <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Keeper App - Verify Your Email',
                html: htmlContent,
            });
            console.log(`📧 [EMAIL SENT] Verification email successfully sent to ${email}`);
        } else {
            console.log(`[EMAIL SIMULATION] Verification Email sent to ${email}: ${verifyUrl}`);
        }
    } catch (error) {
        console.error(`❌ [EMAIL ERROR] Failed to send verification email to ${email}:`, error.message);
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    try {
        const transporter = createTransporter();
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password?token=${token}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #f5ba13;">Keeper App - Password Reset</h2>
                <p>You requested a password reset for your Keeper App account. Click the link below to set a new password:</p>
                <a href="${resetUrl}" style="background-color: #f5ba13; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 15px 0;">Reset Password</a>
                <p>This link is valid for 1 hour.</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
            </div>
        `;

        if (transporter) {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || `Keeper App <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Keeper App - Password Reset Request',
                html: htmlContent,
            });
            console.log(`📧 [EMAIL SENT] Password reset email successfully sent to ${email}`);
        } else {
            console.log(`[EMAIL SIMULATION] Reset Password Email sent to ${email}: ${resetUrl}`);
        }
    } catch (error) {
        console.error(`❌ [EMAIL ERROR] Failed to send password reset email to ${email}:`, error.message);
    }
};
