"use client";

import { Suspense, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { isAdminRole } from "@/lib/roles";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
  AuthSuccess,
} from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import OAuthButtons from "@/components/OAuthButtons";
import { useI18n } from "@/components/LocaleProvider";

function LoginForm() {
  const { t, tVars } = useI18n();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const resetSuccess = searchParams.get("reset") === "success";
  const blockedNotice = searchParams.get("error") === "blocked";
  const oauthError = searchParams.get("error");
  const oauthErrorMessage =
    oauthError && oauthError !== "blocked" && oauthError !== "CredentialsSignin"
      ? t("auth.oauthError")
      : "";

  const redirectAfterLogin = async () => {
    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    const session = sessionRes.ok ? await sessionRes.json() : await getSession();

    const destination =
      session?.user && isAdminRole(session.user.role)
        ? callbackUrl.startsWith("/admin")
          ? callbackUrl
          : "/admin"
        : callbackUrl;

    window.location.href = destination;
  };

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.wrongCredentials"));
        return;
      }

      if (data.requiresCode === false) {
        setLoading(true);
        const result = await signIn("credentials", {
          email,
          password,
          intent: "login",
          redirect: false,
        });
        setLoading(false);

        if (result?.error) {
          setError(t("auth.wrongCredentials"));
          return;
        }

        await redirectAfterLogin();
        return;
      }

      setInfo(data.emailSent === false ? t("auth.codeSentFallback") : t("auth.codeSentSuccess"));
      setStep("code");
      setCode("");
    } catch {
      setError(t("auth.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      code,
      intent: "login",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("auth.wrongCode"));
      return;
    }

    await redirectAfterLogin();
  };

  if (step === "code") {
    return (
      <AuthLayout
        title={t("auth.codeTitle")}
        subtitle={tVars("auth.codeSubtitle", { email })}
        footer={
          <AuthFooterLink text={t("auth.noAccount")} linkText={t("auth.signupLink")} href="/signup" />
        }
      >
        <form onSubmit={verifyCode} className="space-y-5">
          <div>
            <label htmlFor="code" className="auth-label">
              {t("auth.codeLabel")}
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="auth-input text-center text-2xl font-mono tracking-[0.4em]"
              placeholder={t("auth.codePlaceholder")}
              required
            />
          </div>

          <AuthError message={error} />
          <AuthSuccess message={info} />

          <AuthSubmitButton loading={loading} loadingText={t("auth.verifying")}>
            <>
              <ShieldCheck className="w-4 h-4" />
              {t("auth.verify")}
            </>
          </AuthSubmitButton>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                const res = await fetch("/api/auth/login/start", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) {
                  setError(data.error ?? t("auth.resendFailed"));
                  return;
                }
                setInfo(t("auth.resendSuccess"));
              } catch {
                setError(t("auth.connectionError"));
              } finally {
                setLoading(false);
              }
            }}
            className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            {t("auth.resendCode")}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setCode("");
              setError("");
              setInfo("");
            }}
            className="w-full text-sm text-white/40 hover:text-white transition-colors"
          >
            {t("auth.backToCredentials")}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <AuthFooterLink text={t("auth.noAccount")} linkText={t("auth.signupLink")} href="/signup" />
      }
    >
      <form onSubmit={requestCode} className="space-y-5">
        <OAuthButtons callbackUrl={callbackUrl} />

        {resetSuccess && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-300 text-sm">
            {t("auth.resetSuccess")}
          </div>
        )}

        {blockedNotice && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-200 text-sm">
            {t("auth.blockedNotice")}
          </div>
        )}

        {oauthErrorMessage && <AuthError message={oauthErrorMessage} />}

        <div>
          <label htmlFor="email" className="auth-label">
            {t("common.email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="auth-label mb-0">
              {t("common.password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />
        </div>

        <AuthError message={error} />

        <AuthSubmitButton loading={loading} loadingText={t("auth.signingIn")}>
          <>
            {t("auth.signIn")}
            <ArrowRight className="w-4 h-4" />
          </>
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
