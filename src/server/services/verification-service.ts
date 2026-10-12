import { randomInt } from "crypto";
import { sendEmail, sendVerificationCode } from "@/lib/mailer";
import { generateForgetPasswordCodeEmail } from "@/const/email/forgot-password-code-email";
import { saveVerificationCode, verificationKey } from "@/lib/redis";

export const generateCode = () => randomInt(100000, 999999).toString();

export const sendRegisterCode = async (email: string) => {
  const code = generateCode();
  await saveVerificationCode(verificationKey("register", email), code);
  await sendVerificationCode({ to: email, code, type: "register" });
};

export const sendForgotPasswordCode = async (email: string, userId: string) => {
  const code = generateCode();
  await saveVerificationCode(verificationKey("change_password", userId), code);
  const { subject, html } = generateForgetPasswordCodeEmail(code);
  await sendEmail({ to: [email], subject, html });
};
