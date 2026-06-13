"use client";

interface Props {
  text: string;
  onEnter: () => void;
}

export default function ProfileEntryGate({ text, onEnter }: Props) {
  return (
    <button
      type="button"
      aria-label={text}
      className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center border-0 bg-black/45 backdrop-blur-xl transition-opacity duration-300"
      onPointerDown={(event) => {
        event.preventDefault();
        onEnter();
      }}
    >
      <span className="pointer-events-none select-none text-base font-light lowercase tracking-[0.18em] text-white/90 animate-pulse sm:text-lg">
        {text}
      </span>
    </button>
  );
}
