"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_-]+$/).optional(),
});
type Form = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  async function submit(values: Form) {
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
        : await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { username: values.username, display_name: values.username } } });
      if (result.error) throw result.error;
      if (mode === "register" && !result.data.session) {
        setNotice("Check your email to confirm your account before signing in.");
        return;
      }
      const destination = params.get("next") ?? "/";
      const target = new URL(destination, window.location.origin);
      router.push(target.origin === window.location.origin ? `${target.pathname}${target.search}${target.hash}` : "/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    }
  }

  return <div className="auth-card">
    <div className="hero-index">GAMEVAULT ACCOUNT</div>
    <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
    <p className="page-subtitle">{mode === "login" ? "Sign in to pick up where you left off." : "Your games and notes stay yours."}</p>
    <form onSubmit={handleSubmit(submit)}>
      {mode === "register" && <label className="field">Username<input autoComplete="username" {...register("username")}/>{errors.username && <small role="alert">Choose 3–24 letters, numbers, underscores, or hyphens.</small>}</label>}
      <label className="field">Email<input type="email" autoComplete="email" {...register("email")}/>{errors.email && <small role="alert">{errors.email.message}</small>}</label>
      <label className="field">Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")}/>{errors.password && <small role="alert">{errors.password.message}</small>}</label>
      {error && <p role="alert" style={{ color: "#ff9c80" }}>{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <button className="button button-primary" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <p className="page-subtitle" style={{ marginTop: 19, fontSize: 12 }}>{mode === "login" ? <>New to GameVault? <a href="/auth/register">Create an account</a></> : <>Already have an account? <a href="/auth/login">Sign in</a></>}</p>
  </div>;
}
