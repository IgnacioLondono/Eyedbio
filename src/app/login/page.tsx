"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import AuthLayout, {
  AuthError,
  AuthFooterLink,
  AuthSubmitButton,
  AuthSuccess,
} from "@/components/AuthLayout";
import PasswordInput from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
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
        setError(data.error ?? "Email o contraseña incorrectos");
        return;
      }

      setInfo(
        data.message ??
          "Código enviado. Revisa tu bandeja de entrada y la carpeta de spam."
      );
      setStep("code");
      setCode("");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
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
      setError("Código incorrecto o expirado. Solicita uno nuevo.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  if (step === "code") {
    return (
      <AuthLayout
        title="Código de acceso"
        subtitle={`Introduce el código de 6 dígitos enviado a ${email}. Revisa también spam.`}
        footer={
          <AuthFooterLink text="¿No tienes cuenta?" linkText="Regístrate gratis" href="/signup" />
        }
      >
        <form onSubmit={verifyCode} className="space-y-5">
          <div>
            <label htmlFor="code" className="auth-label">
              Código de acceso
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

          <AuthError message={error} />
          <AuthSuccess message={info} />

          <AuthSubmitButton loading={loading} loadingText="Verificando...">
            <>
              <ShieldCheck className="w-4 h-4" />
              Entrar
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
                  setError(data.error ?? "No se pudo reenviar el código");
                  return;
                }
                setInfo("Nuevo código enviado. Revisa también spam.");
              } catch {
                setError("Error de conexión");
              } finally {
                setLoading(false);
              }
            }}
            className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            Reenviar código
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
            ← Volver a email y contraseña
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión con tu email y contraseña. Te enviaremos un código de acceso por correo."
      footer={
        <AuthFooterLink text="¿No tienes cuenta?" linkText="Regístrate gratis" href="/signup" />
      }
    >
      <form onSubmit={requestCode} className="space-y-5">
        {resetSuccess && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-300 text-sm">
            Contraseña actualizada. Ya puedes iniciar sesión.
          </div>
        )}

        <div>
          <label htmlFor="email" className="auth-label">
            Email
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
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              ¿Olvidaste tu contraseña?
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

        <AuthSubmitButton loading={loading} loadingText="Enviando código...">
          <>
            Enviar código de acceso
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
