import Link from "next/link";
import { Eye } from "lucide-react";

type LogoProps = {
  size?: "sm" | "md";
  href?: string | null;
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: { box: "w-7 h-7", icon: "w-3.5 h-3.5", text: "text-sm" },
  md: { box: "w-8 h-8", icon: "w-4 h-4", text: "text-lg" },
};

export default function Logo({
  size = "md",
  href = "/",
  showText = true,
  className = "",
}: LogoProps) {
  const s = sizes[size];
  const inner = (
    <>
      <div
        className={`${s.box} rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0`}
      >
        <Eye className={`${s.icon} text-white`} aria-hidden />
      </div>
      {showText && (
        <span className={`font-bold text-white ${s.text}`}>
          Eyed<span className="text-purple-400">.bio</span>
        </span>
      )}
    </>
  );

  const classes = `flex items-center gap-2 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
