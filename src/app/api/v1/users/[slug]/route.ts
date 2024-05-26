import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export const GET = async (
  req: NextRequest,
  { params: { slug } }: { params: { slug: string } }
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
    const result = await prisma.users.findUnique({
      where: {
        username: slug,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        bio: true,
        is_private: true,
        created_at: true,
        posts: {
          include: {
            post_attachments: true,
          },
        },
        following: {
          where: {
            follower_id: {
              equals: user!.id,
            },
          },
          select: {
            is_accepted: true,
          },
        },
        _count: {
          select: {
            posts: true,
            follower: true,
            following: true,
          },
        },
      },
    });
    if (!result)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const responseData = {
      id: result.id,
      fullname: result.fullname,
      username: result.username,
      bio: result.bio,
      is_private: result.is_private,
      created_at: result.created_at,
      is_your_account: result.id === user!.id,
      following_status: result.following[0]
        ? result.following[0].is_accepted === 1
          ? "following"
          : "requested"
        : "not-following",
      posts_count: result._count.posts,
      followers_count: result._count.follower,
      following_count: result._count.following,
      posts:
        (result.is_private === 0 || result.following[0]?.is_accepted === 1) &&
        result.posts,
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === "bigint" ? Number(value) : value;
      })
    );
    return NextResponse.json(parse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
