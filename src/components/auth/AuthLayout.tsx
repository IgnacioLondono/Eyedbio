import Link from "next/link";
import Logo from "@/components/layout/Logo";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-purple-600/12 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-violet-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Logo href="/" className="justify-center mb-8" />

        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
            <p className="text-white/45 text-sm leading-relaxed">{subtitle}</p>
          </div>

          {children}
        </div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="text-center text-white/35 text-sm">
      {text}{" "}
      <Link href={href} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
        {linkText}
      </Link>
    </p>
  );
}

export function AuthSubmitButton({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
    >
      {loading ? loadingText : children}
    </button>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-red-300 text-sm">
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-300 text-sm">
      {message}
    </div>
  );
}
