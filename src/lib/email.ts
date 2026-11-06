import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendResetEmailParams {
  toEmail: string;
  userName?: string;
  resetToken: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendPasswordResetEmail({
  toEmail,
  userName,
  resetToken,
}: SendResetEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KIVO <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      `[Resend Email] RESEND_API_KEY is not configured in environment variables. Email to ${toEmail} could not be dispatched to external inbox. Set RESEND_API_KEY in environment to enable live email delivery.`
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables",
    };
  }

  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: "Failed to initialize Resend client" };
  }

  try {
    const greeting = userName ? `Hello ${userName},` : "Hello,";
    const subject = "Your KIVO Password Reset Code";
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 28px 16px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);">
    <div style="margin-bottom: 24px; text-align: center;">
      <h1 style="color: #2563eb; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">KIVO</h1>
      <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Student Portfolio & Verified Industry Challenges</p>
    </div>

    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Reset Your Password</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      ${greeting}<br><br>
      We received a request to reset your password for your KIVO account (<strong>${toEmail}</strong>). Please enter the verification code below to proceed:
    </p>

    <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 22px; text-align: center; margin: 24px 0;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; margin-bottom: 6px;">Your Reset Code</span>
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; user-select: all;">${resetToken}</span>
    </div>

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
      <p style="font-size: 12px; line-height: 1.5; color: #92400e; margin: 0;">
        ⏳ This code will expire in <strong>15 minutes</strong>. If you did not request this change, you can safely ignore this email — your account remains secure.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />

    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
      Sent securely by KIVO • Automated authentication system
    </p>
  </div>
</body>
</html>
    `;

    const text = `${greeting}

We received a request to reset your password for your KIVO account (${toEmail}).

Your Password Reset Code is: ${resetToken}

This code is valid for 15 minutes. If you did not request this password reset, you can safely ignore this email.

— KIVO Security Team`;

    const response = await resend.emails.send({
      from: fromAddress,
      to: [toEmail],
      subject,
      html,
      text,
    });

    if (response.error) {
      console.error("[Resend Delivery Error]:", response.error);
      return { success: false, error: response.error.message };
    }

    console.log(`[Resend Delivery Success] Dispatched reset email to ${toEmail}. Message ID: ${response.data?.id}`);
    return { success: true, id: response.data?.id };
  } catch (err: any) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: err.message || "Email dispatch failed" };
  }
}
