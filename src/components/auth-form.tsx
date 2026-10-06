"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createAuthFormSchema } from "@/lib/auth-form-schema";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { getAuthCallbackUrl, getAuthPageUrl, getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

type Form = z.infer<ReturnType<typeof createAuthFormSchema>>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const schema = createAuthFormSchema(mode);
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
        : await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { username: values.username, display_name: values.username }, emailRedirectTo: getAuthCallbackUrl(params.get("next"), window.location.origin) } });
      if (result.error) throw result.error;
      if (mode === "register" && !result.data.session) {
        setNotice("Check your email to confirm your account before signing in.");
        return;
      }
      router.push(getSafeRedirectPath(params.get("next"), window.location.origin));
      router.refresh();
    } catch (cause) {
      setError(getAuthErrorMessage(cause));
    }
  }

  return <div className="auth-card">
    <div className="hero-index">GAMEVAULT ACCOUNT</div>
    <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
    <p className="page-subtitle">{mode === "login" ? "Sign in to pick up where you left off." : "Your games and notes stay yours."}</p>
    <form onSubmit={handleSubmit(submit)}>
      {mode === "register" && <label className="field">Username<input autoComplete="username" required aria-invalid={Boolean(errors.username)} {...register("username")}/>{errors.username && <small role="alert">Choose 3–24 letters, numbers, underscores, or hyphens.</small>}</label>}
      <label className="field">Email<input type="email" autoComplete="email" {...register("email")}/>{errors.email && <small role="alert">{errors.email.message}</small>}</label>
      <label className="field">Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")}/>{errors.password && <small role="alert">{errors.password.message}</small>}</label>
      {error && <p role="alert" style={{ color: "#ff9c80" }}>{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <button className="button button-primary" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <p className="page-subtitle" style={{ marginTop: 19, fontSize: 12 }}>{mode === "login" ? <>New to GameVault? <a href={getAuthPageUrl("register", params.get("next"))}>Create an account</a></> : <>Already have an account? <a href={getAuthPageUrl("login", params.get("next"))}>Sign in</a></>}</p>
  </div>;
}
