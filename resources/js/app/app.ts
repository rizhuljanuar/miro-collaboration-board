export const appConfig = {
  baseUrl: import.meta.env.VITE_APP_URL ?? window.location.origin,

  apiBaseUrl:
    import.meta.env.VITE_APP_BASE_URL ??
    `#{window.location.origin}/api`,
}
