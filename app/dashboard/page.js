import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const money = n => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const total = (rows, key="amount") => (rows || []).reduce((s, x) => s + Number(x?.[key] || 0), 0);

export default async function DashboardPage(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");

  const [{data:profile},{data:cloud}] = await Promise.all([
    supabase.from("profiles")
      .select("uid,business_name,owner_name,account_status,plan_name,subscription_status")
      .eq("id",user.id).single(),
    supabase.from("app_state")
      .select("data,revision,updated_at")
      .eq("user_id",user.id).maybeSingle()
  ]);

  if(profile?.account_status==="suspended") redirect("/login");

  const state=cloud?.data||{};
  const initial=(profile?.business_name||profile?.owner_name||"B").trim().charAt(0).toUpperCase();
  const orders=Array.isArray(state.dispatches)?state.dispatches:[];
  const returns=Array.isArray(state.returns)?state.returns:[];
  const payments=Array.isArray(state.payments)?state.payments:[];
  const purchases=Array.isArray(state.purchases)?state.purchases:[];
  const expenses=Array.isArray(state.expenses)?state.expenses:[];
  const products=Array.isArray(state.products)?state.products:[];

  const sections=[
    ["orders","Orders",orders.length,"Dispatch & order history"],
    ["returns","Returns / RTO",returns.length,"Returns, RTO & restock"],
    ["payments","Payments",money(total(payments)),"Received payments"],
    ["expenses","Expenses",money(total(expenses)),"Business expenses"],
    ["inventory","Inventory",products.length,"Stock & purchase history"],
    ["summary","Business Summary",orders.length+returns.length,"Overview & totals"]
  ];

  return <main className="shell">
    <section className="card" style={{padding:22}}>
      <div className="brand">
        <div className="logo">{initial}</div>
        <div style={{minWidth:0}}>
          <h2 style={{margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile?.business_name||profile?.owner_name||"BIXNOII"}</h2>
          <div className="muted">{profile?.owner_name||"Business account"} • Powered by BIXNOII</div>
        </div>
      </div>

      <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
        {[
          ["UID",profile?.uid||"—"],
          ["Plan",profile?.plan_name||"Free"],
          ["Subscription",profile?.subscription_status||"active"],
          ["Account",profile?.account_status||"active"]
        ].map(([k,v])=><div key={k} className="card" style={{padding:16,boxShadow:"none"}}>
          <div className="muted">{k}</div><b>{v}</b>
        </div>)}
      </div>
    </section>

    <section style={{marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,margin:"0 4px 10px"}}>
        <div><h3 style={{margin:0}}>Business modules</h3><div className="muted">Tap any section to open</div></div>
        <div className="muted" style={{fontSize:12}}>Cloud rev {cloud?.revision||0}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
        {sections.map(([slug,title,value,sub])=>
          <Link key={slug} href={"/dashboard/"+slug} className="card" style={{padding:18,display:"block",transition:"transform .15s ease",boxShadow:"0 8px 24px rgba(40,28,82,.06)"}}>
            <div className="muted" style={{fontSize:12}}>{sub}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginTop:7}}>
              <b style={{fontSize:18}}>{title}</b>
              <strong style={{fontSize:20,color:"var(--primary)"}}>{value}</strong>
            </div>
            <div style={{marginTop:12,color:"var(--primary)",fontWeight:800,fontSize:13}}>Open →</div>
          </Link>
        )}
      </div>
    </section>
  </main>
}
