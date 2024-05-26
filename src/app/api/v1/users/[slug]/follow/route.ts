import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (
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
    if (slug === user!.username)
      return NextResponse.json({
        message: "You are not allowed to follow yourself",
      });
    const check = await prisma.users.findUnique({
      where: {
        username: slug,
      },
    });
    if (!check)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const isFollowed = await prisma.follow.findMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: user!.id,
            },
          },
          {
            following_id: {
              equals: Number(check.id),
            },
          },
        ],
      },
    });
    if (isFollowed[0])
      return NextResponse.json(
        {
          message: "You are already followed",
          status: isFollowed[0].is_accepted ? "following" : "requested",
        },
        { status: 422 }
      );
    const result = await prisma.follow.create({
      data: {
        follower_id: user!.id,
        following_id: Number(check.id),
        is_accepted: check.is_private ? 0 : 1,
      },
    });
    return NextResponse.json(
      {
        message: "Follow success",
        status: result.is_accepted ? "following" : "requested",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
