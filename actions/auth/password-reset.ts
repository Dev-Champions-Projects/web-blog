"use server";

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getPasswordResetTokenByToken } from "@/lib/passwordResetToken";
import { getUserByEmail } from "@/lib/user";

import {
  PasswordResetSchema,
  PasswordResetSchemaType,
} from "@/schemas/PasswordResetSchema";

export const passwordReset = async (
  values: PasswordResetSchemaType,
  token?: string | null,
) => {
  try {
    if (!token) {
      return {
        error: "Token does not exist!",
      };
    }

    const validatedFields =
      PasswordResetSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: "Invalid Password!",
      };
    }

    const existingToken =
      await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return {
        error: "Invalid token!",
      };
    }

    const isExpired =
      new Date(existingToken.expires) <
      new Date();

    if (isExpired) {
      return {
        error: "Token expired!",
      };
    }

    const user =
      await getUserByEmail(
        existingToken.email,
      );

    if (!user) {
      return {
        error: "User does not exist!",
      };
    }

    const { password } =
      validatedFields.data;

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    /*
     * IMPORTANT:
     *
     * Resetting a password proves that the user
     * controls the password-reset link.
     *
     * It must NOT silently change the account's
     * email-verification state.
     *
     * emailVerified is changed only by the
     * dedicated email-verification flow.
     */
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    /*
     * A password-reset token is single-use.
     */
    await db.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });

    return {
      success: "Password Updated",
    };
  } catch (error) {
    console.error(
      "passwordReset action failed:",
      error,
    );

    return {
      error:
        "Something went wrong while updating your password.",
    };
  }
};