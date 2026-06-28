import Link from "next/link";
import Logo from "@/components/layout/Logo";
import SupportCenter from "@/components/support/SupportCenter";
import SupportBackLink from "@/components/support/SupportBackLink";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Logo href="/dashboard" size="sm" responsiveText />
          <SupportBackLink />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <SupportCenter />
      </main>
    </div>
  );
}
