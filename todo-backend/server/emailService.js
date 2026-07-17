import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendNotificationEmail = async (to, subject, text) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Resend API key missing. Email would be sent to:", to);
      console.warn("Subject:", subject);
      console.warn("Text:", text);
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: "SmartSplit Admin <onboarding@resend.dev>",
      to,
      subject,
      text,
    });

    if (error) {
      console.error("Error sending email:", error);
      return false;
    }

    console.log("Message sent:", data?.id);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};