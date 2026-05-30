import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendOTPEmailParams {
  to: string;
  otp: string;
  userName?: string;
}

export async function sendOTPEmail({ to, otp, userName }: SendOTPEmailParams) {
  const displayName = userName || "User";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email — Learn With</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #f5f5f7;
      color: #1a1a2e;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5, #7c3aed, #9333ea);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 14px;
      margin-top: 8px;
    }
    .body {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 16px;
    }
    .greeting strong {
      color: #4f46e5;
    }
    .message {
      font-size: 14px;
      color: #555;
      margin-bottom: 24px;
    }
    .otp-container {
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .otp-code {
      display: inline-block;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #4f46e5;
      background: linear-gradient(135deg, #eef2ff, #f5f3ff);
      padding: 16px 32px;
      border-radius: 12px;
      border: 2px dashed #c7d2fe;
    }
    .expiry {
      font-size: 13px;
      color: #888;
      margin-top: 16px;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 24px 0;
    }
    .footer {
      padding: 0 24px 32px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
    .brand {
      font-size: 13px;
      color: #aaa;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Learn With</h1>
      <p>Find Open Projects to Contribute</p>
    </div>
    <div class="body">
      <p class="greeting">Hello <strong>${displayName}</strong>,</p>
      <p class="message">
        Thank you for signing up on <strong>Learn With</strong>! To complete your registration
        and start exploring open-source projects, please verify your email address using the
        OTP below.
      </p>
      <div class="otp-container">
        <p class="otp-label">Your verification code</p>
        <div class="otp-code">${otp}</div>
        <p class="expiry">This code expires in 10 minutes</p>
      </div>
      <div class="divider"></div>
      <p class="message">
        If you didn't create an account on Learn With, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>Learn With — learnwith.parthpipaliya.com</p>
      <p class="brand">By Parth Pipaliya</p>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Learn With" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify Your Email — Learn With",
    html,
  });
}
