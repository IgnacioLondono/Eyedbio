"use client";

import { createContext, useContext, type ReactNode } from "react";

const ToolbarContext = createContext<ReactNode>(null);

export function ProfileCardToolbarProvider({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  return <ToolbarContext.Provider value={toolbar}>{children}</ToolbarContext.Provider>;
}

export function CardToolbarSlot() {
  const toolbar = useContext(ToolbarContext);
  if (!toolbar) return null;

  return (
    <>
      <div className="absolute bottom-3 right-3 z-20 flex items-center justify-end gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1 rounded-2xl border border-white/12 bg-black/45 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {toolbar}
        </div>
      </div>
      <div className="h-11 w-full shrink-0 pointer-events-none" aria-hidden />
    </>
  );
}
