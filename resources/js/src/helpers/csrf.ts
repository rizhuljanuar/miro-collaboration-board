export function getCsrfToken(): string | null {
  return document
    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
    ?.getAttribute('content') ?? null;
}
