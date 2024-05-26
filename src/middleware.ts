import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (!data.user || error)
    return NextResponse.redirect(new URL("/auth/login", request.url));
  return await updateSession(request);
}
export const config = {
  matcher: ["/"],
};
