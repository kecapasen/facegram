import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export const DELETE = async () => {
  const supabase = createClient();
  const isUser = await supabase.auth.getUser();
  if (isUser.error) {
    return NextResponse.json(
      { message: isUser.error.message },
      { status: 400 }
    );
  }
  const logout = await supabase.auth.signOut();
  if (logout.error) {
    return NextResponse.json(
      { message: logout.error.message },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { message: "Logout success" },
    {
      status: 200,
    }
  );
};
