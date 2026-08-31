import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

import { db } from "./db";
import { siteConfig } from "./seo";

const PASSWORD_RESET_TOKEN_TTL_MS =
  60 * 60 * 1000;

const PASSWORD_RESET_RESEND_COOLDOWN_MS =
  2 * 60 * 1000;

const DEFAULT_PASSWORD_RESET_FROM =
  "Tech Path Security <security@notify.dev-champions.tech>";

const DEFAULT_REPLY_TO =
  "support@dev-champions.tech";

export const getPasswordResetTokenByToken =
  async (token: string) => {
    try {
      const passwordResetToken =
        await db.passwordResetToken.findUnique({
          where: {
            token,
          },
        });

      return passwordResetToken;
    } catch (error) {
      console.error(
        "Unable to retrieve password reset token:",
        error,
      );

      return null;
    }
  };

export const getPasswordResetTokenByEmail =
  async (email: string) => {
    try {
      const passwordResetToken =
        await db.passwordResetToken.findFirst({
          where: {
            email,
          },
        });

      return passwordResetToken;
    } catch (error) {
      console.error(
        "Unable to retrieve password reset token by email:",
        error,
      );

      return null;
    }
  };

export const isPasswordResetRequestOnCooldown =
  async (email: string) => {
    const existingToken =
      await getPasswordResetTokenByEmail(email);

    if (!existingToken) {
      return false;
    }

    const expiresAt =
      existingToken.expires.getTime();

    /*
     * An expired token should never block a new
     * password-reset request.
     */
    if (expiresAt <= Date.now()) {
      return false;
    }

    /*
     * The current model does not store createdAt,
     * but password-reset tokens always expire one
     * hour after creation.
     *
     * That lets us derive the creation time without
     * requiring a Prisma migration.
     */
    const createdAt =
      expiresAt -
      PASSWORD_RESET_TOKEN_TTL_MS;

    return (
      Date.now() - createdAt <
      PASSWORD_RESET_RESEND_COOLDOWN_MS
    );
  };

export const generatePasswordResetToken =
  async (email: string) => {
    const token = uuidv4();

    const expires = new Date(
      Date.now() +
      PASSWORD_RESET_TOKEN_TTL_MS,
    );

    const existingToken =
      await getPasswordResetTokenByEmail(email);

    /*
     * Only one reset token should remain valid for
     * this email at a time.
     */
    if (existingToken) {
      await db.passwordResetToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const passwordResetToken =
      await db.passwordResetToken.create({
        data: {
          email,
          token,
          expires,
        },
      });

    return passwordResetToken;
  };

export const deletePasswordResetTokenById =
  async (id: string) => {
    await db.passwordResetToken.delete({
      where: {
        id,
      },
    });
  };

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  /*
   * Keep password-reset mail isolated from the
   * application's existing Resend configuration.
   *
   * RESEND_API_KEY remains as a fallback during
   * transition so existing deployments do not crash.
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
    DEFAULT_PASSWORD_RESET_FROM;

  const replyTo =
    process.env.RESEND_REPLY_TO?.trim() ||
    DEFAULT_REPLY_TO;

  const baseUrl = (
    process.env.BASE_URL ||
    siteConfig.url
  )
    .trim()
    .replace(/\/+$/, "");

  const resetUrl = new URL(
    "/password-reset-form",
    `${baseUrl}/`,
  );

  resetUrl.searchParams.set(
    "token",
    token,
  );

  const resetLink = resetUrl.toString();

  /*
   * Password-reset messages should remain small
   * and transactional:
   *
   * - no social links
   * - no marketing content
   * - no remote images
   * - one clear security action
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
        <title>Reset your Tech Path password</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f7fa;
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
            background: #f5f7fa;
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
                  background: #ffffff;
                  border: 1px solid #e6eaf0;
                  border-radius: 16px;
                  overflow: hidden;
                "
              >

                <tr>
                  <td
                    style="
                      padding: 26px 32px;
                      background: #5a1c4b;
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
                      Reset your password
                    </h1>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: #374151;
                        font-size: 16px;
                        line-height: 1.7;
                      "
                    >
                      We received a request to reset
                      the password for your Tech Path
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
                      Use the button below to choose
                      a new password.
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
                            background: #409fb6;
                            border-radius: 8px;
                          "
                        >
                          <a
                            href="${resetLink}"
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
                            Reset password
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
                        href="${resetLink}"
                        style="
                          color: #077998;
                          text-decoration: underline;
                        "
                      >
                        ${resetLink}
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
                      This link expires in 1 hour.
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #6b7280;
                        font-size: 14px;
                        line-height: 1.7;
                      "
                    >
                      If you did not request this
                      password reset, you can safely
                      ignore this email. Your password
                      will remain unchanged.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 20px 32px;
                      border-top: 1px solid #e5e7eb;
                      background: #fafafa;
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

  /*
   * Explicitly provide a plain-text version.
   * This is useful for accessibility, text-only
   * clients and deliverability checks.
   */
  const text = `
Reset your Tech Path password

We received a request to reset the password for your Tech Path account.

Reset your password using this link:

${resetLink}

This link expires in 1 hour.

If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.

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
          "Reset your Tech Path password",
        html,
        text,
      });

    if (error) {
      console.error(
        "Resend password reset email failed:",
        error,
      );
    }

    return {
      error,
      id: data?.id ?? null,
    };
  } catch (error) {
    console.error(
      "Password reset email request failed:",
      error,
    );

    return {
      error:
        error instanceof Error
          ? error
          : new Error(
            "Unable to send password reset email.",
          ),
      id: null,
    };
  }
};