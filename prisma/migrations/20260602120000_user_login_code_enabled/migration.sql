-- Código por correo al iniciar sesión (opcional por cuenta)
ALTER TABLE "User" ADD COLUMN "loginCodeEnabled" BOOLEAN NOT NULL DEFAULT false;
