import { Resend } from 'resend';

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Email sending is disabled.');
    return { success: true, data: null };
  }

  try {
    const data = await resend.emails.send({
      from: 'AllPropertyLink <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
