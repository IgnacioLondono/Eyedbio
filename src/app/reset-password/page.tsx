"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
} from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";
import { useI18n } from "@/components/LocaleProvider";

function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.resetFailed"));
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError(t("auth.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitleWithCode")}
      footer={
        <AuthFooterLink
          text={t("auth.noCode")}
          linkText={t("auth.requestCode")}
          href="/forgot-password"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <label htmlFor="code" className="auth-label">
            {t("auth.verificationCode")}
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

        <div>
          <label htmlFor="password" className="auth-label">
            {t("auth.newPassword")}
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder={t("account.passwordMin")}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="auth-label">
            {t("auth.confirmNewPassword")}
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={t("auth.passwordRepeat")}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <AuthError message={error} />

        <AuthSubmitButton loading={loading} loadingText={t("auth.resetSaving")}>
          <>
            <KeyRound className="w-4 h-4" />
            {t("auth.resetPassword")}
          </>
        </AuthSubmitButton>

        <Link
          href="/forgot-password"
          className="block text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t("auth.requestAnotherCode")}
        </Link>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
