import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, boardName, boardId, inviterName, appUrl } = req.body

    if (!email || !boardName || !boardId || !inviterName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Construct the invitation URL
    const inviteUrl = `${appUrl || 'https://hemingway.vercel.app'}`

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Hemingway <invites@yourdomain.com>', // Update with your verified domain
      to: [email],
      subject: `${inviterName} invited you to "${boardName}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 32px;
                margin: 20px 0;
              }
              h1 {
                font-family: 'Georgia', serif;
                font-size: 24px;
                margin: 0 0 16px 0;
                color: #1a1a1a;
              }
              .board-name {
                color: #8b6f47;
                font-weight: 600;
              }
              .button {
                display: inline-block;
                background: #8b6f47;
                color: white;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 6px;
                margin: 24px 0;
                font-weight: 500;
              }
              .footer {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e0e0e0;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>You've been invited to collaborate</h1>
              <p>
                <strong>${inviterName}</strong> invited you to join the board
                <span class="board-name">"${boardName}"</span> on Hemingway.
              </p>
              <p>
                Hemingway is a collaborative writing organizer that helps you move ideas
                from conception to publication.
              </p>
              <a href="${inviteUrl}" class="button">
                Open Hemingway
              </a>
              <p style="font-size: 14px; color: #666;">
                Once you sign in, you'll see the invitation and can accept or decline.
              </p>
            </div>
            <div class="footer">
              <p>
                This invitation was sent to ${email}. If you weren't expecting this,
                you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, messageId: data.id })
  } catch (error) {
    console.error('Send invite error:', error)
    return res.status(500).json({ error: error.message })
  }
}
