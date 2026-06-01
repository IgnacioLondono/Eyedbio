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
    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 pointer-events-auto">
      {toolbar}
    </div>
  );
}
