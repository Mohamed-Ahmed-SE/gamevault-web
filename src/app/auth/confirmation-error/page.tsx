import { getAuthPageUrl } from "@/lib/auth-redirect";

type ConfirmationErrorPageProps = {
  searchParams: Promise<{ next?: string; reason?: string }>;
};

export default async function ConfirmationErrorPage({ searchParams }: ConfirmationErrorPageProps) {
  const { next, reason } = await searchParams;
  const message = reason === "configuration"
    ? "Account confirmation is unavailable because Supabase is not configured for this app. Contact the site administrator, then request a new confirmation email."
    : reason === "service"
      ? "We couldn’t complete account confirmation. Sign in if your account is already confirmed; otherwise request a new confirmation email. Contact the site administrator if the problem continues."
      : "The confirmation link may have expired. Create your account again or sign in if it is already confirmed.";

  return (
    <main className="auth-card">
      <h1>We couldn’t confirm your account.</h1>
      <p className="page-subtitle">{message}</p>
      <p className="page-subtitle">
        <a href={getAuthPageUrl("register", next ?? null)}>Create an account</a>
        {" · "}
        <a href={getAuthPageUrl("login", next ?? null)}>Sign in</a>
      </p>
    </main>
  );
}
