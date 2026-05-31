"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Shield, Mail, AtSign, KeyRound, CalendarDays } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

interface AccountData {
  email: string;
  username: string;
  createdAt: string;
}

interface Props {
  profileUsername: string;
  onUsernameUpdated: (username: string) => void;
}

export default function AccountSettings({ profileUsername, onUsernameUpdated }: Props) {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      })
      .catch(() => setError("No se pudo cargar la configuración de la cuenta"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload: Record<string, string> = { currentPassword };

      if (email !== account?.email) payload.email = email;
      if (username !== account?.username) payload.username = username;
      if (newPassword) {
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
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
      setSuccess(data.message ?? "Cuenta actualizada");

      if (data.username !== profileUsername) {
        onUsernameUpdated(data.username);
      }

      if (data.email !== account?.email || newPassword) {
        await signIn("credentials", {
          email: data.email,
          password: newPassword || currentPassword,
          redirect: false,
        });
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
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

  return (
    <form onSubmit={handleSave} className="space-y-6">
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
            <CalendarDays className="w-3.5 h-3.5" />
            Miembro desde {memberSince}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Nombre de usuario</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
              <span className="pl-3 pr-1 text-white/30 text-sm font-mono whitespace-nowrap">
                eyed.bio/
              </span>
              <AtSign className="w-4 h-4 text-white/25 shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                }
                className="flex-1 bg-transparent py-3 pr-3 pl-1 text-white outline-none font-mono text-sm"
                required
                minLength={3}
              />
            </div>
            <p className="text-[11px] text-white/30 mt-1.5">
              Solo letras minúsculas, números, guiones y guiones bajos.
            </p>
          </div>
        </div>
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
            />
          </div>
        )}
      </div>

      {error && (
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
  );
}
