import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Lazy initialization of Resend client
let resend = null;

const getResendClient = () => {
    if (!resend) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error(
                "RESEND_API_KEY is not set in environment variables"
            );
        }
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        // Check if API key is available
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set in environment variables");
            return { success: false, error: "Email service not configured" };
        }

        // Determine the correct frontend URL based on environment
        const frontendUrl =
            process.env.NODE_ENV === "production"
                ? "https://ostep-web.onrender.com"
                : process.env.FRONTEND_URL || "http://localhost:5173";

        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        console.log("Sending password reset email to:", email);
        console.log("Reset URL:", resetUrl);

        const resendClient = getResendClient();
        const result = await resendClient.emails.send({
            from: "OS Sim <onboarding@resend.dev>", // Use Resend's default domain for testing
            to: email,
            subject: "Password Reset Request - OS Sim",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .button { 
              display: inline-block; 
              background: #3B82F6; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>OS Sim</h1>
              <h2>Password Reset Request</h2>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              
              <p>We received a request to reset your password for your OS Sim account. Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
                ${resetUrl}
              </p>
              
              <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
              
              <p>If you didn't request this reset, please ignore this email.</p>
              
              <p>Best regards,<br>The OS Sim Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        console.log("Password reset email sent successfully:", result.id);
        return { success: true, messageId: result.id };
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, error: error.message };
    }
};
