import { Resend } from "resend";

// #16, ADR-0012. Sandbox sender (Resend delivers `onboarding@resend.dev`
// mail only to the account owner's own verified address, not arbitrary
// recipients) until a real domain is verified — swap RESEND_FROM_EMAIL
// in .env when that happens, nothing else about this file changes.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set — see .env.example (ADR-0012)",
    );
  }
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const resend = getClient();
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your Kontrola password",
    text: `Someone (hopefully you) asked to reset the password for your Kontrola account.\n\nReset it here: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    html: `<p>Someone (hopefully you) asked to reset the password for your Kontrola account.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
