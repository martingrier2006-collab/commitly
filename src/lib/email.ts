import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Update FROM to a verified domain before going to production.
// For local dev, Resend allows sending from onboarding@resend.dev.
const FROM = 'Commitly <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://commitly.app'

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0f1e;color:#f8fafc;font-family:system-ui,sans-serif;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto">
    <p style="font-size:22px;font-weight:700;color:#3b82f6;margin:0 0 32px">Commitly</p>
    ${body}
    <p style="font-size:12px;color:#64748b;margin-top:48px">
      You're receiving this because you have an active goal on Commitly.
      <a href="${APP_URL}/settings" style="color:#3b82f6">Manage notifications</a>
    </p>
  </div>
</body></html>`
}

export async function sendStreakRiskEmail(
  to: string,
  goalTitles: string[],
  streak: number,
) {
  const goalList = goalTitles
    .slice(0, 3)
    .map(t => `<li style="margin:4px 0">${t}</li>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 Your ${streak}-day streak ends tonight`,
    html: wrap(`
      <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">Don't break the chain.</h1>
      <p style="color:#94a3b8;margin:0 0 24px">You haven't checked in today. Your ${streak}-day streak resets at midnight.</p>
      <p style="font-weight:600;margin:0 0 8px">Goals at risk:</p>
      <ul style="color:#94a3b8;padding-left:20px;margin:0 0 32px">${goalList}</ul>
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">Check in now →</a>
    `),
  })
}

export async function sendReEngagementEmail(
  to: string,
  day: 2 | 4 | 7,
) {
  const content = {
    2: {
      subject: 'You made a commitment 48 hours ago',
      headline: 'Your goal is still waiting.',
      body: "You set a goal 2 days ago. Most people never check in after day one. Prove you're different.",
    },
    4: {
      subject: 'Still waiting',
      headline: 'Four days. Zero check-ins.',
      body: "You set a goal this week and haven't tracked a single day. The longer you wait, the harder it gets.",
    },
    7: {
      subject: 'Day 7. Most people stop here.',
      headline: 'This is where 80% quit.',
      body: 'One week since you signed up. The people who push through day 7 are the ones worth watching. Are you one of them?',
    },
  }

  const { subject, headline, body } = content[day]

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: wrap(`
      <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">${headline}</h1>
      <p style="color:#94a3b8;margin:0 0 32px">${body}</p>
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">Open Commitly →</a>
    `),
  })
}

export async function sendMilestoneEmail(
  to: string,
  goalTitle: string,
  streak: number,
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 ${streak}-day streak on "${goalTitle}"`,
    html: wrap(`
      <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">${streak} days straight.</h1>
      <p style="color:#94a3b8;margin:0 0 8px">Goal: <strong style="color:#f8fafc">${goalTitle}</strong></p>
      <p style="color:#94a3b8;margin:0 0 32px">You've checked in ${streak} days in a row. That's not normal. Keep going.</p>
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">View your progress →</a>
    `),
  })
}
