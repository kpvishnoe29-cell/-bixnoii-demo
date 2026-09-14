import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");

  const {data:role}=await supabase.rpc("current_admin_role");
  if(!role) redirect("/dashboard");

  const {data:customers,error}=await supabase.rpc("owner_customer_list");

  return <main className="shell">
    <section className="card" style={{padding:22}}>
      <div className="brand"><div className="logo">B</div><div><h2 style={{margin:0}}>BIXNOII Owner Panel</h2><div className="muted">{String(role).toUpperCase()} access</div></div></div>
      <h3 style={{marginTop:24}}>Customers</h3>
      {error && <div className="error">{error.message}</div>}
      <div className="grid">
        {(customers||[]).map(c=><div key={c.uid} className="card" style={{padding:14,boxShadow:"none"}}>
          <b>UID {c.uid} • {c.business_name||"BIXNOII"}</b>
          <div className="muted">{c.owner_name||"—"} • {c.email||"—"}</div>
        </div>)}
      </div>
    </section>
  </main>
}
