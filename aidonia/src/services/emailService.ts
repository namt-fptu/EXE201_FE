import api from "./axios";

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

export interface EmailVerificationResponse {
  isSuccess: boolean;
  message: string;
  data?: boolean | object | null;
}

class EmailService {
  /**
   * Send a general email
   */
  async sendEmail(emailData: SendEmailRequest): Promise<void> {
    const response = await api.post("emails/send", emailData);
    return response.data;
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    email: string
  ): Promise<EmailVerificationResponse> {
    const response = await api.get("emails/resend-verifivation", {
      params: { email },
    });
    return response.data;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await api.get("emails/verify", {
      params: { token },
    });
    return response.data;
  }

  /**
   * Generate verification email HTML template
   */
  generateVerificationEmailTemplate(
    userName: string,
    verificationLink: string
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Aidonia</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #3C50E0; margin: 0; font-size: 28px;">Aidonia</h1>
          </div>
          
          <div style="background-color: #f8f9ff; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #3C50E0; margin: 0 0 20px 0; font-size: 24px;">Email Verification Required</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              Hello ${userName},
            </p>
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for registering with Aidonia! To complete your account setup and access all features, 
              please verify your email address by clicking the button below.
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" 
               style="background-color: #3C50E0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Verify My Email
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This verification link will expire in 24 hours. 
              If you didn't create an account with Aidonia, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #3C50E0; font-size: 14px; word-break: break-all; margin: 10px 0;">
              ${verificationLink}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Best regards,<br>
              The Aidonia Team
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;
