import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return Response.redirect(new URL("/login", request.url), 303);
}
