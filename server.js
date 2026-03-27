import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
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
  process.env.VITE_SUPABASE_URL || 'https://qmesmzkiybnqijuansvb.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZXNtemtpeWJucWlqdWFuc3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjAwMjEsImV4cCI6MjA5MDA5NjAyMX0.7-nMwn6JeMQH0tFwpBqtjhy_1q7RjxIp92YY-bezX04'
);

// ── OTP Email ──────────────────────────────────────────────────────────────
app.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code - Local Services',
    text: `Your OTP for registration is: ${otp}. This code will expire soon.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">Verification Code</h2>
        <p>Thank you for signing up for Local Services. Please use the following OTP to verify your email address:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f3f4f6; display: inline-block; border-radius: 5px;">
          ${otp}
        </div>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// ── Bid Accepted Notification ──────────────────────────────────────────────
app.post('/send-bid-accepted', async (req, res) => {
  const { providerEmail, providerName, jobTitle, customerName, amount } = req.body;

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
            <a href="http://localhost:5173/provider-dashboard"
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Start Bid Reminder Alert (called when first bid arrives) ───────────────
app.post('/start-bid-alert', async (req, res) => {
  const { jobId, consumerEmail, consumerName, jobTitle } = req.body;

  try {
    // Check if an alert already exists for this job
    // Check if an alert is already active for this job
    const { data: existing } = await supabase
      .from('bid_email_alerts')
      .select('id')
      .eq('job_id', jobId)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      console.log(`❕ Alert already active for job ${jobId}`);
      return res.status(200).json({ success: true, message: 'Alert already active for this job' });
    }

    // Safely look up job and consumer info
    let recipientEmail = consumerEmail;
    let recipientName = consumerName;
    let cId = null;

    const { data: jobData, error: jError } = await supabase.from('jobs').select('consumer_id').eq('id', jobId).single();
    if (jError || !jobData) {
      console.error(`❌ Job not found for ID: ${jobId}`);
      return res.status(404).json({ success: false, message: 'Job record not found' });
    }
    cId = jobData.consumer_id;

    if (!recipientEmail) {
      const { data: consumer } = await supabase.from('consumers').select('email, name').eq('id', cId).single();
      if (consumer) {
        recipientEmail = consumer.email;
        recipientName = consumer.name;
      }
    }

    if (!recipientEmail) {
      console.error(`❌ Could not identify recipient email for job ${jobId}`);
      return res.status(400).json({ success: false, message: 'Consumer email not found' });
    }

    // Insert or activate alert record
    const { error: insertError } = await supabase.from('bid_email_alerts').upsert([{
      job_id: jobId,
      consumer_id: cId,
      consumer_email: recipientEmail,
      consumer_name: recipientName || 'Customer',
      job_title: jobTitle || 'Your Request',
      is_active: true,
      last_sent_at: new Date().toISOString(),
    }], { onConflict: 'job_id' });

    if (insertError) throw insertError;

    // Send the FIRST notification immediately to confirm things are working
    // Pass 'isFirst' to customize the subject line for the very first notification
    console.log(`📧 Sending initial bid alert to ${recipientEmail} for "${jobTitle}"...`);
    await sendBidReminderEmail(recipientEmail, recipientName || 'Customer', jobTitle || 'Your Request', jobId, true);

    res.status(200).json({ success: true, message: 'Bid alert initiated and first email sent' });
  } catch (error) {
    console.error('Start bid alert error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Stop Bid Reminder Alert (called when user accepts a bid) ───────────────
app.post('/stop-bid-alert', async (req, res) => {
  const { jobId } = req.body;

  try {
    const { error } = await supabase
      .from('bid_email_alerts')
      .update({ is_active: false })
      .eq('job_id', jobId);

    if (error) throw error;

    console.log(`🛑 Bid alert stopped for job ${jobId}`);
    res.status(200).json({ success: true, message: 'Bid alert stopped' });
  } catch (error) {
    console.error('Stop bid alert error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Bid Reminder Email Template ────────────────────────────────────────────
async function sendBidReminderEmail(email, name, jobTitle, jobId, isFirst = false) {
  // Count current bids for this job
  const { count } = await supabase
    .from('bids')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .eq('status', 'pending');

  const bidCount = count || 0;
  const subject = 
    isFirst ? `✨ Someone just placed a bid on your request! | Local Services` :
    bidCount > 0 ? `⏰ You have ${bidCount} pending bid${bidCount !== 1 ? 's' : ''} – Review now! | Local Services` :
    `⏰ Quick Reminder: Your request "${jobTitle}" is waiting | Local Services`;

  const mailOptions = {
    from: `"Local Services" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dd6b20 0%, #e53e3e 100%); padding: 36px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px;">Bids Are Waiting For You!</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">Don't keep your professionals waiting</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #1a202c; margin: 0 0 14px;">Hi <strong>${name}</strong> 👋</p>
          <p style="font-size: 15px; color: #4a5568; line-height: 1.7; margin: 0 0 24px;">
            Your service request "<strong>${jobTitle}</strong>" has received
            <strong style="color: #dd6b20; font-size: 18px;">${bidCount}</strong> bid${bidCount !== 1 ? 's' : ''} 
            from verified professionals. Review and accept a bid to get started!
          </p>

          <!-- Urgency Card -->
          <div style="background: rgba(221,107,32,0.06); border: 1.5px solid rgba(221,107,32,0.2); border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 36px; font-weight: 800; color: #dd6b20; margin-bottom: 4px;">${bidCount}</div>
            <div style="font-size: 13px; font-weight: 700; color: #c05621; text-transform: uppercase; letter-spacing: 0.06em;">Pending Bid${bidCount !== 1 ? 's' : ''}</div>
            <p style="font-size: 12px; color: #a0aec0; margin: 8px 0 0;">Professionals are waiting for your response</p>
          </div>

          <!-- Tips -->
          <div style="background: #fff; border-radius: 8px; padding: 16px 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px;">💡 Quick Tips</p>
            <ul style="font-size: 13px; color: #4a5568; line-height: 1.8; padding-left: 16px; margin: 0;">
              <li>Compare bids by price, experience, and ratings</li>
              <li>Accepting early gets you faster service</li>
              <li>Your payment is secured in escrow until completion</li>
            </ul>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:5173/customer-dashboard"
               style="display: inline-block; background: linear-gradient(135deg, #dd6b20, #e53e3e); color: #ffffff; padding: 15px 44px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none;">
              Review Bids Now →
            </a>
          </div>

          <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0; line-height: 1.6;">
            We'll stop sending reminders once you accept a bid.<br/>
            <strong style="color: #64748b;">The Local Services Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 14px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">
            © ${new Date().getFullYear()} Local Services · Automated bid reminder
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Update last_sent_at
    await supabase
      .from('bid_email_alerts')
      .update({ last_sent_at: new Date().toISOString() })
      .eq('job_id', jobId)
      .eq('is_active', true);
    console.log(`  ✉️  Reminder sent to ${email} for "${jobTitle}"`);
  } catch (error) {
    console.error(`  ❌ Failed to send reminder to ${email}:`, error.message);
  }
}

// ── Background Scheduler: Send reminders every 30 minutes ──────────────────
const REMINDER_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

setInterval(async () => {
  try {
    const thirtyMinAgo = new Date(Date.now() - REMINDER_INTERVAL_MS).toISOString();

    // Get all active alerts whose last email was sent >= 30 min ago
    const { data: alerts, error } = await supabase
      .from('bid_email_alerts')
      .select('*')
      .eq('is_active', true)
      .lte('last_sent_at', thirtyMinAgo);

    if (error) {
      console.error('Scheduler query error:', error);
      return;
    }

    if (!alerts || alerts.length === 0) return;

    console.log(`\n🔔 [${new Date().toLocaleTimeString()}] Processing ${alerts.length} bid reminder(s)...`);

    for (const alert of alerts) {
      // Double-check the job is still pending (not accepted)
      const { data: job } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', alert.job_id)
        .single();

      if (!job || job.status !== 'pending') {
        // Job is no longer pending, deactivate the alert
        await supabase
          .from('bid_email_alerts')
          .update({ is_active: false })
          .eq('id', alert.id);
        console.log(`  ⏹️  Auto-deactivated alert for job ${alert.job_id} (status: ${job?.status})`);
        continue;
      }

      await sendBidReminderEmail(
        alert.consumer_email,
        alert.consumer_name,
        alert.job_title,
        alert.job_id
      );
    }
  } catch (err) {
    console.error('Scheduler error:', err);
  }
}, REMINDER_INTERVAL_MS);

console.log('⏰ Bid reminder scheduler active (every 30 minutes)');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Local Services email server running on port ${PORT}`);
});
