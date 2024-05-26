import { regsiterSchema } from "@/types/authTypes/types";
import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export const POST = async (req: NextRequest) => {
  const supabase = createClient();
  const formData = await req.formData();
  const userData = {
    fullname: formData.get("fullname")?.toString(),
    username: formData.get("username")?.toString(),
    password: formData.get("password")?.toString(),
    email: formData.get("email")?.toString(),
    phone: formData.get("phone")?.toString(),
  } as unknown as z.infer<typeof regsiterSchema>;
  try {
    regsiterSchema.parse(userData);
    const { error } = await supabase.auth.signUp(userData);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    const result = await prisma.users.create({
      data: {
        fullname: userData.fullname,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        phone: Number(userData.phone),
      },
    });
    const responseData = {
      message: "Register success",
      user: result,
    };
    const parse = JSON.parse(
      JSON.stringify(responseData, (_, value) => {
        return typeof value === "bigint" ? Number(value) : value;
      })
    );
    return NextResponse.json(parse, {
      status: 201,
    });
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
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
};
