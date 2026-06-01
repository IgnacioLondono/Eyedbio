import { Prisma } from "@/generated/prisma/client";

/** Tabla/columna inexistente (migración pendiente o desplegue incompleto). */
export function isPrismaSchemaMismatch(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2021" || err.code === "P2022")
  );
}
