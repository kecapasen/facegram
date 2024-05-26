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
        email: data.user?.email,
      },
    });
    const responseData = {
      id: user!.id,
      full_name: user!.fullname,
      username: user!.username,
      bio: user!.bio,
      is_private: user!.is_private,
      created_at: user!.created_at,
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === "bigint" ? Number(value) : value;
      })
    );
    return NextResponse.json(parse, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
