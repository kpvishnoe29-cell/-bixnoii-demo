import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const money=n=>"₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2});
const arr=(v)=>Array.isArray(v)?v:[];
const num=n=>Number(n||0);
const sum=(rows,fn)=>arr(rows).reduce((s,x)=>s+num(fn(x)),0);

function Items({rows,type}){
  if(!rows.length) return <div className="card" style={{padding:22,textAlign:"center",boxShadow:"none"}}><b>No data yet</b><div className="muted" style={{marginTop:6}}>Entries from the old BIXNOII cloud app will appear here.</div></div>;
  return <div className="grid">{rows.slice().reverse().slice(0,100).map((x,i)=>{
    const title =
      type==="orders" ? (x.platform||"Dispatch")+" • "+(x.orderId||x.id||"Order") :
      type==="returns" ? (x.type||((num(x.rto)>0)?"RTO":"Return"))+" • "+(x.platform||"Platform") :
      type==="payments" ? (x.platform||x.mode||"Payment") :
      type==="expenses" ? (x.category||x.title||x.name||"Expense") :
      type==="inventory" ? (x.name||x.sku||"Product") :
      type==="purchases" ? (x.supplier||x.invoiceNo||"Purchase") : "Entry";
    const qty = Array.isArray(x.items) ? sum(x.items,it=>it.qty) : num(x.qty||x.quantity||0);
    const amount = x.amount ?? x.total ?? x.value;
    const meta = [
      x.date||x.createdAt||x.created_at,
      x.sku,
      qty?("Qty "+qty):"",
      amount!==undefined?money(amount):""
    ].filter(Boolean).join(" • ");
    return <div className="card" key={x.id||x.uid||i} style={{padding:15,boxShadow:"none"}}>
      <b>{title}</b>
      <div className="muted" style={{marginTop:5}}>{meta||"Cloud entry"}</div>
    </div>;
  })}</div>
}

export default async function SectionPage({params}){
  const {section}=await params;
  const allowed=["orders","returns","payments","expenses","inventory","summary"];
  if(!allowed.includes(section)) notFound();

  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");

  const [{data:profile},{data:cloud}] = await Promise.all([
    supabase.from("profiles").select("business_name,owner_name,account_status").eq("id",user.id).single(),
    supabase.from("app_state").select("data,revision,updated_at").eq("user_id",user.id).maybeSingle()
  ]);
  if(profile?.account_status==="suspended") redirect("/login");

  const state=cloud?.data||{};
  const orders=arr(state.dispatches), returns=arr(state.returns), payments=arr(state.payments),
        expenses=arr(state.expenses), products=arr(state.products), purchases=arr(state.purchases);

  const titles={orders:"Orders",returns:"Returns / RTO",payments:"Payments",expenses:"Expenses",inventory:"Inventory",summary:"Business Summary"};

  return <main className="shell">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:14}}>
      <div><Link href="/dashboard" style={{color:"var(--primary)",fontWeight:800,fontSize:13}}>← Dashboard</Link><h2 style={{margin:"7px 0 0"}}>{titles[section]}</h2></div>
      <div className="muted" style={{fontSize:12}}>Synced cloud data</div>
    </div>

    {section==="summary" ? <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>
        {[
          ["Orders",orders.length],["Returns/RTO",returns.length],["Payments",money(sum(payments,x=>x.amount))],
          ["Expenses",money(sum(expenses,x=>x.amount))],["Purchases",money(sum(purchases,x=>x.amount))],["Products",products.length]
        ].map(([k,v])=><div className="card" key={k} style={{padding:17,boxShadow:"none"}}><div className="muted">{k}</div><b style={{fontSize:20}}>{v}</b></div>)}
      </div>
    </> : section==="inventory" ? <>
      <div className="card" style={{padding:15,marginBottom:14}}>
        <b>Stock</b><div className="muted">{products.length} products • {purchases.length} purchase entries</div>
      </div>
      <Items rows={products} type="inventory"/>
      {purchases.length>0 && <><h3 style={{marginTop:22}}>Purchase History</h3><Items rows={purchases} type="purchases"/></>}
    </> : <Items rows={
      section==="orders"?orders:
      section==="returns"?returns:
      section==="payments"?payments:expenses
    } type={section}/>}
  </main>
}
