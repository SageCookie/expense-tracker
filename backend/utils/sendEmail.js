import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const getSmtpTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const getEmailProvider = () => {
  if (process.env.RESEND_API_KEY?.trim()) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  return null;
};

export const isEmailConfigured = () => getEmailProvider() !== null;

export const verifyEmailSetup = async () => {
  const provider = getEmailProvider();

  if (!provider) {
    console.warn('\n⚠️  EMAIL NOT CONFIGURED — verification codes will not reach users.');
    console.warn('   Add one of these to backend/.env and restart the server:\n');
    console.warn('   • RESEND_API_KEY=re_xxxx  (get one at https://resend.com/api-keys)');
    console.warn('   • OR Gmail SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS (use an App Password)\n');
    return false;
  }

  try {
    if (provider === 'smtp') {
      await getSmtpTransporter().verify();
      console.log(`✓ Email delivery ready (SMTP → ${process.env.SMTP_USER})`);
    } else {
      console.log('✓ Email delivery ready (Resend)');
    }
    return true;
  } catch (error) {
    console.error('\n✗ Email configuration failed:', error.message);
    console.error('  Check SMTP_USER / SMTP_PASS (Gmail needs an App Password, not your login password).\n');
    return false;
  }
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const resend = new Resend(process.env.RESEND_API_KEY.trim());
  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    'Hisaab <onboarding@resend.dev>';

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const sendViaSmtp = async ({ to, subject, html, text }) => {
  const from =
    process.env.SMTP_FROM?.trim() ||
    `"Hisaab" <${process.env.SMTP_USER}>`;

  await getSmtpTransporter().sendMail({ from, to, subject, html, text });
};

export const sendVerificationEmail = async ({ to, subject, html, text }) => {
  const provider = getEmailProvider();

  if (!provider) {
    throw new Error(
      'Email is not configured on the server. Add RESEND_API_KEY or SMTP settings to backend/.env and restart.'
    );
  }

  try {
    if (provider === 'resend') {
      await sendViaResend({ to, subject, html, text });
    } else {
      await sendViaSmtp({ to, subject, html, text });
    }

    console.log(`📧 Verification email sent to ${to} via ${provider}`);
    return { sent: true, provider };
  } catch (error) {
    console.error(`📧 Failed to send email to ${to}:`, error.message);
    throw new Error(
      `Could not send verification email. ${error.message}`
    );
  }
};
