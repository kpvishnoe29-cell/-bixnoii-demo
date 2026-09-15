import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");

  const {data:profile}=await supabase
    .from("profiles")
    .select("uid,business_name,owner_name,account_status,plan_name,subscription_status")
    .eq("id",user.id)
    .single();

  if(profile?.account_status==="suspended") redirect("/login");

  const initial=(profile?.business_name||profile?.owner_name||"B").trim().charAt(0).toUpperCase();

  return <main className="shell">
    <section className="card" style={{padding:22}}>
      <div className="brand">
        <div className="logo">{initial}</div>
        <div>
          <h2 style={{margin:0}}>{profile?.business_name||profile?.owner_name||"BIXNOII"}</h2>
          <div className="muted">{profile?.owner_name||"Business account"} • Powered by BIXNOII</div>
        </div>
      </div>
      <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
        {[
          ["UID",profile?.uid||"—"],
          ["Plan",profile?.plan_name||"Free"],
          ["Subscription",profile?.subscription_status||"active"],
          ["Account",profile?.account_status||"active"]
        ].map(([k,v])=><div key={k} className="card" style={{padding:16,boxShadow:"none"}}><div className="muted">{k}</div><b>{v}</b></div>)}
      </div>
      <p className="muted" style={{marginTop:20}}>
        Next.js secure foundation is active. Business modules will be migrated here while the current live app remains available.
      </p>
    </section>
  </main>
}
