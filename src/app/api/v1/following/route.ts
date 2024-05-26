import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export const GET = async () => {
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
    const result = await prisma.users.findMany({
      where: {
        following: {
          some: {
            follower_id: {
              equals: user?.id,
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
      following: result.map((data) => {
        return {
          id: data.id,
          full_name: data.fullname,
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
    return NextResponse.json(parse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
