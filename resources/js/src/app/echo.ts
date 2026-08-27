import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { getCsrfToken } from '@/helpers/csrf';

type ReverbScheme = 'http' | 'https';

function getRequiredEnvironmentValue(name: string): string {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi.`);
  }

  return value;
}

function getReverbScheme(): ReverbScheme {
  const scheme = import.meta.env.VITE_REVERB_SCHEME?.trim();

  return scheme === 'https' ? 'https' : 'http';
}

function getReverbPort(): number {
  const value = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);

  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error('VITE_REVERB_PORT harus berupa port valid.');
  }

  return value;
}

const reverbAppKey = getRequiredEnvironmentValue('VITE_REVERB_APP_KEY');
const reverbHost = getRequiredEnvironmentValue('VITE_REVERB_HOST');
const reverbPort = getReverbPort();
const reverbScheme = getReverbScheme();

const csrfToken = getCsrfToken();

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: reverbAppKey,
  wsHost: reverbHost,
  wsPort: reverbPort,
  wssPort: reverbPort,
  forceTLS: reverbScheme === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: '/broadcasting/auth',
  auth: {
    headers: {
      Accept: 'application/json',
      ...(csrfToken
        ? {
            'X-CSRF-TOKEN': csrfToken,
          }
        : {}),
    },
  },
});

export function disconnectEcho(): void {
  echo.disconnect();
}
