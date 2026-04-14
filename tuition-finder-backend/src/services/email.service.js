const nodemailer = require("nodemailer");

const { env } = require("../config/env");

function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

function renderEmailVerification({ name, otp }) {
  const subject = "Verify your Tuition Finder account";
  const text = `Namaste ${name || ""}!\n\nYour Tuition Finder verification OTP is: ${otp}\n\nThis code expires in 5 minutes.\n\n- Tuition Finder Nepal`;
  return { subject, text };
}

function renderPasswordReset({ otp }) {
  const subject = "Reset your Tuition Finder password";
  const text = `Your password reset OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\n- Tuition Finder Nepal`;
  return { subject, text };
}

async function sendMail({ to, subject, text }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: env.FROM_EMAIL,
    to,
    subject,
    text,
  });
}

async function sendVerificationEmail({ to, name, otp }) {
  const { subject, text } = renderEmailVerification({ name, otp });
  await sendMail({ to, subject, text });
}

async function sendPasswordResetEmail({ to, otp }) {
  const { subject, text } = renderPasswordReset({ otp });
  await sendMail({ to, subject, text });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
