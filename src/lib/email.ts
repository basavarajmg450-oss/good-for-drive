import { Resend } from "resend";

const resend = (import.meta.env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY) ? new Resend(import.meta.env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log("Email mock (No API key):", { to, subject });
    return;
  }

  try {
    await resend.emails.send({
      from: "Birdie <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendWinnerAlert(email: string, amount: number) {
  await sendEmail({
    to: email,
    subject: "You're a winner! 🏆",
    html: `<h1>Congratulations!</h1><p>You've won £${(amount / 100).toFixed(2)} in this month's Birdie draw. Log in to your dashboard to verify your scorecard and claim your prize.</p>`,
  });
}

export async function sendDrawResultsNotification(email: string) {
  await sendEmail({
    to: email,
    subject: "This month's draw results are in!",
    html: `<h1>Draw Results</h1><p>The latest draw has been published. Head over to the dashboard to see the winning numbers and if you're a winner.</p>`,
  });
}
