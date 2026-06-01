export const es = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando…",
    error: "Error",
    share: "Compartir",
  },
  signup: {
    title: "Crea tu perfil",
    subtitle: "Regístrate gratis y personaliza tu página en minutos.",
    language: "Idioma",
    email: "Email",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    username: "Nombre de usuario",
    displayName: "Nombre para mostrar",
    submit: "Crear cuenta",
    hasAccount: "¿Ya tienes cuenta?",
    login: "Inicia sesión",
    passwordMismatch: "Las contraseñas no coinciden",
    connectionError: "Error de conexión",
  },
  account: {
    language: "Idioma",
    languageHint: "Afecta al panel y textos de tu perfil público.",
    languageSaved: "Idioma actualizado",
    memberSince: "Miembro desde",
  },
  profile: {
    visits: "visitas",
    noLinks: "Sin enlaces aún",
    notFound: "Perfil no encontrado",
    welcomeBio: "¡Bienvenidos a mi sitio web!",
  },
  dashboard: {
    tabs: {
      general: "General",
      links: "Enlaces",
      media: "Media",
      appearance: "Estilo",
      account: "Cuenta",
    },
    preview: "Vista previa",
    save: "Guardar cambios",
    saved: "Guardado",
    backgroundEffect: "Efecto de fondo",
    effectCategory: "Categoría",
  },
  badges: {
    owner: "Owner",
    verified: "Verificado",
    premium: "Premium",
    og: "OG",
  },
  admin: {
    verify: "Verificar",
    unverify: "Quitar verificado",
    setOwner: "Corona owner",
    removeOwner: "Quitar owner",
    badges: "Insignias",
  },
} as const satisfies Messages;

export interface Messages {
  common: {
    save: string;
    cancel: string;
    loading: string;
    error: string;
    share: string;
  };
  signup: {
    title: string;
    subtitle: string;
    language: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    displayName: string;
    submit: string;
    hasAccount: string;
    login: string;
    passwordMismatch: string;
    connectionError: string;
  };
  account: {
    language: string;
    languageHint: string;
    languageSaved: string;
    memberSince: string;
  };
  profile: {
    visits: string;
    noLinks: string;
    notFound: string;
    welcomeBio: string;
  };
  dashboard: {
    tabs: {
      general: string;
      links: string;
      media: string;
      appearance: string;
      account: string;
    };
    preview: string;
    save: string;
    saved: string;
    backgroundEffect: string;
    effectCategory: string;
  };
  badges: {
    owner: string;
    verified: string;
    premium: string;
    og: string;
  };
  admin: {
    verify: string;
    unverify: string;
    setOwner: string;
    removeOwner: string;
    badges: string;
  };
}
