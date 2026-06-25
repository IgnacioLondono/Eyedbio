import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function AdminPageHeader({ title, description, icon, actions }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <div className="p-2.5 rounded-xl bg-red-500/12 border border-red-500/20 text-red-300 shrink-0">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-white/45 text-sm mt-1 leading-relaxed max-w-2xl">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
