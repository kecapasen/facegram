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
        AND: [
          {
            id: {
              not: user!.id,
            },
          },
          {
            following: {
              none: {
                follower_id: {
                  equals: user!.id,
                },
              },
            },
          },
        ],
      },
      include: {
        following: true,
      },
    });
    if (!result[0])
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    const responseData = {
      users: result.map((data) => {
        return {
          id: data.id,
          fullname: data.fullname,
          username: data.username,
          bio: data.bio,
          is_private: data.is_private,
          created_at: data.created_at,
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
