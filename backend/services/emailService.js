const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      'Email delivery is not configured. Set SMTP_USER and SMTP_PASS in backend/.env.',
    );
  }

  const transportConfig = process.env.SMTP_SERVICE
    ? {
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
};

const sendOtpEmail = async ({ to, name, otpCode }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const previewName = name || 'there';

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Your AI Resume Analyzer verification code',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f7f6; padding: 32px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 32px; border: 1px solid #d7e4df;">
          <p style="margin: 0; color: #0f766e; font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">
            AI Resume Analyzer
          </p>
          <h1 style="margin: 18px 0 12px; color: #10261f; font-size: 28px;">
            Verify your sign-in
          </h1>
          <p style="margin: 0 0 18px; color: #4b645c; font-size: 16px; line-height: 1.7;">
            Hi ${previewName}, use the verification code below to continue signing in.
          </p>
          <div style="margin: 22px 0; padding: 18px 20px; border-radius: 16px; background: #0f766e; color: #ffffff; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 0.35em;">
            ${otpCode}
          </div>
          <p style="margin: 0; color: #4b645c; font-size: 14px; line-height: 1.7;">
            This code expires in 10 minutes. If you did not request this, you can ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `Hi ${previewName}, your AI Resume Analyzer verification code is ${otpCode}. It expires in 10 minutes.`,
  });
};

module.exports = {
  sendOtpEmail,
};
