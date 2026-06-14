export interface Messages {
  common: {
    save: string;
    cancel: string;
    loading: string;
    error: string;
    share: string;
    close: string;
    retry: string;
    email: string;
    password: string;
    bio: string;
    showPassword: string;
    hidePassword: string;
  };
  nav: {
    features: string;
    faq: string;
    login: string;
    signup: string;
    myProfile: string;
    dashboard: string;
    editProfile: string;
    discover: string;
    appAreas: string;
    menu: string;
  };
  landing: {
    heroBadge: string;
    heroTitle: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    goDashboard: string;
    signupFree: string;
    claim: string;
    usernamePlaceholder: string;
    statsProfileViews: string;
    statsUsers: string;
    statsUploads: string;
    statsLinks: string;
    featuresTitle: string;
    featuresTitleHighlight: string;
    featuresSubtitle: string;
    faqTitle: string;
    ctaTitle: string;
    ctaJoin: string;
    ctaFirst: string;
    ctaButtonLoggedIn: string;
    ctaButtonGuest: string;
    showcaseBadge: string;
    showcaseTitle: string;
    showcaseTitleHighlight: string;
    showcaseSubtitle: string;
    showcaseBullet1: string;
    showcaseBullet2: string;
    showcaseBullet3: string;
    showcaseViewLabel: string;
    showcaseTabsLabel: string;
    profilesTitle: string;
    profilesTitleHighlight: string;
    profilesSubtitle: string;
    profilesTabTop: string;
    profilesTabRecent: string;
    profilesTabAll: string;
    profilesCount: string;
    profilesViewsLabel: string;
    profilesEmpty: string;
    exploreProfilesCta: string;
    exploreProfilesButton: string;
    profilesTabTopHint: string;
    profilesTabRecentHint: string;
    profilesTabAllHint: string;
    profilesSearchPlaceholder: string;
    profilesLoadMore: string;
    profilesShowingCount: string;
    profilesNoResults: string;
    profilesTopRank: string;
    features: readonly { title: string; desc: string }[];
    faqs: readonly { q: string; a: string }[];
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
    signInFailed: string;
    passwordRepeat: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    codeTitle: string;
    codeSubtitle: string;
    codeLabel: string;
    codePlaceholder: string;
    verify: string;
    verifying: string;
    resendCode: string;
    resendFailed: string;
    resendSuccess: string;
    backToCredentials: string;
    sendCode: string;
    sendingCode: string;
    signIn: string;
    signingIn: string;
    forgotPassword: string;
    noAccount: string;
    signupLink: string;
    wrongCredentials: string;
    wrongCode: string;
    connectionError: string;
    resetSuccess: string;
    blockedNotice: string;
    forgotTitle: string;
    forgotSubtitle: string;
    forgotSubmit: string;
    forgotSending: string;
    forgotBack: string;
    resetTitle: string;
    resetSubtitle: string;
    resetSubmit: string;
    resetSaving: string;
    newPassword: string;
    confirmNewPassword: string;
    forgotCodeTitle: string;
    forgotCodeSubtitle: string;
    verificationCode: string;
    resetPassword: string;
    requestAnotherCode: string;
    forgotEmailLabel: string;
    sendVerificationCode: string;
    rememberPassword: string;
    backToLogin: string;
    resetFailed: string;
    passwordRepeat: string;
    codeSentSuccess: string;
    codeSentFallback: string;
    sendCodeFailed: string;
    noCode: string;
    requestCode: string;
    resetSubtitleWithCode: string;
  };
  account: {
    language: string;
    languageHint: string;
    languageSaved: string;
    memberSince: string;
    accountDataTitle: string;
    accountDataHint: string;
    username: string;
    usernameHint: string;
    usernameLocked: string;
    accessCodeTitle: string;
    accessCodeHint: string;
    accessCodeEnable: string;
    accessCodeNew: string;
    accessCodeSet: string;
    accessCodeKeep: string;
    accessCodePlaceholder: string;
    accessCodeRules: string;
    loginCodeTitle: string;
    loginCodeHint: string;
    loginCodeEnable: string;
    securityTitle: string;
    securityHint: string;
    currentPassword: string;
    newPasswordOptional: string;
    confirmNewPassword: string;
    passwordMin: string;
    saveAccount: string;
    savingAccount: string;
    loadError: string;
    saveError: string;
    updated: string;
    usernameConfirmTitle: string;
    usernameConfirmBody: string;
    usernameCurrent: string;
    usernameNew: string;
    usernameCooldown: string;
    usernameConfirmYes: string;
    publicUid: string;
    publicUidHint: string;
  };
  profile: {
    visits: string;
    noLinks: string;
    copyUsernameHint: string;
    usernameCopied: string;
    notFound: string;
    notFoundTitle: string;
    notFoundHint: string;
    createProfile: string;
    welcomeBio: string;
    loadError: string;
    connectionError: string;
    pageTitleNotFound: string;
    tapForSound: string;
    discordLanyardHint: string;
  };
  accessGate: {
    protected: string;
    hint: string;
    codePlaceholder: string;
    codeLabel: string;
    wrongCode: string;
    connectionError: string;
    submit: string;
    verifying: string;
  };
  claimCta: {
    title: string;
    subtitle: string;
    signup: string;
    login: string;
  };
  quickNav: {
    dashboard: string;
    home: string;
  };
  share: {
    shareProfile: string;
    share: string;
    copyLink: string;
    linkCopied: string;
    title: string;
    close: string;
    stories: string;
    storiesHint: string;
    link: string;
    copied: string;
    storyHint: string;
    storyHelp: string;
    chatsHelp: string;
    storyHelpBody: string;
    chatsHelpBody: string;
    moreOptions: string;
    shareText: string;
  };
  dashboard: {
    tabs: {
      general: string;
      links: string;
      media: string;
      appearance: string;
      account: string;
    };
    viewProfile: string;
    save: string;
    saving: string;
    saved: string;
    signOut: string;
    preview: string;
    sessionExpired: string;
    goLogin: string;
    loadError: string;
    saveError: string;
    conflictError: string;
    unsavedTitle: string;
    unsavedBody: string;
    keepEditing: string;
    viewWithoutSave: string;
    saveAndView: string;
    shareTitle: string;
    shareHint: string;
    displayName: string;
    bioPlaceholder: string;
    avatarLabel: string;
    avatarHint: string;
    backgroundTitle: string;
    backgroundHint: string;
    backgroundHintSave: string;
    bannerTitle: string;
    bannerHint: string;
    bannerFileHint: string;
    audioLabel: string;
    audioHint: string;
    audioSource: string;
    audioSourceUpload: string;
    audioSourceUploadHint: string;
    audioSourceBackground: string;
    audioSourceBackgroundHint: string;
    audioSourceBackgroundDisabled: string;
    audioSourceBackgroundActive: string;
    audioClipTitle: string;
    audioClipDurationLabel: string;
    audioClipFull: string;
    audioClipFullHint: string;
    audioClipDurationHint: string;
    audioClipPositionHint: string;
    audioClipSelected: string;
    audioClipShortTrack: string;
    audioClipPreview: string;
    audioClipStop: string;
    playAudio: string;
    backgroundEffect: string;
    effectCategory: string;
    opacityLabel: string;
    opacityDisabled: string;
    blurLabel: string;
    structureLinks: string;
    cardSection: string;
    colorsSection: string;
    transparentCard: string;
    showBorder: string;
    showShadow: string;
    borderOpacity: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    accentColor: string;
    nameEffect: string;
    glowIcons: string;
    gradientCard: string;
    monochromeIcons: string;
    entrySectionTitle: string;
    entrySectionHint: string;
    entryGateEnabled: string;
    entryGateText: string;
    entryGateTextPlaceholder: string;
    browserTabTitle: string;
    browserTabTitlePlaceholder: string;
    browserTabTitleHint: string;
    browserTabSectionTitle: string;
    browserTabSectionHint: string;
    browserTabIconLabel: string;
    browserTabIconHint: string;
    profileNameSectionTitle: string;
    profileNameSectionHint: string;
    nameAnimation: string;
    profileNameIconLabel: string;
    profileNameIconHint: string;
    visibilitySectionTitle: string;
    showViewCount: string;
    showShareButton: string;
    discordSectionTitle: string;
    discordSectionHint: string;
    showLocation: string;
    locationLabel: string;
    locationPlaceholder: string;
    discordPresenceEnabled: string;
    discordUserIdLabel: string;
    discordUserIdPlaceholder: string;
    discordUserIdHint: string;
    discordLanyardLink: string;
    previewSimulateEntry: string;
  };
  linkEditor: {
    platformCount: string;
    customCount: string;
    totalCount: string;
    draftHint: string;
    platformLimitReached: string;
    limitReached: string;
    customLimitReached: string;
    empty: string;
    visibleName: string;
    remove: string;
    linkFor: string;
    usernameFor: string;
    usernameHint: string;
    uploadIcon: string;
    changeIcon: string;
    customTitle: string;
    customHint: string;
    uploadError: string;
  };
  fileUpload: {
    upload: string;
    uploading: string;
    remove: string;
    uploadError: string;
    fileTooLarge: string;
    fileTypeNotAllowed: string;
    image: string;
    gif: string;
    video: string;
    avatarAlt: string;
    bannerAlt: string;
    backgroundAlt: string;
    audioUploaded: string;
    removeAudio: string;
    removeFile: string;
    changeFile: string;
    uploadBanner: string;
    uploadBackground: string;
    uploadingPercent: string;
    dragHint: string;
  };
  imageAdjust: {
    titleAvatar: string;
    titleBanner: string;
    titleBackground: string;
    dragHint: string;
    zoom: string;
    reset: string;
    cancel: string;
    apply: string;
    saving: string;
    close: string;
    adjustExisting: string;
    loadError: string;
    exportError: string;
    focusHint: string;
    zoomOutHint: string;
    applyFocus: string;
  };
  cardPicker: {
    structure: string;
    structureAria: string;
    linkMode: string;
    linkModeAria: string;
    avatar: string;
    avatarAria: string;
  };
  cardLayouts: Record<
    string,
    { label: string; description: string }
  >;
  linkStyles: Record<
    string,
    { label: string; description: string }
  >;
  avatarStyles: Record<string, { label: string }>;
  nameEffects: Record<string, string>;
  nameAnimations: Record<string, string>;
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

export const es: Messages = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando…",
    error: "Error",
    share: "Compartir",
    close: "Cerrar",
    retry: "Reintentar",
    email: "Email",
    password: "Contraseña",
    bio: "Bio",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
  },
  nav: {
    features: "Características",
    faq: "FAQ",
    login: "Iniciar sesión",
    signup: "Registrarse gratis",
    myProfile: "Mi perfil",
    dashboard: "Dashboard",
    editProfile: "Editar perfil",
    discover: "Descubre",
    appAreas: "Secciones de la app",
    menu: "Menú",
  },
  landing: {
    heroBadge: "La plataforma link-in-bio moderna",
    heroTitle: "Todo lo que quieres,",
    heroTitleHighlight: "aquí mismo.",
    heroSubtitle:
      "Eyed.bio es tu plataforma para páginas link-in-bio modernas, personalizables y con efectos visuales increíbles.",
    goDashboard: "Ir al dashboard",
    signupFree: "Registrarse gratis",
    claim: "Reclamar",
    usernamePlaceholder: "tunombre",
    statsProfileViews: "Visitas a perfiles",
    statsUsers: "Usuarios",
    statsUploads: "Archivos subidos",
    statsLinks: "Enlaces creados",
    featuresTitle: "Crea páginas",
    featuresTitleHighlight: "increíbles",
    featuresSubtitle:
      "Personaliza cada detalle de tu perfil con efectos, colores y animaciones que reflejen tu estilo.",
    faqTitle: "Preguntas frecuentes",
    ctaTitle: "Todo lo que quieres, aquí mismo.",
    ctaJoin: "Únete a {count} personas usando Eyed.bio.",
    ctaFirst: "Sé de los primeros en usar Eyed.bio.",
    ctaButtonLoggedIn: "Volver al dashboard",
    ctaButtonGuest: "Crear mi perfil gratis",
    showcaseBadge: "Compositor de estilos",
    showcaseTitle: "Miles de combinaciones,",
    showcaseTitleHighlight: "un solo perfil.",
    showcaseSubtitle:
      "Elige estructura, modo de enlaces y avatar. Cambia colores, efectos y fondo en el panel.",
    showcaseBullet1:
      "7 estructuras — clásica, hero, lateral, banner, minimal, stack y cristal.",
    showcaseBullet2: "4 modos de enlaces — iconos, botones, fila y chips.",
    showcaseBullet3: "Más de {count} combinaciones visuales distintas.",
    showcaseViewLabel: "Vista:",
    showcaseTabsLabel: "Estilos de ejemplo",
    profilesTitle: "Descubre",
    profilesTitleHighlight: "perfiles",
    profilesSubtitle:
      "Explora la comunidad Eyed.bio: los más visitados, los más recientes y todos los perfiles públicos.",
    profilesTabTop: "Top visitas",
    profilesTabRecent: "Recientes",
    profilesTabAll: "Todos",
    profilesCount: "{count} perfiles",
    profilesViewsLabel: "visitas",
    profilesEmpty: "Aún no hay perfiles públicos. ¡Sé el primero!",
    exploreProfilesCta: "Explora perfiles reales de la comunidad Eyed.bio.",
    exploreProfilesButton: "Ver perfiles",
    profilesTabTopHint: "Solo los 3 perfiles con más visitas.",
    profilesTabRecentHint: "Perfiles creados recientemente.",
    profilesTabAllHint: "Todos los perfiles, orden alfabético. Busca por nombre o usuario.",
    profilesSearchPlaceholder: "Buscar por nombre o @usuario…",
    profilesLoadMore: "Cargar más",
    profilesShowingCount: "{shown} de {total} perfiles",
    profilesNoResults: "Ningún perfil coincide con tu búsqueda.",
    profilesTopRank: "Top {rank}",
    features: [
      {
        title: "Todos tus enlaces",
        desc: "Centraliza Discord, Instagram, YouTube y más en una sola página.",
      },
      {
        title: "Compositor de estilos",
        desc: "7 estructuras de tarjeta, 4 modos de enlaces y avatar — miles de combinaciones.",
      },
      {
        title: "Efectos visuales",
        desc: "Nieve, lluvia, estrellas y animaciones para destacar.",
      },
      {
        title: "Analytics",
        desc: "Contador de visitas integrado para medir tu alcance.",
      },
      {
        title: "Sin anuncios",
        desc: "Experiencia limpia, rápida y sin tracking invasivo.",
      },
      {
        title: "Configuración rápida",
        desc: "Crea tu perfil en menos de un minuto y compártelo al instante.",
      },
    ],
    faqs: [
      {
        q: "¿Qué es Eyed.bio?",
        a: "Eyed.bio es una plataforma link-in-bio que te permite compartir todos tus enlaces, redes sociales y proyectos en una página personalizable y estética.",
      },
      {
        q: "¿Es gratis?",
        a: "Sí, Eyed.bio es completamente gratis. Regístrate, personaliza tu perfil y compártelo sin coste alguno.",
      },
      {
        q: "¿Qué puedo hacer con Eyed.bio?",
        a: "Crea una bio page personalizada que enlace todas tus redes, sitios web y proyectos. Sube fondos animados, audio y foto de perfil.",
      },
      {
        q: "¿Por qué usar Eyed.bio?",
        a: "Eyed.bio es rápido, estético y está diseñado para creadores que valoran el diseño. Sin anuncios — solo una experiencia limpia y moderna.",
      },
      {
        q: "¿Cuánto tarda la configuración?",
        a: "Menos de un minuto. Regístrate, añade tus enlaces, personaliza tu página y empieza a compartir al instante.",
      },
    ],
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
    signInFailed: "Cuenta creada, pero falló el inicio de sesión. Prueba en /login",
    passwordRepeat: "Repite tu contraseña",
  },
  auth: {
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión con tu email y contraseña.",
    codeTitle: "Código de acceso",
    codeSubtitle: "Introduce el código de 6 dígitos enviado a {email}. Revisa también spam.",
    codeLabel: "Código de acceso",
    codePlaceholder: "000000",
    verify: "Entrar",
    verifying: "Verificando...",
    resendCode: "Reenviar código",
    resendFailed: "No se pudo reenviar el código",
    resendSuccess: "Nuevo código enviado. Revisa también spam.",
    backToCredentials: "← Volver a email y contraseña",
    sendCode: "Enviar código de acceso",
    sendingCode: "Enviando código...",
    signIn: "Iniciar sesión",
    signingIn: "Iniciando sesión...",
    forgotPassword: "¿Olvidaste tu contraseña?",
    noAccount: "¿No tienes cuenta?",
    signupLink: "Regístrate gratis",
    wrongCredentials: "Email o contraseña incorrectos",
    wrongCode: "Código incorrecto o expirado. Solicita uno nuevo.",
    connectionError: "Error de conexión. Inténtalo de nuevo.",
    resetSuccess: "Contraseña actualizada. Ya puedes iniciar sesión.",
    blockedNotice: "Tu cuenta está bloqueada. Si crees que es un error, contacta con soporte.",
    forgotTitle: "Recuperar contraseña",
    forgotSubtitle: "Te enviaremos un enlace para restablecer tu contraseña.",
    forgotSubmit: "Enviar enlace",
    forgotSending: "Enviando...",
    forgotBack: "Volver al inicio de sesión",
    resetTitle: "Nueva contraseña",
    resetSubtitle: "Elige una contraseña segura para tu cuenta.",
    resetSubmit: "Guardar contraseña",
    resetSaving: "Guardando...",
    newPassword: "Nueva contraseña",
    confirmNewPassword: "Confirmar contraseña",
    forgotCodeTitle: "Introduce el código",
    forgotCodeSubtitle: "Hemos enviado un código de 6 dígitos a {email}. Revisa también spam.",
    verificationCode: "Código de verificación",
    resetPassword: "Restablecer contraseña",
    requestAnotherCode: "← Solicitar otro código",
    forgotEmailLabel: "Email de tu cuenta",
    sendVerificationCode: "Enviar código de verificación",
    rememberPassword: "¿Recuerdas tu contraseña?",
    backToLogin: "Volver al login",
    resetFailed: "No se pudo restablecer la contraseña",
    passwordRepeat: "Repite la contraseña",
    codeSentSuccess:
      "Te enviamos un código de acceso de 6 dígitos. Revisa tu bandeja de entrada y la carpeta de spam.",
    codeSentFallback:
      "Código generado. Revisa tu correo; si no llega, contacta con soporte.",
    sendCodeFailed: "No se pudo enviar el código",
    noCode: "¿No tienes código?",
    requestCode: "Solicitar uno",
    resetSubtitleWithCode: "Introduce el código de 6 dígitos que recibiste y tu nueva contraseña.",
  },
  account: {
    language: "Idioma",
    languageHint: "Afecta al panel y textos de tu perfil público.",
    languageSaved: "Idioma actualizado",
    memberSince: "Miembro desde",
    accountDataTitle: "Datos de la cuenta",
    accountDataHint:
      "Cambia tu email, usuario público o contraseña. Necesitas tu contraseña actual.",
    username: "Nombre de usuario",
    usernameHint:
      "Solo letras y números (a–z, 0–9). Mínimo 3 caracteres. Puedes cambiarlo cada {days} días.",
    usernameLocked: "Podrás cambiar tu usuario de nuevo el {date}.",
    accessCodeTitle: "Código de acceso al perfil",
    accessCodeHint: "Quien visite tu perfil público deberá introducir este código para verlo.",
    accessCodeEnable: "Activar código de acceso",
    accessCodeNew: "Nuevo código (opcional)",
    accessCodeSet: "Código de acceso",
    accessCodeKeep: "Deja vacío para mantener el actual",
    accessCodePlaceholder: "Mínimo 4 caracteres",
    accessCodeRules:
      "Solo letras y números (4–32 caracteres). Compártelo solo con quien quieras que vea tu perfil.",
    loginCodeTitle: "Código por correo al iniciar sesión",
    loginCodeHint:
      "Si lo activas, además de tu contraseña te enviaremos un código de 6 dígitos por email cada vez que entres.",
    loginCodeEnable: "Exigir código por correo al iniciar sesión",
    securityTitle: "Seguridad",
    securityHint:
      "Confirma con tu contraseña actual. Deja en blanco si no quieres cambiarla.",
    currentPassword: "Contraseña actual",
    newPasswordOptional: "Nueva contraseña (opcional)",
    confirmNewPassword: "Confirmar nueva contraseña",
    passwordMin: "Mínimo 8 caracteres",
    saveAccount: "Guardar cambios de cuenta",
    savingAccount: "Guardando cuenta...",
    loadError: "No se pudo cargar la configuración de la cuenta",
    saveError: "Error al guardar",
    updated: "Cuenta actualizada",
    usernameConfirmTitle: "¿Cambiar nombre de usuario?",
    usernameConfirmBody:
      "Tu enlace público cambiará. Quien use el anterior ya no llegará a tu perfil.",
    usernameCurrent: "Actual",
    usernameNew: "Nuevo",
    usernameCooldown: "Solo podrás volver a cambiarlo dentro de {days} días.",
    usernameConfirmYes: "Sí, cambiar usuario",
    publicUid: "Serial (UID)",
    publicUidHint: "Identificador único y permanente de tu cuenta. Solo visible aquí, en ajustes de cuenta.",
  },
  profile: {
    visits: "visitas",
    noLinks: "Sin enlaces aún",
    copyUsernameHint: "Copiar usuario",
    usernameCopied: "Usuario copiado",
    notFound: "Perfil no encontrado",
    notFoundTitle: "Este perfil no existe",
    notFoundHint: "Comprueba el enlace o el nombre de usuario (@{username})",
    createProfile: "Crear mi perfil",
    welcomeBio: "¡Bienvenidos a mi sitio web!",
    loadError: "No se pudo cargar el perfil",
    connectionError: "Error de conexión. Comprueba tu red e inténtalo de nuevo.",
    pageTitleNotFound: "Perfil no encontrado — Eyed.bio",
    tapForSound: "Pulsar para activar el sonido",
    discordLanyardHint: "Únete a Lanyard para ver tu estado en vivo",
  },
  accessGate: {
    protected: "Perfil protegido",
    hint: "Introduce el código de acceso para ver este perfil.",
    codePlaceholder: "Código de acceso",
    codeLabel: "Código de acceso",
    wrongCode: "Código incorrecto",
    connectionError: "Error de conexión. Inténtalo de nuevo.",
    submit: "Entrar al perfil",
    verifying: "Verificando...",
  },
  claimCta: {
    title: "Reclama tu perfil",
    subtitle: "Crea tu página link-in-bio gratis en Eyed.bio",
    signup: "Crear cuenta",
    login: "Iniciar sesión",
  },
  quickNav: {
    dashboard: "Editar perfil",
    home: "Ir al inicio",
  },
  share: {
    shareProfile: "Compartir perfil",
    share: "Compartir",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    title: "Compartir perfil",
    close: "Cerrar",
    stories: "Historias",
    storiesHint: "IG, TikTok, WhatsApp",
    link: "Enlace",
    copied: "Copiado",
    storyHint:
      "Imagen guardada. Ábrela en Instagram, TikTok o WhatsApp y publícala en tu historia. También puedes pegar el enlace con sticker de enlace en Instagram.",
    storyHelp: "Historias:",
    chatsHelp: "Chats:",
    storyHelpBody: "descarga la imagen vertical con QR.",
    chatsHelpBody: "al enviar el enlace se muestra tu foto y bio como vista previa.",
    moreOptions: "Más opciones del dispositivo",
    shareText: "Mira mi perfil en Eyed.bio",
  },
  dashboard: {
    tabs: {
      general: "Perfil",
      links: "Enlaces",
      media: "Media",
      appearance: "Estilo",
      account: "Cuenta",
    },
    viewProfile: "Ver perfil",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Guardado ✓",
    signOut: "Cerrar sesión",
    preview: "Vista previa",
    sessionExpired: "Tu sesión expiró. Vuelve a iniciar sesión.",
    goLogin: "Ir a iniciar sesión",
    loadError: "No se pudo cargar el perfil",
    saveError: "Error al guardar",
    conflictError: "El perfil cambió en otra pestaña. Recarga la página antes de guardar.",
    unsavedTitle: "Tienes cambios sin guardar",
    unsavedBody:
      "Guarda tu perfil antes de verlo público para que los visitantes vean la versión actualizada.",
    keepEditing: "Seguir editando",
    viewWithoutSave: "Ver sin guardar",
    saveAndView: "Guardar y ver",
    shareTitle: "Compartir perfil",
    shareHint:
      "Comparte en WhatsApp, X, Telegram o descarga una imagen para historias de Instagram, TikTok y WhatsApp Status.",
    displayName: "Nombre para mostrar",
    bioPlaceholder: "Cuéntanos sobre ti...",
    avatarLabel: "Foto de perfil",
    avatarHint: "JPG, PNG, WebP o GIF · máx. 5MB",
    backgroundTitle: "Fondo del perfil",
    backgroundHint:
      "Sube tu propia imagen, GIF animado o video de fondo. Se verá detrás de tu tarjeta en el perfil público.",
    backgroundHintSave: "Máximo {limit} MB · Recuerda pulsar Guardar después de subir",
    bannerTitle: "Banner de la tarjeta",
    bannerHint:
      "Imagen horizontal para la cabecera del layout Banner. Independiente del fondo de pantalla.",
    bannerFileHint: "JPG, PNG, WEBP o GIF · máx. 10 MB",
    audioLabel: "Audio de fondo",
    audioHint:
      "MP3, WAV, OGG, M4A, AAC, FLAC, OPUS, AIFF, MIDI · máx. 25MB · elige fragmento o audio completo",
    audioSource: "Fuente de audio",
    audioSourceUpload: "Archivo subido",
    audioSourceUploadHint: "Sube un MP3 u otro archivo de audio",
    audioSourceBackground: "Audio del video de fondo",
    audioSourceBackgroundHint: "Usa la pista de audio de tu video de fondo",
    audioSourceBackgroundDisabled: "Necesitas un video de fondo con audio",
    audioSourceBackgroundActive:
      "Se reproduce el audio del video de fondo. El video en pantalla sigue sin sonido para evitar duplicados.",
    audioClipTitle: "Fragmento del perfil",
    audioClipDurationLabel: "Duración",
    audioClipFull: "Pista completa",
    audioClipFullHint: "Se reproducirá el archivo de audio subido entero en bucle",
    audioClipDurationHint: "Elige {seconds} segundos que se repetirán en tu perfil",
    audioClipPositionHint: "Arrastra para elegir por dónde empieza el fragmento",
    audioClipSelected: "{seconds}s seleccionados",
    audioClipShortTrack: "Duración total",
    audioClipPreview: "Escuchar",
    audioClipStop: "Detener",
    playAudio: "Reproducir audio en el perfil",
    backgroundEffect: "Efecto de fondo",
    effectCategory: "Categoría",
    opacityLabel: "Opacidad del fondo ({percent}%)",
    opacityDisabled: "Desactivado en modo transparente.",
    blurLabel: "Blur ({px}px)",
    structureLinks: "Estructura y enlaces",
    cardSection: "Tarjeta",
    colorsSection: "Colores de la tarjeta",
    transparentCard: "Tarjeta transparente (sin color de fondo)",
    showBorder: "Mostrar borde",
    showShadow: "Mostrar sombra",
    borderOpacity: "Opacidad del borde ({percent}%)",
    primaryColor: "Color principal",
    secondaryColor: "Color secundario (gradiente)",
    textColor: "Color del texto",
    accentColor: "Color de acento (brillo y borde)",
    nameEffect: "Efecto en el nombre",
    glowIcons: "Brillo en iconos",
    gradientCard: "Gradiente en tarjeta",
    monochromeIcons: "Iconos monocromáticos",
    entrySectionTitle: "Pantalla de entrada",
    entrySectionHint:
      "Todos los visitantes ven esta pantalla antes de entrar. Al pulsar, arrancan el video y el audio.",
    entryGateEnabled: "Mostrar pantalla de entrada",
    entryGateText: "Texto de entrada",
    entryGateTextPlaceholder: "pulsa para entrar...",
    browserTabTitle: "Título de la pestaña",
    browserTabTitlePlaceholder: "@tuusuario",
    browserTabTitleHint: "Lo que aparece en la pestaña del navegador. Déjalo vacío para usar el nombre por defecto.",
    browserTabSectionTitle: "Pestaña del navegador",
    browserTabSectionHint: "Personaliza el título y el icono que ven los visitantes en la pestaña del navegador.",
    browserTabIconLabel: "Icono de la pestaña",
    browserTabIconHint: "PNG, JPG, WebP o GIF · máx. 1 MB · recomendado 32×32 o 64×64 px",
    profileNameSectionTitle: "Nombre en el perfil",
    profileNameSectionHint: "Animación e icono junto a tu nombre en la tarjeta. El brillo/neón está en Estilo.",
    nameAnimation: "Animación de letras",
    profileNameIconLabel: "Icono junto al nombre",
    profileNameIconHint: "PNG, JPG, WebP o GIF · máx. 2 MB · se muestra al lado de tu nombre",
    visibilitySectionTitle: "Visibilidad del perfil",
    showViewCount: "Mostrar contador de visitas",
    showShareButton: "Mostrar botón compartir",
    discordSectionTitle: "Discord y ubicación",
    discordSectionHint:
      "Muestra tu ubicación y un widget con tu estado de Discord en tiempo real.",
    showLocation: "Mostrar ubicación",
    locationLabel: "Ubicación",
    locationPlaceholder: "Ej: Madrid, España",
    discordPresenceEnabled: "Mostrar widget de Discord",
    discordUserIdLabel: "ID de usuario de Discord",
    discordUserIdPlaceholder: "123456789012345678",
    discordUserIdHint:
      "Activa Modo desarrollador en Discord → clic derecho en tu perfil → Copiar ID. Para que aparezca tu estado, únete a Lanyard en discord.gg/lanyard.",
    discordLanyardLink: "Unirse a Lanyard",
    previewSimulateEntry: "Simular pantalla de entrada",
  },
  linkEditor: {
    platformCount: "{count}/{max} redes y plataformas",
    customCount: " · {count}/{max} URLs personalizadas",
    totalCount: " · {count}/{max} en total",
    draftHint: " · {drafts} sin URL (no cuentan en el límite)",
    platformLimitReached: " · Límite de redes alcanzado. Solo puedes añadir URLs personalizadas.",
    limitReached: " · Límite total alcanzado.",
    customLimitReached: "Límite de URLs personalizadas alcanzado.",
    empty: "Elige un icono abajo para añadir tu primer enlace.",
    visibleName: "Nombre visible (opcional)",
    remove: "Quitar {label}",
    linkFor: "Enlace de {label}",
    usernameFor: "Usuario de {label}",
    usernameHint: "Solo el nombre de usuario (sin enlace). En el perfil se copia al pulsar.",
    uploadIcon: "Subir icono personalizado",
    changeIcon: "Cambiar icono",
    customTitle: "Añadir URL personalizada",
    customHint: "Hasta {max} proyectos o webs propias, con icono a medida.",
    uploadError: "Error al subir",
  },
  fileUpload: {
    upload: "Subir archivo",
    uploading: "Subiendo...",
    remove: "Quitar",
    uploadError: "Error al subir",
    fileTooLarge: "El archivo pesa demasiado (máximo {limit} MB).",
    fileTypeNotAllowed: "Tipo de archivo no permitido.",
    image: "Imagen",
    gif: "GIF",
    video: "Video",
    avatarAlt: "Avatar",
    bannerAlt: "Banner",
    backgroundAlt: "Fondo",
    audioUploaded: "Audio subido",
    removeAudio: "Quitar audio",
    removeFile: "Quitar archivo",
    changeFile: "Cambiar archivo",
    uploadBanner: "Subir imagen de banner",
    uploadBackground: "Subir imagen, GIF o video",
    uploadingPercent: "Subiendo… {percent}%",
    dragHint: "Arrastra aquí o haz clic · JPG, PNG, WebP, GIF, MP4, WebM, MOV",
  },
  imageAdjust: {
    titleAvatar: "Ajustar foto de perfil",
    titleBanner: "Ajustar banner",
    titleBackground: "Ajustar fondo",
    dragHint: "Arrastra la imagen para encuadrar · usa el zoom para acercar",
    zoom: "Zoom",
    reset: "Restablecer",
    cancel: "Cancelar",
    apply: "Aplicar y subir",
    saving: "Guardando…",
    close: "Cerrar",
    adjustExisting: "Ajustar encuadre",
    loadError: "No se pudo cargar la imagen para ajustar",
    exportError: "No se pudo procesar la imagen",
    focusHint: "Arrastra para elegir qué parte se ve · el zoom aleja o acerca sin recortar la imagen",
    zoomOutHint: "Menos de 1× aleja y muestra más imagen (útil en pantallas anchas).",
    applyFocus: "Guardar encuadre",
  },
  cardPicker: {
    structure: "Estructura",
    structureAria: "Estructura de tarjeta",
    linkMode: "Modo de enlaces",
    linkModeAria: "Modo de enlaces",
    avatar: "Avatar",
    avatarAria: "Estilo de avatar",
  },
  cardLayouts: {
    classic: { label: "Clásica", description: "Centrada, avatar arriba e iconos en cuadrícula." },
    hero: { label: "Hero", description: "Avatar grande, nombre destacado y fila de iconos." },
    split: { label: "Lateral", description: "Avatar a la izquierda y texto al lado." },
    banner: { label: "Banner", description: "Cabecera visual con avatar superpuesto." },
    minimal: { label: "Minimal", description: "Poco contenedor; contenido flotando sobre el fondo." },
    stack: { label: "Stack", description: "Enlaces anchos tipo botón debajo del perfil." },
    glass: { label: "Cristal", description: "Panel ancho con pie dividido (visitas + redes)." },
  },
  linkStyles: {
    icons: { label: "Iconos", description: "Cuadrícula de iconos con hover." },
    pills: { label: "Botones", description: "Lista vertical de enlaces con etiqueta." },
    row: { label: "Fila", description: "Iconos en una sola fila compacta." },
    chips: { label: "Chips", description: "Píldoras pequeñas con icono y nombre." },
  },
  avatarStyles: {
    circle: { label: "Circular" },
    ring: { label: "Anillo" },
    rounded: { label: "Redondeado" },
  },
  nameEffects: {
    none: "Ninguno",
    glow: "Brillo",
    aura: "Aura",
    neon: "Neón",
    pulse: "Pulso",
    gradient: "Gradiente",
  },
  nameAnimations: {
    none: "Ninguna",
    typewriter: "Máquina de escribir",
    wave: "Ola",
    bounce: "Rebote",
    shimmer: "Brillo móvil",
    glitch: "Glitch",
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
};
