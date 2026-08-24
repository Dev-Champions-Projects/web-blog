// "use server";

// import {
//   revalidatePath,
// } from "next/cache";

// import {
//   db,
// } from "@/lib/db";

// import {
//   getUserById,
// } from "@/lib/user";

// import {
//   BlogSchema,
//   BlogSchemaType,
// } from "@/schemas/BlogSchema";

// import {
//   slugify,
// } from "@/lib/slug";

// import {
//   notifyNewBlogSubscribers,
// } from "@/lib/blogPushNotifications";


// export const createBlog =
//   async (
//     values:
//       BlogSchemaType,
//   ) => {
//     const vFields =
//       BlogSchema.safeParse(
//         values,
//       );


//     if (
//       !vFields.success
//     ) {
//       return {
//         error:
//           "Invalid fields!",
//       };
//     }


//     const {
//       userId,
//       isPublished,
//     } =
//       vFields.data;


//     const user =
//       await getUserById(
//         userId,
//       );


//     if (
//       !user
//     ) {
//       return {
//         error:
//           "User does not exist!",
//       };
//     }


//     if (
//       isPublished &&
//       !user.emailVerified
//     ) {
//       return {
//         error:
//           "Not authorized! Verify your email!",
//       };
//     }


//     /*
//      * ========================================
//      * UNIQUE SLUG
//      * ========================================
//      */

//     const base =
//       slugify(
//         vFields.data
//           .title ||
//         "",
//       );


//     let finalSlug:
//       string |
//       undefined =
//       base ||
//       undefined;


//     if (
//       finalSlug
//     ) {
//       let candidate =
//         finalSlug;


//       let index =
//         1;


//       while (
//         await db.blog.findUnique({
//           where: {
//             slug:
//               candidate,
//           },
//         })
//       ) {
//         index +=
//           1;


//         candidate =
//           `${finalSlug}-${index}`;
//       }


//       finalSlug =
//         candidate;
//     }


//     /*
//      * ========================================
//      * DUPLICATE GUARD
//      * ========================================
//      */

//     try {
//       const fiveMinutesAgo =
//         new Date(
//           Date.now() -
//           5 *
//           60 *
//           1000,
//         );


//       const recent =
//         await db.blog.findFirst({
//           where: {
//             userId,

//             title:
//               vFields.data
//                 .title,

//             content:
//               vFields.data
//                 .content,

//             createdAt: {
//               gte:
//                 fiveMinutesAgo,
//             },
//           },
//         });


//       if (
//         recent
//       ) {
//         return {
//           error:
//             "Duplicate blog detected. Did you submit twice?",
//         };
//       }
//     } catch {
//       /*
//        * Duplicate checking must not
//        * block publishing if it fails.
//        */
//     }


//     /*
//      * ========================================
//      * CREATE
//      * ========================================
//      */

//     const created =
//       await db.blog.create({
//         data: {
//           ...vFields.data,

//           youtubeUrl:
//             vFields.data
//               .youtubeUrl ||
//             null,

//           slug:
//             finalSlug,

//           /*
//            * Publishing immediately means
//            * this is the first publication.
//            */

//           publishedAt:
//             isPublished
//               ? new Date()
//               : null,
//         },
//       });


//     /*
//      * ========================================
//      * REVALIDATE
//      * ========================================
//      */

//     try {
//       const path =
//         finalSlug
//           ? `/blog/details/${finalSlug}-${created.id}`
//           : `/blog/details/${created.id}`;


//       revalidatePath(
//         path,
//       );


//       revalidatePath(
//         "/blog/feed/1",
//       );


//       revalidatePath(
//         `/user/${created.userId}/1`,
//       );
//     } catch {
//       // Ignore.
//     }


//     /*
//      * ========================================
//      * FIRST PUBLICATION PUSH
//      * ========================================
//      *
//      * Push failure does not undo the blog.
//      */

//     if (
//       isPublished
//     ) {
//       await notifyNewBlogSubscribers({
//         id:
//           created.id,

//         title:
//           created.title,

//         slug:
//           created.slug,

//         tags:
//           created.tags,

//         coverImage:
//           created.coverImage,
//       });
//     }


//     return {
//       success:
//         isPublished
//           ? "Blog published"
//           : "Blog saved",

//       blogId:
//         created.id,

//       slug:
//         finalSlug,
//     };
//   };

"use server";

import {
  db,
} from "@/lib/db";

import {
  getUserById,
} from "@/lib/user";

import {
  BlogSchema,
  BlogSchemaType,
} from "@/schemas/BlogSchema";

import {
  slugify,
} from "@/lib/slug";

import {
  revalidatePath,
} from "next/cache";

import {
  notifyNewBlogSubscribers,
} from "@/lib/blogPushNotifications";


export const createBlog =
  async (
    values:
      BlogSchemaType,
  ) => {
    const vFields =
      BlogSchema.safeParse(
        values,
      );


    if (
      !vFields.success
    ) {
      return {
        error:
          "Invalid fields!",
      };
    }


    const {
      userId,
      isPublished,
    } =
      vFields.data;


    const user =
      await getUserById(
        userId,
      );


    if (
      !user
    ) {
      return {
        error:
          "User does not exist!",
      };
    }


    if (
      isPublished &&
      !user.emailVerified
    ) {
      return {
        error:
          "Not authorized! Verify your email!",
      };
    }


    const base =
      slugify(
        vFields.data
          .title ||
        "",
      );


    let finalSlug:
      string |
      undefined =
      base ||
      undefined;


    if (
      finalSlug
    ) {
      let candidate =
        finalSlug;

      let index =
        1;


      while (
        await db.blog.findUnique({
          where: {
            slug:
              candidate,
          },
        })
      ) {
        index +=
          1;

        candidate =
          `${finalSlug}-${index}`;
      }


      finalSlug =
        candidate;
    }


    try {
      const fiveMinutesAgo =
        new Date(
          Date.now() -
          5 *
          60 *
          1000,
        );


      const recent =
        await db.blog.findFirst({
          where: {
            userId,

            title:
              vFields.data
                .title,

            content:
              vFields.data
                .content,

            createdAt: {
              gte:
                fiveMinutesAgo,
            },
          },
        });


      if (
        recent
      ) {
        return {
          error:
            "Duplicate blog detected. Did you submit twice?",
        };
      }
    } catch {
      // Ignore duplicate-check failures.
    }


    const created =
      await db.blog.create({
        data: {
          ...vFields.data,

          youtubeUrl:
            vFields.data
              .youtubeUrl ||
            null,

          slug:
            finalSlug,

          publishedAt:
            isPublished
              ? new Date()
              : null,
        },
      });


    try {
      const path =
        finalSlug
          ? `/blog/details/${finalSlug}-${created.id}`
          : `/blog/details/${created.id}`;


      revalidatePath(
        path,
      );

      revalidatePath(
        "/blog/feed/1",
      );

      revalidatePath(
        `/user/${created.userId}/1`,
      );
    } catch {
      // Ignore.
    }


    if (
      isPublished
    ) {
      await notifyNewBlogSubscribers({
        id:
          created.id,

        title:
          created.title,

        slug:
          created.slug,

        coverImage:
          created.coverImage,

        tags:
          created.tags,

        userId:
          created.userId,
      });
    }


    return {
      success:
        isPublished
          ? "Blog published"
          : "Blog saved",

      blogId:
        created.id,

      slug:
        finalSlug,
    };
  };