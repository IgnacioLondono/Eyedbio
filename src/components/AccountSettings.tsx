"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Shield, Mail, AtSign, KeyRound, CalendarDays, ArrowRight, Lock } from "lucide-react";
import { USERNAME_CHANGE_COOLDOWN_DAYS } from "@/lib/validation";
import PasswordInput from "@/components/PasswordInput";
import { useI18n } from "@/components/LocaleProvider";
import { APP_LOCALES, LOCALE_LABELS } from "@/lib/i18n/types";
import type { AppLocale } from "@/lib/i18n/types";

interface AccountData {
  email: string;
  username: string;
  createdAt: string;
  locale: "es" | "en";
  canChangeUsername: boolean;
  nextUsernameChangeAt: string | null;
  accessCodeEnabled: boolean;
  hasAccessCode: boolean;
}

interface Props {
  profileUsername: string;
  onUsernameUpdated: (username: string) => void;
}

export default function AccountSettings({ profileUsername, onUsernameUpdated }: Props) {
  const { locale, setLocale, t } = useI18n();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessCodeEnabled, setAccessCodeEnabled] = useState(false);
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    fetch("/api/account")
      .then((res) => {
        if (!res.ok) throw new Error("Error");
        return res.json();
      })
      .then((data: AccountData) => {
        setAccount(data);
        setEmail(data.email);
        setUsername(data.username);
        setAccessCodeEnabled(data.accessCodeEnabled);
        if (data.locale) void setLocale(data.locale, false);
      })
      .catch(() => setError("No se pudo cargar la configuración de la cuenta"))
      .finally(() => setLoading(false));
  }, []);

  const usernameWillChange =
    account !== null && username !== account.username && username.length >= 3;

  const accessCodeSettingsChanged =
    account !== null &&
    (accessCodeEnabled !== account.accessCodeEnabled || accessCode.length > 0);

  const submitChanges = async () => {
    if (!account) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload: Record<string, string | boolean> = { currentPassword };

      if (email !== account.email) payload.email = email;
      if (username !== account.username) payload.username = username;
      if (newPassword) {
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }
      if (accessCodeSettingsChanged) {
        payload.accessCodeEnabled = accessCodeEnabled;
        if (accessCode) payload.accessCode = accessCode;
      }

      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }

      setAccount(data);
      setEmail(data.email);
      setUsername(data.username);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAccessCode("");
      setAccessCodeEnabled(data.accessCodeEnabled);
      setSuccess(data.message ?? "Cuenta actualizada");
      setShowUsernameConfirm(false);

      if (data.username !== profileUsername) {
        onUsernameUpdated(data.username);
      }

      if (data.email !== account.email || newPassword) {
        await signIn("credentials", {
          email: data.email,
          password: newPassword || currentPassword,
          intent: "refresh",
          redirect: false,
        });
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (usernameWillChange) {
      setShowUsernameConfirm(true);
      return;
    }

    void submitChanges();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const memberSince = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const usernameLocked =
    account !== null &&
    !account.canChangeUsername &&
    username === account.username;

  const nextUsernameChangeLabel = account?.nextUsernameChangeAt
    ? new Date(account.nextUsernameChangeAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const previousUsername = account?.username ?? "";

  const handleLocaleChange = async (next: AppLocale) => {
    await setLocale(next);
    setSuccess(t("account.languageSaved"));
    setTimeout(() => setSuccess(""), 2500);
  };

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6 max-w-lg">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
          <div>
            <label htmlFor="account-locale" className="block text-sm text-white/60 mb-2">
              {t("account.language")}
            </label>
            <select
              id="account-locale"
              value={locale}
              onChange={(e) => void handleLocaleChange(e.target.value as AppLocale)}
              className="input-field"
            >
              {APP_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {LOCALE_LABELS[code]}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-white/35 mt-1.5">{t("account.languageHint")}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Datos de la cuenta</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Cambia tu email, usuario público o contraseña. Necesitas tu contraseña actual.
              </p>
            </div>
          </div>

          {memberSince && (
            <div className="flex items-center gap-2 text-xs text-white/35 mb-5 pb-4 border-b border-white/5">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              {t("account.memberSince")} {memberSince}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field input-field--left-icon"
                  required
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70 pointer-events-none z-[1]"
                  aria-hidden
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Nombre de usuario</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 text-xs font-mono pointer-events-none z-[1]">
                  eyed.bio/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))
                  }
                  className="input-field input-field--username font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  minLength={3}
                  disabled={usernameLocked}
                />
                <AtSign
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70 pointer-events-none z-[1]"
                  aria-hidden
                />
              </div>
              <p className="text-[11px] text-white/30 mt-1.5">
                Solo letras y números (a–z, 0–9). Mínimo 3 caracteres. Puedes cambiarlo cada{" "}
                {USERNAME_CHANGE_COOLDOWN_DAYS} días.
              </p>
              {usernameLocked && nextUsernameChangeLabel && (
                <p className="text-[11px] text-amber-300/90 mt-1.5">
                  Podrás cambiar tu usuario de nuevo el {nextUsernameChangeLabel}.
                </p>
              )}
            </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Código de acceso al perfil</h3>
            <p className="text-xs text-white/40 mt-0.5">
              Quien visite tu perfil público deberá introducir este código para verlo.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-sm text-white/70">Activar código de acceso</span>
          <button
            type="button"
            role="switch"
            aria-checked={accessCodeEnabled}
            onClick={() => setAccessCodeEnabled((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              accessCodeEnabled ? "bg-purple-600" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                accessCodeEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {accessCodeEnabled && (
          <div>
            <label className="block text-sm text-white/60 mb-2">
              {account?.hasAccessCode ? "Nuevo código (opcional)" : "Código de acceso"}
            </label>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.replace(/\s/g, ""))}
              placeholder={account?.hasAccessCode ? "Deja vacío para mantener el actual" : "Mínimo 4 caracteres"}
              className="input-field w-full font-mono tracking-wider"
              autoComplete="new-password"
              minLength={account?.hasAccessCode ? undefined : 4}
              maxLength={32}
              required={accessCodeEnabled && !account?.hasAccessCode}
            />
            <p className="text-[11px] text-white/30 mt-1.5">
              Solo letras y números (4–32 caracteres). Compártelo solo con quien quieras que vea tu perfil.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Seguridad</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Confirma con tu contraseña actual. Deja en blanco si no quieres cambiarla.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Contraseña actual</label>
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
              variant="dashboard"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Nueva contraseña (opcional)</label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              variant="dashboard"
            />
          </div>

          {newPassword && (
            <div>
              <label className="block text-sm text-white/60 mb-2">Confirmar nueva contraseña</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                minLength={8}
                variant="dashboard"
              />
            </div>
          )}
        </div>

        {error && !showUsernameConfirm && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-semibold transition-colors"
        >
          {saving ? "Guardando cuenta..." : "Guardar cambios de cuenta"}
        </button>
      </form>

      {showUsernameConfirm && account && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="username-confirm-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && setShowUsernameConfirm(false)}
            aria-label="Cerrar"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
            <h2 id="username-confirm-title" className="text-lg font-semibold text-white">
              ¿Cambiar nombre de usuario?
            </h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              Tu enlace público cambiará. Quien use el anterior ya no llegará a tu perfil.
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-white/35">Actual</p>
                <p className="text-sm font-mono text-white/60 truncate">
                  eyed.bio/{previousUsername}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1 text-right">
                <p className="text-[10px] uppercase tracking-wider text-purple-300/80">Nuevo</p>
                <p className="text-sm font-mono text-purple-200 truncate">eyed.bio/{username}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-300/90 leading-relaxed">
              Solo podrás volver a cambiarlo dentro de {USERNAME_CHANGE_COOLDOWN_DAYS} días.
            </p>

            {error && (
              <p className="mt-3 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowUsernameConfirm(false)}
                className="px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void submitChanges()}
                className="px-4 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? "Guardando..." : "Sí, cambiar usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
