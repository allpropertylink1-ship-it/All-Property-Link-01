function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#F6F4EF;font-family:DM Sans,Inter,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="padding:32px 32px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="text-align:center">
              <h1 style="margin:0;font-family:Sora,Inter,sans-serif;font-size:22px;font-weight:700;color:#1C4A40">All Property Link</h1>
            </td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #E2DDD3;margin:24px 0"/>
          ${content}
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;color:#75716B;font-size:12px">
          <p style="margin:0">All Property Link &mdash; Kenya&rsquo;s Marketplace</p>
          <p style="margin:8px 0 0">You received this email because you have an account with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmail(name: string) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">Welcome to All Property Link, ${name}!</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">We&rsquo;re excited to have you join Kenya&rsquo;s most reliable marketplace. Whether you&rsquo;re looking for your dream home, a short-term stay, or trusted service providers, you&rsquo;re in the right place.</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">Here&rsquo;s what you can do now:</p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.8;color:#2D2A25">
      <li>Browse properties across Kenya</li>
      <li>Save your favourite listings</li>
      <li>Contact agents directly</li>
      <li>List your own property</li>
    </ul>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr>
        <td style="background:#D49A44;border-radius:6px;padding:12px 24px">
          <a href="https://allpropertylink.vercel.app/properties" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">Browse Properties</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#75716B">If you didn&rsquo;t create this account, please ignore this email.</p>
  `);
}

export function newInquiryEmail(props: { propertyTitle: string; name: string; email: string; phone?: string | null; message: string }) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">New Inquiry</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">You received a new inquiry about <strong>${props.propertyTitle}</strong>.</p>
    <table role="presentation" cellpadding="12" cellspacing="0" style="width:100%;background:#F6F4EF;border-radius:6px;margin-bottom:20px;font-size:13px">
      <tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Name</td><td style="padding:8px 12px;color:#2D2A25">${props.name}</td></tr>
      <tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Email</td><td style="padding:8px 12px;color:#2D2A25">${props.email}</td></tr>
      ${props.phone ? `<tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Phone</td><td style="padding:8px 12px;color:#2D2A25">${props.phone}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;color:#75716B;font-weight:600">Message</td><td style="padding:8px 12px;color:#2D2A25">${props.message}</td></tr>
    </table>
    <p style="margin:0 0 24px;font-size:13px;color:#75716B">Log in to your dashboard to respond.</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#286255;border-radius:6px;padding:12px 24px">
          <a href="https://allpropertylink.vercel.app/dashboard/inquiries" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">View Inquiries</a>
        </td>
      </tr>
    </table>
  `);
}

export function inquiryResponseEmail(props: { propertyTitle: string; responseMessage: string }) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">Response to Your Inquiry</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">You received a response regarding <strong>${props.propertyTitle}</strong>.</p>
    <blockquote style="margin:0 0 20px;padding:16px;background:#F6F4EF;border-left:3px solid #D49A44;border-radius:4px;font-size:14px;line-height:1.6;color:#2D2A25">${props.responseMessage}</blockquote>
    <p style="margin:0 0 24px;font-size:13px;color:#75716B">Log in to your dashboard to view the full conversation.</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#286255;border-radius:6px;padding:12px 24px">
          <a href="https://allpropertylink.vercel.app/dashboard/inquiries" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">View Response</a>
        </td>
      </tr>
    </table>
  `);
}

export function contactFormEmail(props: { name: string; email: string; phone?: string | null; subject?: string | null; message: string }) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">Contact Form Submission</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#2D2A25">A new message was submitted via the contact form.</p>
    <table role="presentation" cellpadding="12" cellspacing="0" style="width:100%;background:#F6F4EF;border-radius:6px;margin-bottom:20px;font-size:13px">
      <tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Name</td><td style="padding:8px 12px;color:#2D2A25">${props.name}</td></tr>
      <tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Email</td><td style="padding:8px 12px;color:#2D2A25">${props.email}</td></tr>
      ${props.phone ? `<tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Phone</td><td style="padding:8px 12px;color:#2D2A25">${props.phone}</td></tr>` : ""}
      ${props.subject ? `<tr><td style="padding:8px 12px;color:#75716B;border-bottom:1px solid #E2DDD3;font-weight:600">Subject</td><td style="padding:8px 12px;color:#2D2A25">${props.subject}</td></tr>` : ""}
      <tr><td style="padding:8px 12px;color:#75716B;font-weight:600">Message</td><td style="padding:8px 12px;color:#2D2A25">${props.message}</td></tr>
    </table>
  `);
}

export function propertyApprovedEmail(props: { title: string }) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">Property Approved!</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">Great news! Your property <strong>${props.title}</strong> has been approved and is now live on All Property Link.</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#2D2A25">It will now appear in search results and be visible to potential buyers and tenants across Kenya.</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#286255;border-radius:6px;padding:12px 24px">
          <a href="https://allpropertylink.vercel.app/dashboard/listings" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">View My Listings</a>
        </td>
      </tr>
    </table>
  `);
}

export function resetPasswordEmail(props: { resetUrl: string }) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">Reset Your Password</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr>
        <td style="background:#D49A44;border-radius:6px;padding:12px 24px">
          <a href="${props.resetUrl}" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">Reset Password</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#75716B">If you didn't request this, please ignore this email.</p>
  `);
}

export function propertyRejectedEmail(props: { title: string; reason?: string }) {
  return baseHtml(`
    <h2 style="margin:0 0 12px;font-family:Sora,Inter,sans-serif;font-size:18px;font-weight:600;color:#286255">Property Update</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#2D2A25">Your property <strong>${props.title}</strong> was not approved.</p>
    ${props.reason ? `<blockquote style="margin:0 0 20px;padding:16px;background:#F6F4EF;border-left:3px solid #D49A44;border-radius:4px;font-size:14px;line-height:1.6;color:#2D2A25">${props.reason}</blockquote>` : ""}
    <p style="margin:0;font-size:14px;line-height:1.6;color:#2D2A25">Please review the feedback, make the necessary changes, and resubmit your listing for approval.</p>
  `);
}
