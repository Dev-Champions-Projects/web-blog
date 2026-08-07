import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";
import { siteConfig } from "./seo";

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
  const baseUrl = process.env.BASE_URL || siteConfig.url;
  const verificationLink = `${baseUrl}/email-verification?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6fb;color:#1f2937;">
        <div style="font-family:Inter, Arial, sans-serif;background-color:#f4f6fb;padding:24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:600px;border-collapse:collapse;">
            <tr>
              <td style="padding:0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 24px 50px rgba(15,23,42,0.08);">
                  <tr>
                    <td style="background:#1e293b;padding:32px 28px;text-align:center;">
                      <h1 style="margin:0;font-size:28px;line-height:1.1;color:#ffffff;font-weight:800;">Verify your email</h1>
                      <p style="margin:16px auto 0;max-width:460px;font-size:16px;line-height:1.7;color:#cbd5e1;">Confirm your email to complete setup and unlock developer resources from ${siteConfig.name}.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 28px;color:#1f2937;">
                      <p style="margin:0 0 20px;font-size:16px;line-height:1.7;">Hi there,</p>
                      <p style="margin:0 0 28px;font-size:16px;line-height:1.7;">Thanks for signing up. Click the button below to verify your email address and activate your ${siteConfig.name} account.</p>
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;border-collapse:collapse;">
                        <tr>
                          <td style="border-radius:999px;background:#2563eb;text-align:center;">
                            <a href="${verificationLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">Verify Email Address</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:28px 0 10px;font-size:14px;line-height:1.7;color:#475569;">If the button does not work, copy and paste this link into your browser:</p>
                      <p style="margin:0 0 22px;font-size:14px;line-height:1.7;word-break:break-all;color:#2563eb;">${verificationLink}</p>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">This link expires in 1 hour for your security.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f8fafc;padding:24px 28px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                      <p style="margin:0 0 10px;">Need help? Visit <a href="${siteConfig.url}" style="color:#2563eb;text-decoration:none;">${siteConfig.name}</a></p>
                      <p style="margin:0;font-size:13px;color:#94a3b8;">Follow us on <a href="https://facebook.com/DevChampions" style="color:#2563eb;text-decoration:none;">Facebook</a>, <a href="https://x.com/DevChampions" style="color:#2563eb;text-decoration:none;">X</a>, <a href="https://instagram.com/DevChampions" style="color:#2563eb;text-decoration:none;">Instagram</a>, and <a href="https://www.linkedin.com/company/dev-champions" style="color:#2563eb;text-decoration:none;">LinkedIn</a>.</p>
                      <p style="margin:14px 0 0;color:#94a3b8;">${siteConfig.name} Team · ${siteConfig.url}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

  const res = await resend.emails.send({
    from: "\"Dev Champions Team\" <no-reply@dev-champions.tech>",
    to: email,
    subject: "Verify your email address",
    html,
  });

  return { error: res.error };
};
