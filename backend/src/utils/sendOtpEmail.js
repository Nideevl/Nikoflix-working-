import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Your NikoFlix OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
}

export async function sendOtpEmailToAdmin(email, otp, purpose = "default") {
  let subject = "Your NikoFlix OTP";

  if (purpose === "signup") subject = "NikoFlix Admin Signup OTP";
  if (purpose === "reset") subject = "NikoFlix Admin Password Reset OTP";
  if (purpose === "dual_admin") subject = "NikoFlix Admin Approval OTP";

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject,
    text: `Your OTP is ${otp}. Valid for 5 minutes.`,
  });
}
