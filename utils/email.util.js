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

const sendEmail = (to, subject, html) => {  // Change 'text' to 'html'
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,  // Use 'html' field for HTML-formatted email
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

const sendEmail2 = (to, subject, html) => {  // Change 'text' to 'html'
  const mailOptions = {
    from: process.env.SMTP_USER2,
    to,
    subject,
    html,  // Use 'html' field for HTML-formatted email
  };

  return transporter2.sendMail(mailOptions);
};

const transporter3 = nodemailer.createTransport({
  host: process.env.SMTP_HOST3,
  port: process.env.SMTP_PORT3,
  secure: false,
  auth: {
    user: process.env.SMTP_USER3,
    pass: process.env.SMTP_PASS3,
  },
});

const sendEmail3 = (to, subject, html) => {  // Change 'text' to 'html'
  const mailOptions = {
    from: process.env.SMTP_USER3,
    to,
    subject,
    html,  // Use 'html' field for HTML-formatted email
  };

  return transporter3.sendMail(mailOptions);
};

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const OAuth2_client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);
OAuth2_client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const sendEmail4 = async (firstName, lastName, senderMail, message) => {
    try {
        const accessToken = await OAuth2_client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.PUBLIC_EMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: process.env.PUBLIC_EMAIL,
            to: process.env.PUBLIC_EMAIL,
            subject: `Message on Credenz Website from: ${senderMail}`,
            html: `
                <h2>First Name: ${firstName}</h2>
                <h2>Last Name: ${lastName}</h2>
                <p>${message}</p>
            `,
        };
        const result = await transporter.sendMail(mailOptions);
        return { success: true, result };
    } catch (error) {
        // console.error("Error sending email:", error);
        return { success: false, error };
    }
};

const sendConfirmationEmail = async (user, eventNames) => {
  try {
      const username = user.username;

      const emailHtml = `
          <html>
              <body>
                  <h1>Hello ${username},</h1>
                  <p>Congratulations! You have successfully registered for the following events:</p>
                  <ul>
                      ${eventNames.map((event) => `<li>${event}</li>`).join("")}
                  </ul>
                  <p>Thank you for your participation. We look forward to seeing you at the events!</p>
              </body>
          </html>
      `;

      const emailRandomNumber = Math.floor(Math.random() * 10);
      if (emailRandomNumber < 5) {
          await sendEmail(user.email, 'Event Registration Successful', emailHtml);
      } else {
          await sendEmail2(user.email, 'Event Registration Successful', emailHtml);
      }

      console.log(`Email sent successfully to ${user.email}`);
  } catch (error) {
      //console.error(`Failed to send email to ${user.email}:`, error);
      throw new Error(`Error sending email to ${user.username}`);
  }
};


module.exports = { sendEmail, sendEmail2, sendEmail3, sendEmail4, sendConfirmationEmail}