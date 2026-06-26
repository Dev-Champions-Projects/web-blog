"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  generateEmailVerificationToken,
  sendEmailVerificationToken,
} from "@/lib/emailVerification";
import { getUserByEmail, getUserById } from "@/lib/user";
import {
  EditProfileSchema,
  EditProfileSchemaType,
} from "@/schemas/EditProfileSchema";

export const editUser = async (
  values: EditProfileSchemaType,
  userId: string
) => {
  const vFields = EditProfileSchema.safeParse(values);

  if (!vFields.success) return { error: "Invalid fields" };

  const session = await auth();

  if (session?.user.userId !== userId) return { error: "Not authorized!" };

  const user = await getUserById(userId);

  if (!user) return { error: "User does not exist!" };

  if (user.email !== vFields.data.email) {
    const existingUser = await getUserByEmail(vFields.data.email);
    if (existingUser) {
      return { error: "Email already in use!" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        ...vFields.data,
        emailVerified: null,
      },
    });

    const verificationToken = await generateEmailVerificationToken(
      vFields.data.email
    );
    const { error } = await sendEmailVerificationToken(
      verificationToken.email,
      verificationToken.token
    );

    if (error) {
      return {
        error:
          "Something went wrong while sending verification email! Try to login to resend the verification email!",
      };
    }

    return { success: "Verification email sent!" };
  } else {
    await db.user.update({
      where: { id: userId },
      data: {
        ...vFields.data,
      },
    });

    return { success: "user profile updated" };
  }
};
