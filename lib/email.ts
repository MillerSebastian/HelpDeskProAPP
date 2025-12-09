import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendVerificationEmail(email: string, link: string) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Verify your email address - HelpDeskPro',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to HelpDeskPro!</h2>
                <p>Please click the button below to verify your email address and activate your account.</p>
                <a href="${link}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Verify Email</a>
                <p style="margin-top: 20px; color: #666;">If you didn't create this account, you can safely ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}
