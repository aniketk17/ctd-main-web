const nodemailer = require('nodemailer');


// For first Mail ID (credenz.updates@gmail.com)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};


// For second Mail ID (credenztechdays@gmail.com)
const transporter2 = nodemailer.createTransport({
  host: process.env.SMTP_HOST2,
  port: process.env.SMTP_PORT2,
  secure: false,
  auth: {
    user: process.env.SMTP_USER2,
    pass: process.env.SMTP_PASS2,
  },
});

const sendEmail2 = (to, subject, text) => {
  const mailOptions = {
    from: process.env.SMTP_USER2,
    to,
    subject,
    text,
  };

  return transporter2.sendMail(mailOptions);
};

module.exports = { sendEmail, sendEmail2 };