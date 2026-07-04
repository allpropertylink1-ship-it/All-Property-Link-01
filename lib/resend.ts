import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY is not set');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: 'AllPropertyLink <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (data.error) {
      console.error('[resend] API error:', data.error);
      const err = data.error as { message?: string; name?: string };
      return { success: false, error: err.message || 'Email delivery failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[resend] Exception:', error);
    return { success: false, error: 'Email service temporarily unavailable' };
  }
}
