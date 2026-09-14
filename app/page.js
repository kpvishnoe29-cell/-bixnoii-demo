import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <section className="card" style={{padding:28}}>
        <div className="brand">
          <div className="logo">B</div>
          <div>
            <h1 style={{margin:0}}>BIXNOII</h1>
            <div className="muted">Secure Ecommerce Business Manager</div>
          </div>
        </div>

        <div style={{marginTop:28}}>
          <h2 style={{fontSize:38,margin:"0 0 10px"}}>Your business, one secure workspace.</h2>
          <p className="muted" style={{maxWidth:720,lineHeight:1.6}}>
            Orders, returns, payments, expenses, inventory, purchases and support — rebuilt on a secure Next.js + Supabase foundation.
          </p>
        </div>

        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:22}}>
          <Link className="btn btn-primary" href="/login">Customer Login</Link>
          <Link className="btn btn-light" href="/owner">Owner Panel</Link>
        </div>
      </section>
    </main>
  );
}
