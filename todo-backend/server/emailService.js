import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendNotificationEmail = async (to, subject, text) => {
  try {
    const from = process.env.SMTP_FROM || '"SmartSplit Admin" <noreply@smartsplit.app>';

    if (!process.env.SMTP_USER) {
      console.warn("SMTP credentials missing. Email would be sent to:", to);
      console.warn("Subject:", subject);
      console.warn("Text:", text);
      return false;
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