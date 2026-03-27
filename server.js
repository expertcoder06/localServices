import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
