import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

import { db } from "./db";
import { siteConfig } from "./seo";

const EMAIL_VERIFICATION_TOKEN_TTL_MS =
  60 * 60 * 1000;

const DEFAULT_VERIFICATION_FROM =
  "Tech Path Security <security@notify.dev-champions.tech>";

const DEFAULT_REPLY_TO =
  "support@dev-champions.tech";

export const getVerificationTokenByEmail = async (
  email: string,
) => {
  try {
    const verificationToken =
      await db.emailVerificationToken.findFirst({
        where: {
          email,
        },
      });

    return verificationToken;
  } catch (error) {
    console.error(
      "Unable to retrieve email verification token:",
      error,
    );

    return null;
  }
};

export const generateEmailVerificationToken = async (
  email: string,
) => {
  const token = uuidv4();

  const expires = new Date(
    Date.now() +
    EMAIL_VERIFICATION_TOKEN_TTL_MS,
  );

  const existingToken =
    await getVerificationTokenByEmail(email);

  /*
   * Only one verification token should remain
   * valid for a user at a time.
   */
  if (existingToken) {
    await db.emailVerificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const emailVerificationToken =
    await db.emailVerificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

  return emailVerificationToken;
};

export const sendEmailVerificationToken = async (
  email: string,
  token: string,
) => {
  /*
   * Use the same dedicated transactional Resend
   * configuration that is already working for
   * password-reset emails.
   *
   * RESEND_API_KEY remains only as a temporary
   * fallback for older/local environments.
   */
  const apiKey =
    process.env.RESEND_AUTH_API_KEY?.trim() ||
    process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return {
      error: new Error(
        "Resend API key is not configured.",
      ),
      id: null,
    };
  }

  const from =
    process.env.RESEND_AUTH_FROM?.trim() ||
    DEFAULT_VERIFICATION_FROM;

  const replyTo =
    process.env.RESEND_REPLY_TO?.trim() ||
    DEFAULT_REPLY_TO;

  const baseUrl = (
    process.env.BASE_URL ||
    siteConfig.url
  )
    .trim()
    .replace(/\/+$/, "");

  const verificationUrl = new URL(
    "/email-verification",
    `${baseUrl}/`,
  );

  verificationUrl.searchParams.set(
    "token",
    token,
  );

  const verificationLink =
    verificationUrl.toString();

  /*
   * Keep verification emails strongly
   * transactional:
   *
   * - no social links
   * - no marketing content
   * - no tracking links
   * - no remote images
   * - one clear verification action
   */
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Verify your Tech Path email</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f5f7fa;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #f5f7fa;
            padding: 32px 16px;
          "
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 560px;
                  background-color: #ffffff;
                  border: 1px solid #e6eaf0;
                  border-radius: 16px;
                  overflow: hidden;
                "
              >

                <tr>
                  <td
                    style="
                      padding: 26px 32px;
                      background-color: #5a1c4b;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 20px;
                        line-height: 1.4;
                        font-weight: 700;
                      "
                    >
                      Tech Path
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 32px;
                    "
                  >
                    <h1
                      style="
                        margin: 0 0 18px;
                        color: #111827;
                        font-size: 24px;
                        line-height: 1.35;
                      "
                    >
                      Verify your email address
                    </h1>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: #374151;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Thanks for creating a Tech Path
                      account.
                    </p>

                    <p
                      style="
                        margin: 0 0 26px;
                        color: #374151;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      Confirm your email address to
                      finish setting up your account.
                    </p>

                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="
                        margin: 0 0 28px;
                      "
                    >
                      <tr>
                        <td
                          align="center"
                          style="
                            background-color: #409fb6;
                            border-radius: 8px;
                          "
                        >
                          <a
                            href="${verificationLink}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                              display: inline-block;
                              padding: 13px 22px;
                              color: #ffffff;
                              font-size: 15px;
                              line-height: 1.2;
                              font-weight: 700;
                              text-decoration: none;
                            "
                          >
                            Verify email address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin: 0 0 8px;
                        color: #6b7280;
                        font-size: 13px;
                        line-height: 1.6;
                      "
                    >
                      If the button does not work,
                      copy and paste this link into
                      your browser:
                    </p>

                    <p
                      style="
                        margin: 0 0 24px;
                        font-size: 13px;
                        line-height: 1.6;
                        word-break: break-all;
                      "
                    >
                      <a
                        href="${verificationLink}"
                        style="
                          color: #077998;
                          text-decoration: underline;
                        "
                      >
                        ${verificationLink}
                      </a>
                    </p>

                    <p
                      style="
                        margin: 0 0 14px;
                        color: #6b7280;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      This verification link expires
                      in 1 hour.
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #6b7280;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      If you did not create a Tech Path
                      account, you can safely ignore
                      this email.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 20px 32px;
                      border-top: 1px solid #e5e7eb;
                      background-color: #fafafa;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #6b7280;
                        font-size: 12px;
                        line-height: 1.6;
                      "
                    >
                      Need help? Reply to this email
                      or contact
                      <a
                        href="mailto:${replyTo}"
                        style="
                          color: #077998;
                          text-decoration: none;
                        "
                      >
                        ${replyTo}
                      </a>.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
Verify your Tech Path email address

Thanks for creating a Tech Path account.

Confirm your email address to finish setting up your account:

${verificationLink}

This verification link expires in 1 hour.

If you did not create a Tech Path account, you can safely ignore this email.

Need help?
${replyTo}
  `.trim();

  try {
    const { data, error } =
      await new Resend(
        apiKey,
      ).emails.send({
        from,
        to: email,
        replyTo,
        subject:
          "Verify your Tech Path email",
        html,
        text,
      });

    if (error) {
      console.error(
        "Resend verification email failed:",
        error,
      );
    }

    return {
      error,
      id: data?.id ?? null,
    };
  } catch (error) {
    console.error(
      "Verification email request failed:",
      error,
    );

    return {
      error:
        error instanceof Error
          ? error
          : new Error(
            "Unable to send verification email.",
          ),
      id: null,
    };
  }
};