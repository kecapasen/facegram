import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { z } from "zod";
export const GET = async (req: NextRequest) => {
  const postSchema = z.object({
    page: z
      .number({
        message: "The size field must be a number.",
      })
      .min(0, "The page field must be at least 0."),
    size: z
      .number({
        message: "The size field must be a number.",
      })
      .min(1, "The page field must be at least 0."),
  });
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const user = await prisma.users.findUnique({
      where: {
        email: data.user.email,
      },
    });
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page"));
    const size = Number(searchParams.get("size"));
    const skip = Number(size) * Number(page);
    const postData = {
      page,
      size,
    };
    postSchema.parse(postData);
    const result = await prisma.posts.findMany({
      take: size,
      skip,
      orderBy: {
        id: "desc",
      },
      where: {
        OR: [
          {
            user: {
              following: {
                some: {
                  follower_id: user!.id,
                  is_accepted: 1,
                },
              },
            },
          },
          {
            user_id: user!.id,
          },
        ],
      },
      include: {
        user: true,
        post_attachments: true,
      },
    });
    const responseData = {
      page,
      size,
      posts: result.map((post) => {
        return {
          id: post.id,
          caption: post.caption,
          created_at: post.created_at,
          deleted_at: post.deleted_at,
          user: {
            id: post.user.id,
            fullname: post.user.fullname,
            username: post.user.username,
            bio: post.user.bio,
            is_private: post.user.is_private,
            created_at: post.user.created_at,
          },
          attachments: post.post_attachments.map((attachment) => {
            return {
              id: attachment.id,
              storage_path: attachment.storage_path,
            };
          }),
        };
      }),
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === "bigint" ? Number(value) : value;
      })
    );
    return NextResponse.json(parse, { status: 200 });
  } catch (error: any) {
    if (error.errors) {
      const errorMessages = error.errors.map((validationError: any) => {
        const field = validationError.path[0];
        const message = validationError.message;
        return { [field]: [message] };
      });
      const formattedErrors: { [key: string]: string[] } = {};
      errorMessages.map((errorMessage: any) => {
        const field = Object.keys(errorMessage)[0];
        const message = errorMessage[field];
        formattedErrors[field] = message;
      });
      return NextResponse.json(
        { message: "Invalid field", errors: formattedErrors },
        { status: 422 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
export const POST = async (req: NextRequest) => {
  const postSchema = z.object({
    caption: z.string().min(1, "The full name field is required.").max(255),
    attachments: z
      .array(z.instanceof(File))
      .min(
        1,
        "The attachments.0 field must be a file of type: png, jpg, jpeg, webp."
      ),
  });
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const user = await prisma.users.findUnique({
      where: {
        email: data.user.email,
      },
    });
    const formData = await req.formData();
    const caption = formData.get("caption");
    const images = formData.getAll("images");
    const postData = {
      caption: formData.get("caption")?.toString(),
      attachments: formData.getAll("images"),
    } as z.infer<typeof postSchema>;
    postSchema.parse(postData);
    const image = await Promise.all(
      images.map(async (image) => {
        const file: File = image as unknown as File;
        const byte = await file.arrayBuffer();
        const buffer = Buffer.from(byte);
        const path = join(process.cwd(), "public", "posts", file.name);
        await writeFile(path, buffer);
        return { storage_path: `/posts/${file.name}` };
      })
    );
    await prisma.posts.create({
      data: {
        caption: caption!.toString(),
        user_id: user!.id,
        post_attachments: {
          createMany: {
            data: image,
          },
        },
      },
    });
    return NextResponse.json(
      { message: "Create post success" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.errors) {
      const errorMessages = error.errors.map((validationError: any) => {
        const field = validationError.path[0];
        const message = validationError.message;
        return { [field]: [message] };
      });
      const formattedErrors: { [key: string]: string[] } = {};
      errorMessages.map((errorMessage: any) => {
        const field = Object.keys(errorMessage)[0];
        const message = errorMessage[field];
        formattedErrors[field] = message;
      });
      return NextResponse.json(
        { message: "Invalid field", errors: formattedErrors },
        { status: 422 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
export const DELETE = async (
  req: NextRequest,
  { params: { slug } }: { params: { slug: string[] } }
) => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const user = await prisma.users.findUnique({
      where: {
        email: data.user.email,
      },
    });
    const result = await prisma.posts.findUnique({
      where: {
        id: Number(slug[0]),
      },
      include: {
        user: true,
      },
    });
    if (!result)
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    const match = user!.id === result.user.id;
    if (match) {
      try {
        await prisma.posts.delete({
          where: {
            id: Number(slug[0]),
          },
        });
        return NextResponse.json(null, { status: 204 });
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { message: "Forbidden access" },
        { status: 403 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
