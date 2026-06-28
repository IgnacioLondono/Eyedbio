export interface SiteSettingsConfig {
  /** Mostrar serial EYE-000001 en cuenta del usuario */
  showPublicUidInAccount: boolean;
  /** Los usuarios pueden activar código por correo al iniciar sesión */
  allowLoginCodeByEmail: boolean;
  /** Reseñas en perfiles y landing */
  profileReviewsEnabled: boolean;
  /** CTA «Crea tu perfil» en perfiles públicos */
  claimProfileCtaEnabled: boolean;
  /** Enlaces a Discord en navbar, landing y dashboard */
  communityDiscordEnabled: boolean;
  /** Audio de fondo en perfiles */
  profileAudioEnabled: boolean;
  /** Código de acceso para ocultar perfil público */
  profileAccessCodeEnabled: boolean;
  /** Centro de soporte con tickets en el dashboard */
  supportEnabled: boolean;
  /** Ocultar cuentas admin en Descubre (podio y listado) */
  hideAdminProfilesInDiscover: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsConfig = {
  showPublicUidInAccount: true,
  allowLoginCodeByEmail: true,
  profileReviewsEnabled: true,
  claimProfileCtaEnabled: true,
  communityDiscordEnabled: true,
  profileAudioEnabled: true,
  profileAccessCodeEnabled: true,
  supportEnabled: true,
  hideAdminProfilesInDiscover: false,
};

export function mergeSiteSettings(partial?: Partial<SiteSettingsConfig>): SiteSettingsConfig {
  return { ...DEFAULT_SITE_SETTINGS, ...partial };
}

export const SITE_SETTING_KEYS = Object.keys(
  DEFAULT_SITE_SETTINGS
) as (keyof SiteSettingsConfig)[];
