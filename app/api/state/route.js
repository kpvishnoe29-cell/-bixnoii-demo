import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("app_state")
    .select("data,revision,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({
    data: data?.data || {},
    revision: data?.revision || 0,
    updatedAt: data?.updated_at || null
  });
}

export async function PUT(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body || typeof body.data !== "object") {
    return Response.json({ error: "Invalid state" }, { status: 400 });
  }

  const { data: current } = await supabase
    .from("app_state")
    .select("revision")
    .eq("user_id", user.id)
    .maybeSingle();

  const nextRevision = Number(current?.revision || 0) + 1;
  const { error } = await supabase.from("app_state").upsert({
    user_id: user.id,
    data: body.data,
    revision: nextRevision,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true, revision: nextRevision });
}
