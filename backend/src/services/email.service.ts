// src/services/email.service.ts
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

export interface SentEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
  sentAt: Date;
}

export interface EmailDeliveryResult {
  success: boolean;
  provider: "smtp" | "resend" | "console";
  messageId?: string;
  accepted: boolean;
  errorCategory?:
    | "unconfigured"
    | "auth_failure"
    | "rate_limited"
    | "invalid_sender"
    | "network_error"
    | "recipient_rejected";
  errorMessage?: string;
  notice?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private sentEmails: SentEmail[] = []; // In-memory mailbox for test assertions

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    if (env.SMTP_HOST && env.SMTP_USER) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });
      } catch (err: any) {
        console.error(
          `[EmailService] Failed to initialize SMTP transporter: ${err.message}`,
        );
        this.transporter = null;
      }
    }
  }

  /**
   * Retrieves all sent emails (useful for unit test assertions)
   */
  getSentEmails(): SentEmail[] {
    return [...this.sentEmails];
  }

  /**
   * Clears in-memory sent emails
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }

  /**
   * Validates email provider configuration at startup without logging secrets
   */
  validateConfiguration(): {
    provider: string;
    configured: boolean;
    sender: string;
    message: string;
  } {
    const activeProvider = (env.EMAIL_PROVIDER || "console").toLowerCase();

    if (activeProvider === "resend") {
      const hasKey = Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY.trim());
      const maskedKey = hasKey
        ? `${env.RESEND_API_KEY.slice(0, 3)}...${env.RESEND_API_KEY.slice(-4)}`
        : "(missing)";

      if (!hasKey) {
        console.error(
          "[EmailService] ❌ Configuration Error: EMAIL_PROVIDER is set to 'resend' but RESEND_API_KEY is not defined in backend/.env",
        );
        return {
          provider: "resend",
          configured: false,
          sender: env.EMAIL_FROM,
          message: "RESEND_API_KEY is not configured.",
        };
      }

      console.log(
        `[EmailService] ✅ Provider initialized: Resend API (Key: ${maskedKey}, Sender: ${env.EMAIL_FROM})`,
      );

      if (env.EMAIL_FROM.includes("onboarding@resend.dev")) {
        console.log(
          `[EmailService] ℹ️ Testing Mode: Using Resend default test sender (onboarding@resend.dev). Resend delivers to the verified account owner's email address. To deliver to other recipients, verify a custom domain at resend.com/domains.`,
        );
      }

      return {
        provider: "resend",
        configured: true,
        sender: env.EMAIL_FROM,
        message: "Resend API configured and ready.",
      };
    }

    if (activeProvider === "smtp") {
      const configured = Boolean(
        env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS,
      );
      if (!configured) {
        console.error(
          "[EmailService] ❌ Configuration Error: EMAIL_PROVIDER is set to 'smtp' but SMTP_HOST or SMTP_USER/PASS is missing in backend/.env",
        );
        return {
          provider: "smtp",
          configured: false,
          sender: env.EMAIL_FROM,
          message: "SMTP settings are incomplete.",
        };
      }

      const maskedUser = env.SMTP_USER.replace(/(?<=.{2}).(?=.*@)/g, "*");
      console.log(
        `[EmailService] ✅ Provider initialized: SMTP (${env.SMTP_HOST}:${env.SMTP_PORT}, User: ${maskedUser}, Sender: ${env.EMAIL_FROM})`,
      );
      return {
        provider: "smtp",
        configured: true,
        sender: env.EMAIL_FROM,
        message: "SMTP configured and ready.",
      };
    }

    // Default: console
    if (env.NODE_ENV !== "test") {
      console.log(
        `[EmailService] ℹ️ Provider: Console Mock (Real email delivery is disabled; OTP codes are hashed in DB and not sent to inboxes)`,
      );
    }
    return {
      provider: "console",
      configured: true,
      sender: env.EMAIL_FROM,
      message: "Console mock active. Real email delivery disabled.",
    };
  }

  /**
   * Dispatches email via configured provider or safe console fallback.
   * Never prints secrets, OTP codes, or reset tokens in logs.
   */
  private async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
    purpose?: string;
  }): Promise<EmailDeliveryResult> {
    const emailRecord: SentEmail = {
      ...options,
      sentAt: new Date(),
    };
    this.sentEmails.push(emailRecord);

    const activeProvider = (env.EMAIL_PROVIDER || "console").toLowerCase();

    // ==========================================
    // 1. SMTP Provider (Nodemailer)
    // ==========================================
    if (activeProvider === "smtp") {
      if (!env.SMTP_HOST || !env.SMTP_USER) {
        const errorMsg =
          "SMTP provider is selected (EMAIL_PROVIDER=smtp), but SMTP_HOST or SMTP_USER is missing in backend/.env";
        console.error(`[EmailService] Diagnostic Error: ${errorMsg}`);
        return {
          success: false,
          provider: "smtp",
          accepted: false,
          errorCategory: "unconfigured",
          errorMessage: errorMsg,
        };
      }

      if (!this.transporter) {
        this.initTransporter();
      }

      if (!this.transporter) {
        return {
          success: false,
          provider: "smtp",
          accepted: false,
          errorCategory: "unconfigured",
          errorMessage: "SMTP transporter could not be initialized.",
        };
      }

      try {
        console.log(
          `[EmailService] Dispatching email via SMTP to: ${options.to.replace(/(?<=.{2}).(?=.*@)/g, "*")}`,
        );
        const info = await this.transporter.sendMail({
          from: env.EMAIL_FROM,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });

        console.log(
          `[EmailService] SMTP accepted delivery. Message ID: ${info.messageId}`,
        );
        return {
          success: true,
          provider: "smtp",
          accepted: true,
          messageId: info.messageId,
          notice: "Email was successfully accepted by the SMTP server.",
        };
      } catch (err: any) {
        let category: EmailDeliveryResult["errorCategory"] = "network_error";
        if (
          err.code === "EAUTH" ||
          err.responseCode === 535 ||
          err.message?.includes("auth")
        ) {
          category = "auth_failure";
        } else if (
          err.code === "EENVELOPE" ||
          err.message?.includes("sender")
        ) {
          category = "invalid_sender";
        }

        console.error(
          `[EmailService] SMTP delivery failed [${category}]: ${err.message}`,
        );
        return {
          success: false,
          provider: "smtp",
          accepted: false,
          errorCategory: category,
          errorMessage: err.message || "Failed to deliver email via SMTP.",
        };
      }
    }

    // ==========================================
    // 2. Resend API Provider
    // ==========================================
    if (activeProvider === "resend") {
      if (!env.RESEND_API_KEY) {
        const errorMsg =
          "Resend provider is selected (EMAIL_PROVIDER=resend), but RESEND_API_KEY is missing in backend/.env";
        console.error(`[EmailService] Diagnostic Error: ${errorMsg}`);
        return {
          success: false,
          provider: "resend",
          accepted: false,
          errorCategory: "unconfigured",
          errorMessage: errorMsg,
        };
      }

      try {
        console.log(
          `[EmailService] Dispatching email via Resend API to: ${options.to.replace(/(?<=.{2}).(?=.*@)/g, "*")}`,
        );
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          let errJson: any = null;
          try {
            errJson = JSON.parse(errBody);
          } catch {
            // Not valid JSON
          }

          const rawMessage = errJson?.message || errBody;
          let category: EmailDeliveryResult["errorCategory"] = "network_error";

          if (response.status === 401) {
            category = "auth_failure";
          } else if (response.status === 403) {
            if (
              rawMessage.toLowerCase().includes("testing email") ||
              rawMessage.toLowerCase().includes("own email address")
            ) {
              category = "recipient_rejected";
            } else {
              category = "auth_failure";
            }
          } else if (response.status === 429) {
            category = "rate_limited";
          } else if (response.status === 422) {
            if (
              rawMessage.toLowerCase().includes("domain") ||
              rawMessage.toLowerCase().includes("from")
            ) {
              category = "invalid_sender";
            } else {
              category = "recipient_rejected";
            }
          }

          let formattedMessage = rawMessage;
          if (
            category === "recipient_rejected" &&
            rawMessage.toLowerCase().includes("own email address")
          ) {
            const ownerMatch = rawMessage.match(/\(([^)]+)\)/);
            const owner = ownerMatch ? ownerMatch[1] : "your Resend account email";
            formattedMessage = `Resend Testing Mode: Emails can only be delivered to your registered Resend account address (${owner}). Verify a domain at resend.com/domains to send to any address.`;
          }

          console.error(
            `[EmailService] Resend API error [${response.status}] [${category}]: ${formattedMessage}`,
          );

          return {
            success: false,
            provider: "resend",
            accepted: false,
            errorCategory: category,
            errorMessage: formattedMessage,
          };
        }

        const data = (await response.json()) as { id?: string };
        console.log(
          `[EmailService] Resend accepted delivery. Response ID: ${data?.id}`,
        );
        return {
          success: true,
          provider: "resend",
          accepted: true,
          messageId: data?.id,
          notice: "Email was successfully accepted by Resend for delivery.",
        };
      } catch (err: any) {
        console.error(`[EmailService] Resend network error: ${err.message}`);
        return {
          success: false,
          provider: "resend",
          accepted: false,
          errorCategory: "network_error",
          errorMessage: err.message || "Failed to connect to Resend API.",
        };
      }
    }

    // ==========================================
    // 3. Development Console Logger
    // ==========================================
    if (env.NODE_ENV !== "test") {
      console.log(
        `\n[EmailService] 📧 (DEV CONSOLE) Mock Email Generated for: ${options.to.replace(/(?<=.{2}).(?=.*@)/g, "*")}`,
      );
      console.log(`[EmailService] Purpose: ${options.purpose || "Verification"}`);
      console.log(
        `[EmailService] Notice: Real email delivery disabled (EMAIL_PROVIDER=console). Code hashed in DB; not sent to inbox.`,
      );
    }

    return {
      success: true,
      provider: "console",
      accepted: false,
      notice:
        "Development Mode: Real email provider is disabled (EMAIL_PROVIDER=console). No external email was sent to your inbox. Configure SMTP or Resend in backend/.env to deliver real emails.",
    };
  }

  private getEmailTemplate(contentHtml: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>STREN Platform</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090B0F; color: #F5F6F8; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background-color: #101418; border: 1px solid #1E2329; border-radius: 16px; overflow: hidden; padding: 32px; }
    .brand { display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 800; color: #5BE584; letter-spacing: 0.5px; margin-bottom: 24px; text-transform: uppercase; }
    .code-box { background-color: #090B0F; border: 1px solid #2A313A; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #5BE584; }
    .warning { font-size: 12px; color: #91A0B5; line-height: 1.6; border-top: 1px solid #1E2329; padding-top: 20px; margin-top: 24px; }
    .footer { font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">STREN</div>
    ${contentHtml}
    <div class="warning">
      <strong>Security notice:</strong> STREN will never ask for your verification code. If you did not make this request, please change your password immediately or contact support.
    </div>
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} STREN Gym & Athletic Management Platform. All rights reserved.
  </div>
</body>
</html>`;
  }

  /**
   * Send 6-digit email verification OTP
   */
  async sendVerificationEmail(
    to: string,
    name: string,
    otp: string,
  ): Promise<EmailDeliveryResult> {
    const subject = `${otp} is your STREN verification code`;
    const text = `Hi ${name || "there"},\n\nYour STREN verification code is: ${otp}\n\nThis code will expire in 10 minutes. Do not share it with anyone.`;
    const contentHtml = `
      <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin-top: 0;">Verify your email address</h2>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        Welcome to STREN, <strong>${name || "Athlete"}</strong>! Please use the 6-digit verification code below to verify your email address and activate your account.
      </p>
      <div class="code-box">
        <span class="code">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #91A0B5;">
        This code expires in <strong>10 minutes</strong> and can only be used once.
      </p>
    `;

    return this.sendMail({
      to,
      subject,
      text,
      html: this.getEmailTemplate(contentHtml),
      purpose: "Email Verification",
    });
  }

  /**
   * Send password reset OTP and optional direct reset link
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    otp: string,
    resetUrl?: string,
  ): Promise<EmailDeliveryResult> {
    const subject = `${otp} is your STREN password reset code`;
    let text = `Hi ${name || "there"},\n\nYour STREN password reset code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request a password reset, please ignore this email.`;
    if (resetUrl) {
      text += `\n\nAlternatively, you can reset your password directly using the following link:\n${resetUrl}\n\nThis link will expire in 15 minutes.`;
    }

    let linkHtml = "";
    if (resetUrl) {
      linkHtml = `
        <div style="text-align: center; margin: 24px 0 16px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #5BE584; color: #0B0D10; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Reset Password Directly</a>
        </div>
        <p style="font-size: 12px; color: #64748B; text-align: center; margin-bottom: 20px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #5BE584; word-break: break-all;">${resetUrl}</a>
        </p>
      `;
    }

    const contentHtml = `
      <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin-top: 0;">Password Reset Request</h2>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        We received a request to reset the password for your STREN account. Use the 6-digit recovery code below or click the direct reset link:
      </p>
      <div class="code-box">
        <span class="code">${otp}</span>
      </div>
      ${linkHtml}
      <p style="font-size: 13px; color: #91A0B5;">
        The code expires in <strong>10 minutes</strong> and the link expires in <strong>15 minutes</strong>. If you did not request this, your account remains secure and no action is required.
      </p>
    `;

    return this.sendMail({
      to,
      subject,
      text,
      html: this.getEmailTemplate(contentHtml),
      purpose: "Password Reset",
    });
  }

  /**
   * Send password change verification OTP (Method B in Settings)
   */
  async sendPasswordChangeVerificationEmail(
    to: string,
    name: string,
    otp: string,
  ): Promise<EmailDeliveryResult> {
    const subject = `${otp} is your STREN password change code`;
    const text = `Hi ${name || "there"},\n\nYour STREN password change verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request to change your password, please secure your account immediately.`;
    const contentHtml = `
      <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin-top: 0;">Password Change Authorization</h2>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        Hello <strong>${name || "Athlete"}</strong>,
      </p>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        We received a request to update the password for your STREN account. Use the 6-digit authorization code below to confirm this change:
      </p>
      <div class="code-box">
        <span class="code">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #91A0B5;">
        This code expires in <strong>10 minutes</strong>. If you did not initiate this change from your settings, your account may be at risk.
      </p>
    `;

    return this.sendMail({
      to,
      subject,
      text,
      html: this.getEmailTemplate(contentHtml),
      purpose: "Password Change Authorization",
    });
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail(
    to: string,
    name: string,
  ): Promise<EmailDeliveryResult> {
    const subject = `Your STREN password has been changed`;
    const text = `Hi ${name || "there"},\n\nYour STREN password was successfully updated on ${new Date().toUTCString()}.\n\nIf you did not perform this change, please contact support immediately.`;
    const contentHtml = `
      <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin-top: 0;">Password Changed Successfully</h2>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        Hello <strong>${name || "there"}</strong>,
      </p>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        The password for your STREN account was successfully updated. All previous active sessions have been safely terminated.
      </p>
      <p style="font-size: 13px; color: #F59E0B; margin-top: 16px;">
        ⚠️ If you did not make this change, please reset your password immediately or alert our security team.
      </p>
    `;

    return this.sendMail({
      to,
      subject,
      text,
      html: this.getEmailTemplate(contentHtml),
      purpose: "Password Changed Confirmation",
    });
  }

  /**
   * Send security alert
   */
  async sendSecurityAlertEmail(
    to: string,
    name: string,
    alertMessage: string,
  ): Promise<EmailDeliveryResult> {
    const subject = `Security Alert: STREN Account Update`;
    const text = `Hi ${name || "there"},\n\nSecurity notice regarding your STREN account: ${alertMessage}`;
    const contentHtml = `
      <h2 style="font-size: 20px; font-weight: 700; color: #EF4444; margin-top: 0;">Security Alert</h2>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        Hello <strong>${name || "there"}</strong>,
      </p>
      <p style="font-size: 14px; color: #91A0B5; line-height: 1.6;">
        ${alertMessage}
      </p>
    `;

    return this.sendMail({
      to,
      subject,
      text,
      html: this.getEmailTemplate(contentHtml),
      purpose: "Security Alert",
    });
  }
}

export default new EmailService();
