"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
  AuthSuccess,
} from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";

function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el código");
        return;
      }

      setSuccess(data.message);
      setStep("code");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
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
        setError(data.error ?? "No se pudo restablecer la contraseña");
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "code") {
    return (
      <AuthLayout
        title="Introduce el código"
        subtitle={`Hemos enviado un código de 6 dígitos a ${email}. Revisa también spam.`}
        footer={<AuthFooterLink text="¿Recuerdas tu contraseña?" linkText="Volver al login" href="/login" />}
      >
        <form onSubmit={resetPassword} className="space-y-5">
          <div>
            <label htmlFor="code" className="auth-label">
              Código de verificación
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
              placeholder="000000"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="auth-label">
              Nueva contraseña
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="auth-label">
              Confirmar contraseña
            </label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <AuthError message={error} />

          <AuthSubmitButton loading={loading} loadingText="Guardando...">
            <>
              <KeyRound className="w-4 h-4" />
              Restablecer contraseña
            </>
          </AuthSubmitButton>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setPassword("");
              setConfirmPassword("");
              setError("");
              setSuccess("");
            }}
            className="w-full text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Solicitar otro código
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un código de verificación de 6 dígitos a tu email."
      footer={<AuthFooterLink text="¿Recuerdas tu contraseña?" linkText="Volver al login" href="/login" />}
    >
      <form onSubmit={requestCode} className="space-y-5">
        <div>
          <label htmlFor="email" className="auth-label">
            Email de tu cuenta
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input pl-10"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70 pointer-events-none z-[1]"
              aria-hidden
            />
          </div>
        </div>

        <AuthError message={error} />
        <AuthSuccess message={success} />

        <AuthSubmitButton loading={loading} loadingText="Enviando...">
          <>
            <ShieldCheck className="w-4 h-4" />
            Enviar código de verificación
          </>
        </AuthSubmitButton>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
