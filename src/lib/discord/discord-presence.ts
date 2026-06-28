import { fetchEyedBotPresence, isEyedBotPresenceConfigured } from "@/lib/discord/eyedbot-presence";
import { fetchLanyardPresence, type LanyardPresence } from "@/lib/discord/lanyard";

/**
 * Obtiene presencia de Discord: EyedBot si está configurado;
 * Lanyard solo como respaldo explícito (LANYARD_FALLBACK=on) o si EyedBot no está configurado.
 */
export async function fetchDiscordPresence(userId: string): Promise<LanyardPresence | null> {
  if (isEyedBotPresenceConfigured()) {
    const eyedbot = await fetchEyedBotPresence(userId);
    if (eyedbot) return eyedbot;

    if (process.env.LANYARD_FALLBACK === "on") {
      return fetchLanyardPresence(userId);
    }

    return null;
  }

  return fetchLanyardPresence(userId);
}
