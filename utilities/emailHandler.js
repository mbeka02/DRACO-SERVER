import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

//https://console.cloud.google.com/
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESHTOKEN });
const sendEmail = async ({ to, subject, html }) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    //creating transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "antonymbeka@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESHTOKEN,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: "Draco <antonymbeka@gmail.com>",
      to,
      subject,
      html,
    };

    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

//for account activation
const sendActivationEmail = ({ name, email, activationToken, origin }) => {
  const message = `<p>Hello ${name} ,click the link to activate your account:<a href=${origin}/api/v1/auth/verifyAccount/${activationToken}>Activate account</a>
      </p>`;

  return sendEmail({
    to: email,
    subject: "Account activation",
    html: message,
  });
};

export { sendActivationEmail };
