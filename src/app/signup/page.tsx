"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
} from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import OAuthButtons from "@/components/OAuthButtons";
import { useI18n } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/i18n";
import { APP_LOCALES, LOCALE_LABELS } from "@/lib/i18n/types";
import type { AppLocale } from "@/lib/i18n/types";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, setLocale } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(searchParams.get("username") ?? "");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const m = getMessages(locale).signup;
  const footer = getMessages(locale).signup;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(m.passwordMismatch);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, displayName, locale }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? m.connectionError);
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        intent: "signup",
        redirect: false,
      });

      if (result?.error) {
        setError(m.signInFailed);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(m.connectionError);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={m.title}
      subtitle={m.subtitle}
      footer={
        <AuthFooterLink text={footer.hasAccount} linkText={footer.login} href="/login" />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <OAuthButtons callbackUrl="/dashboard" />

        <div>
          <label htmlFor="locale" className="auth-label">
            {m.language}
          </label>
          <select
            id="locale"
            value={locale}
            onChange={(e) => void setLocale(e.target.value as AppLocale)}
            className="auth-input"
          >
            {APP_LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_LABELS[code]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email" className="auth-label">
            {m.email}
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
          <label htmlFor="password" className="auth-label">
            {m.password}
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder={locale === "en" ? "At least 8 characters" : "Mínimo 8 caracteres"}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="auth-label">
            {m.confirmPassword}
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={m.passwordRepeat}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="username" className="auth-label">
            {m.username}
          </label>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
            <span className="px-3 text-white/30 text-sm font-mono whitespace-nowrap">
              eyed.bio/
            </span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))
              }
              placeholder="tunombre"
              className="flex-1 bg-transparent py-3 pr-3 text-white placeholder-white/20 outline-none font-mono text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="displayName" className="auth-label">
            {m.displayName}
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={locale === "en" ? "Your name" : "Tu nombre"}
            className="auth-input"
          />
        </div>

        <AuthError message={error} />

        <AuthSubmitButton
          loading={loading}
          loadingText={locale === "en" ? "Creating..." : "Creando..."}
        >
          <>
            {m.submit}
            <ArrowRight className="w-4 h-4" />
          </>
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
