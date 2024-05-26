import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export const DELETE = async (
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
    const checkFollowed = await prisma.follow.findMany({
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
    if (!checkFollowed[0])
      return NextResponse.json(
        { message: "You are not following the user" },
        { status: 422 }
      );
    await prisma.follow.deleteMany({
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
    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
