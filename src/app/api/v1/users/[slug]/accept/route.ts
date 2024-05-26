import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export const PUT = async (
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
              equals: Number(check.id),
            },
          },
          {
            following_id: {
              equals: user!.id,
            },
          },
        ],
      },
    });
    if (!isFollowed[0])
      return NextResponse.json(
        { message: "The user is not following you" },
        { status: 422 }
      );
    if (isFollowed[0].is_accepted)
      return NextResponse.json(
        { message: "Follow request is already accepted" },
        { status: 422 }
      );
    await prisma.follow.updateMany({
      where: {
        AND: [
          {
            follower_id: {
              equals: Number(check.id),
            },
          },
          {
            following_id: {
              equals: user!.id,
            },
          },
        ],
      },
      data: {
        is_accepted: 1,
      },
    });
    return NextResponse.json(
      { message: "Follow request accepted" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
