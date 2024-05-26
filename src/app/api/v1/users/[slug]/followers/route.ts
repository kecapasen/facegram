import { prisma } from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
export const GET = async (
  req: NextRequest,
  { params: { slug } }: { params: { slug: string } }
) => {
  try {
    const check = await prisma.users.findUnique({
      where: {
        username: slug,
      },
    });
    if (!check)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const result = await prisma.users.findMany({
      where: {
        follower: {
          some: {
            following_id: {
              equals: Number(check.id),
            },
          },
        },
      },
      include: {
        following: true,
      },
    });
    if (!result[0])
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const responseData = {
      followers: result.map((data) => {
        return {
          id: data.id,
          fullname: data.fullname,
          username: data.username,
          bio: data.bio,
          is_private: data.is_private,
          created_at: data.created_at,
          is_requested: data.following[0].is_accepted ? 0 : 1,
        };
      }),
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === "bigint" ? Number(value) : value;
      })
    );
    return NextResponse.json(parse);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
