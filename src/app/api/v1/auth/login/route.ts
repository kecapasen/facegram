import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
  const supabase = createClient();
  const formData = await req.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  if (!email || !password) {
    return NextResponse.json(
      { message: "Invalid login credentials" },
      { status: 401 }
    );
  }
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  try {
    const user = await prisma.users.findUnique({
      where: {
        email: data.user.email,
      },
    });
    const responseData = {
      message: "Login success",
      user,
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === "bigint" ? Number(value) : value;
      })
    );
    return NextResponse.json(parse, {
      status: 200,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      {
        status: 400,
      }
    );
  }
};
