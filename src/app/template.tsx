/**
 * Se remonta en cada cambio de ruta (a diferencia del layout).
 * Evita que el estado o capas fijas de una página sigan visibles en la siguiente.
 */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return children;
}
