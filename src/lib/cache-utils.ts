import { revalidateTag } from "next/cache";

/** Evita tumbar la petición si revalidateTag falla en este contexto. */
export function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag, "max");
  } catch (err) {
    console.warn("[cache] revalidateTag failed:", tag, err);
  }
}
