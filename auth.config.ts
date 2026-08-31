import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";

import bcryptjs from "bcryptjs";

import { LoginSchema } from "./schemas/LoginSchema";
import { getUserByEmail } from "./lib/user";

export default {
  providers: [
    Github({
      clientId:
        process.env.GITHUB_CLIENT_ID,
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET,
    }),

    Google({
      clientId:
        process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      async authorize(credentials) {
        const validatedFields =
          LoginSchema.safeParse(
            credentials,
          );

        if (!validatedFields.success) {
          return null;
        }

        const {
          email,
          password,
        } = validatedFields.data;

        const user =
          await getUserByEmail(email);

        if (
          !user ||
          !user.password
        ) {
          return null;
        }

        /*
         * Never create a credentials session for
         * an email address that has not completed
         * Tech Path email verification.
         */
        if (!user.emailVerified) {
          return null;
        }

        const isCorrectPassword =
          await bcryptjs.compare(
            password,
            user.password,
          );

        if (!isCorrectPassword) {
          return null;
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;