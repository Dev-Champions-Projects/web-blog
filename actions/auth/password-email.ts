"use server";

import {
  deletePasswordResetTokenById,
  generatePasswordResetToken,
  isPasswordResetRequestOnCooldown,
  sendPasswordResetEmail,
} from "@/lib/passwordResetToken";

import { getUserByEmail } from "@/lib/user";

import {
  PasswordEmailSchema,
  PasswordEmailSchemaType,
} from "@/schemas/PasswordEmailSchema";

const RESET_REQUEST_MESSAGE =
  "If an account exists for this email, we'll send a password reset link shortly. Check your inbox, and check Spam or Junk if it hasn't arrived within a few minutes.";

export const passwordEmail = async (
  values: PasswordEmailSchemaType,
) => {
  const validatedFields =
    PasswordEmailSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error:
        "Please enter a valid email address.",
    };
  }

  const { email } = validatedFields.data;

  try {
    const user =
      await getUserByEmail(email);

    /*
     * Do not reveal whether this email address
     * is registered.
     */
    if (!user?.email) {
      return {
        success:
          RESET_REQUEST_MESSAGE,
      };
    }

    /*
     * Avoid repeatedly sending reset messages
     * to the same account.
     *
     * This provides a small two-minute cooldown
     * without requiring a database migration.
     */
    const onCooldown =
      await isPasswordResetRequestOnCooldown(
        user.email,
      );

    if (onCooldown) {
      return {
        success:
          RESET_REQUEST_MESSAGE,
      };
    }

    const passwordResetToken =
      await generatePasswordResetToken(
        user.email,
      );

    const { error } =
      await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
      );

    if (error) {
      console.error(
        "Unable to send password reset email:",
        error,
      );

      /*
       * The message was not sent, so remove the
       * token. This allows another legitimate
       * request to retry instead of waiting for
       * the token to expire.
       */
      try {
        await deletePasswordResetTokenById(
          passwordResetToken.id,
        );
      } catch (
      tokenCleanupError
      ) {
        console.error(
          "Unable to clean up failed password reset token:",
          tokenCleanupError,
        );
      }
    }

    /*
     * The public response remains identical even
     * when sending fails so this endpoint cannot
     * be used to discover registered accounts.
     */
    return {
      success:
        RESET_REQUEST_MESSAGE,
    };
  } catch (error) {
    console.error(
      "passwordEmail action failed:",
      error,
    );

    return {
      success:
        RESET_REQUEST_MESSAGE,
    };
  }
};