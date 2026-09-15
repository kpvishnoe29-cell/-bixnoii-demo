"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({business:"",owner:"",phone:"",email:"",password:"",confirm:""});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  const change=e=>setForm(v=>({...v,[e.target.name]:e.target.value}));

  async function submit(e){
    e.preventDefault();
    setMessage("");
    if(mode==="signup"){
      if(!form.business||!form.owner||!form.phone||!form.email) return setMessage("Complete all account details.");
      if(form.password!==form.confirm) return setMessage("Passwords do not match.");
    }
    if(form.password.length<6) return setMessage("Password must be at least 6 characters.");

    setBusy(true);
    try{
      if(mode==="login"){
        const {error}=await supabase.auth.signInWithPassword({email:form.email,password:form.password});
        if(error) throw error;
        window.location.href="/dashboard";
      }else{
        const {data,error}=await supabase.auth.signUp({
          email:form.email,
          password:form.password,
          options:{data:{business_name:form.business,owner_name:form.owner,phone:form.phone}}
        });
        if(error) throw error;
        if(!data.session) setMessage("Account created. Email confirmation is still enabled in Supabase.");
        else window.location.href="/dashboard";
      }
    }catch(err){
      setMessage(err.message||"Something went wrong.");
    }finally{setBusy(false)}
  }

  return <main className="shell" style={{maxWidth:520}}>
    <section className="card" style={{padding:24}}>
      <div className="brand"><div className="logo">B</div><div><h2 style={{margin:0}}>BIXNOII Cloud</h2><div className="muted">Secure customer access</div></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"20px 0"}}>
        <button className={"btn "+(mode==="login"?"btn-primary":"btn-light")} onClick={()=>setMode("login")}>Login</button>
        <button className={"btn "+(mode==="signup"?"btn-primary":"btn-light")} onClick={()=>setMode("signup")}>Create account</button>
      </div>
      <form onSubmit={submit} className="grid">
        {mode==="signup" && <>
          <div><label className="label">Business Name</label><input className="input" name="business" value={form.business} onChange={change}/></div>
          <div><label className="label">Your Name</label><input className="input" name="owner" value={form.owner} onChange={change}/></div>
          <div><label className="label">Mobile Number</label><input className="input" name="phone" value={form.phone} onChange={change}/></div>
        </>}
        <div><label className="label">Email</label><input className="input" type="email" name="email" value={form.email} onChange={change}/></div>
        <div><label className="label">Password</label><input className="input" type="password" name="password" value={form.password} onChange={change}/></div>
        {mode==="signup" && <div><label className="label">Confirm Password</label><input className="input" type="password" name="confirm" value={form.confirm} onChange={change}/></div>}
        {message && <div className="error">{message}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy?"Please wait…":mode==="login"?"Login":"Create Account"}</button>
      </form>
    </section>
  </main>
}
