import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ['https://local-services-q53h.vercel.app', 'https://local-services-q53h.vercel.app/'], // Add your production domains
  credentials: true
}));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Supabase client for server-side queries
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'Local Services Email Server', version: '1.2.0' });
});

// ── OTP Email ──────────────────────────────────────────────────────────────
app.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const mailOptions = {
    from: `"Local Services" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔐 Your Verification Code: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #4f46e5; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verify Your Email</h1>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
          <p style="color: #4a5568; font-size: 16px; margin: 0 0 25px;">Thank you for joining Local Services. Use the code below to complete your registration:</p>
          <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; display: inline-block;">
             <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1a202c;">${otp}</span>
          </div>
          <p style="color: #718096; font-size: 13px; margin: 25px 0 0;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Local Services Team</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// ── Bid Alert / Start Notification ────────────────────────────────────────
app.post('/start-bid-alert', async (req, res) => {
  const { jobId, jobTitle, consumerEmail, consumerName } = req.body;

  // This endpoint can be used to send a 'Bids are coming in' notification
  // or simply log that a job has started receiving bids.
  
  if (!consumerEmail) {
    return res.status(200).json({ success: true, message: 'Bid alert logged (no email provided)' });
  }

  const mailOptions = {
    from: `"Local Services" <${process.env.EMAIL_USER}>`,
    to: consumerEmail,
    subject: `🚀 Bids are arriving for "${jobTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0;">Exciting News, ${consumerName}!</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
            Your job post <strong>"${jobTitle}"</strong> is getting attention! Professionals are reviewing your requirements and placing bids right now.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px; text-align: center;">
              <strong>Pro Tip:</strong> Check back every few hours. The best providers often bid early!
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://local-services-q53h.vercel.app/customer-dashboard" style="background: #4f46e5; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Your Dashboard</a>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
          Local Services · Empowering your community
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Bid start alert sent' });
  } catch (error) {
    console.error('Bid alert error:', error);
    res.status(500).json({ success: false, message: 'Failed to send bid alert' });
  }
});

// ── Bid Accepted Notification ──────────────────────────────────────────────
app.post('/send-bid-accepted', async (req, res) => {
  const { providerEmail, providerName, jobTitle, customerName, amount } = req.body;

  if (!providerEmail || !providerName || !jobTitle || !customerName || !amount) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const mailOptions = {
    from: `"Local Services" <${process.env.EMAIL_USER}>`,
    to: providerEmail,
    subject: '🎉 Congratulations! Your Bid Has Been Accepted – Local Services',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #002045 0%, #003a75 100%); padding: 40px 32px; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 12px;">🎉</div>
          <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 8px;">Your Bid Was Accepted!</h1>
          <p style="color: rgba(255,255,255,0.75); font-size: 14px; margin: 0;">You have a new confirmed job on Local Services</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
          <p style="font-size: 16px; color: #1a202c; margin: 0 0 16px;">Hi <strong>${providerName}</strong> 👋</p>
          <p style="font-size: 15px; color: #4a5568; line-height: 1.7; margin: 0 0 28px;">
            Great news! <strong>${customerName}</strong> has reviewed your proposal and selected <strong>you</strong> for the job.
            Your commitment and professionalism stood out — well done!
          </p>

          <!-- Job Details Card -->
          <div style="background: #ffffff; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
            <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin: 0 0 16px; font-weight: 700;">Job Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; width: 38%;">Service</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #0f172a; font-size: 14px;">${jobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Customer</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a; font-size: 14px;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 11px 0; color: #64748b; font-size: 14px;">Your Earnings</td>
                <td style="padding: 11px 0; font-weight: 800; color: #16a34a; font-size: 22px;">₹${amount}</td>
              </tr>
            </table>
          </div>

          <!-- Escrow Notice -->
          <div style="background: rgba(22,163,74,0.07); border: 1px solid rgba(22,163,74,0.25); border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; display: flex; align-items: flex-start; gap: 12px;">
            <div style="font-size: 20px; margin-top: 2px;">🔒</div>
            <div>
              <p style="font-size: 13px; font-weight: 700; color: #15803d; margin: 0 0 4px;">Payment in Escrow</p>
              <p style="font-size: 13px; color: #166534; margin: 0; line-height: 1.5;">₹${amount} has been securely reserved by the customer and will be released to you automatically upon job completion.</p>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="https://local-services-q53h.vercel.app/provider-dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #002045, #0050a0); color: #ffffff; padding: 15px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; letter-spacing: 0.02em;">
              Open Your Dashboard →
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.7; margin: 0;">
            Good luck on the job! We're rooting for you.<br/>
            <strong style="color: #64748b;">The Local Services Team</strong> 🌟
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} Local Services · You're receiving this because you're a registered service provider.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Bid acceptance email sent successfully' });
  } catch (error) {
    console.error('Bid acceptance email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send bid acceptance email' });
  }
});

// ── Bid Placed Notification (to Customer) ──────────────────────────────────
app.post('/send-bid-placed', async (req, res) => {
  const { customerEmail, customerName, providerName, jobTitle, bidAmount } = req.body;

  if (!customerEmail || !customerName || !providerName || !jobTitle || !bidAmount) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const mailOptions = {
    from: `"Local Services" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `💼 New Bid Received for "${jobTitle}" – Local Services`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%); padding: 40px 32px; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 12px;">💼</div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px;">You Have a New Bid!</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">A professional is ready to help you right now</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
          <p style="font-size: 16px; color: #1a202c; margin: 0 0 16px;">Hi <strong>${customerName}</strong> 👋</p>
          <p style="font-size: 15px; color: #4a5568; line-height: 1.7; margin: 0 0 28px;">
            A verified service professional, <strong>${providerName}</strong>, has just placed a bid on your job request.
            Log in to review their proposal and decide if you'd like to hire them!
          </p>

          <!-- Job Details Card -->
          <div style="background: #ffffff; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
            <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin: 0 0 16px; font-weight: 700;">Bid Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; width: 38%;">Your Job</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #0f172a; font-size: 14px;">${jobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px;">Provider</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a; font-size: 14px;">${providerName}</td>
              </tr>
              <tr>
                <td style="padding: 11px 0; color: #64748b; font-size: 14px;">Bid Amount</td>
                <td style="padding: 11px 0; font-weight: 800; color: #dd6b20; font-size: 22px;">₹${bidAmount}</td>
              </tr>
            </table>
          </div>

          <!-- Info Banner -->
          <div style="background: rgba(221,107,32,0.07); border: 1px solid rgba(221,107,32,0.25); border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
            <p style="font-size: 13px; font-weight: 700; color: #c05621; margin: 0 0 4px;">⏱️ Act quickly!</p>
            <p style="font-size: 13px; color: #7b341e; margin: 0; line-height: 1.5;">
              Providers are in high demand. Review this bid and accept to secure your slot before they're booked by someone else.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="https://local-services-q53h.vercel.app/customer-dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #dd6b20, #c05621); color: #ffffff; padding: 15px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; letter-spacing: 0.02em;">
              Review the Bid →
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.7; margin: 0;">
            Thank you for using Local Services!<br/>
            <strong style="color: #64748b;">The Local Services Team</strong> 🌟
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} Local Services · You're receiving this because you posted a job request on our platform.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Bid placement notification sent to customer' });
  } catch (error) {
    console.error('Bid placed email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send bid placed notification' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Local Services email server running on port ${PORT}`);
});
