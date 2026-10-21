interface ContactEmailProps {
  name: string
  email: string
  subject: string
  message: string
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || 'IN'
}

export function renderContactEmail({
  name,
  email,
  subject,
  message,
}: ContactEmailProps): { html: string; text: string } {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message)
  const initials = getInitials(name)
  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=Re:%20${encodeURIComponent(subject)}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry - Hung Nguyen</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);">
          
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #0284c7; margin-bottom: 4px;">Portfolio Contact Form</div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">New Inquiry Received</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 600; border: 1px solid #a7f3d0;">
                      ● Live Via Resend
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Details Card -->
          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px 20px;">
                <tr>
                  <td width="44" valign="top">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; font-weight: 700; font-size: 14px; text-align: center; line-height: 40px;">
                      ${initials}
                    </div>
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${safeName}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">
                      <a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${safeEmail}</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject Field -->
          <tr>
            <td style="padding: 20px 32px 0 32px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 6px;">Subject</div>
              <div style="font-size: 15px; font-weight: 600; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                ${safeSubject}
              </div>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 20px 32px 28px 32px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 6px;">Message</div>
              <div style="font-size: 14px; line-height: 1.65; color: #334155; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 8px; padding: 18px 20px; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${safeMessage}</div>
            </td>
          </tr>

          <!-- Actions & Direct Reply -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left">
                    <a href="${mailtoUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 11px 22px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      Reply to ${safeName} &rarr;
                    </a>
                  </td>
                  <td align="right">
                    <a href="https://hungnguyen.dev" style="color: #64748b; font-size: 12px; text-decoration: none; font-weight: 500;">
                      View Portfolio &nearr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                This notification was sent from your portfolio contact form at <a href="https://hungnguyen.dev" style="color: #0284c7; text-decoration: none;">hungnguyen.dev</a> via Resend.<br>
                Reply directly to this email to respond to the sender.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
New Contact Form Submission - hungnguyen.dev
--------------------------------------------
From:    ${name} <${email}>
Subject: ${subject}

Message:
${message}

--------------------------------------------
Reply directly to this email to respond to ${name}.
`

  return { html, text }
}
