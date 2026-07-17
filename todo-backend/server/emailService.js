import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  family: 4, // force IPv4
});

export const sendNotificationEmail = async (to, subject, text) => {
  try {
    const from = process.env.SMTP_FROM || '"SmartSplit Admin" <noreply@smartsplit.app>';

    if (!process.env.SMTP_USER) {
      console.warn("SMTP credentials missing. Email would be sent to:", to);
      console.warn("Subject:", subject);
      console.warn("Text:", text);
      return false; // Email skipped because no creds
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};