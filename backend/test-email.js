require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: '"Cleanzy Mart" <noreply@cleanzymart.com>',
  to: 'Shavistreaming@gmail.com', // ඔයාගේ email එක දාන්න
  subject: 'Test Email from Cleanzy Mart',
  text: 'If you receive this, email configuration is working!',
  html: '<h1>Email Working! 🚀</h1><p>Your email configuration is correct.</p>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Email sent:', info.response);
  }
});