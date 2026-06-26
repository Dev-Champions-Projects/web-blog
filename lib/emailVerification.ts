import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.emailVerificationToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateEmailVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.emailVerificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const emailVerificationToken = await db.emailVerificationToken.create({
    data: { email, token, expires },
  });

  return emailVerificationToken;
};

export const sendEmailVerificationToken = async (
  email: string,
  token: string
) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailVerificaitionLink = `${process.env.BASE_URL}/email-verification?token=${token}`;

  const res = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your Email 🎉",
    html: `<p>Click <a href="${emailVerificaitionLink}">here</a> to verify your email</p>`,
  });

  return { error: res.error };
};
