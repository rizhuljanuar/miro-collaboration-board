/// <reference types='vite/client' />

interface Window {
  Pusher: typeof import('pusher-js').default;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;

  export default component;
}
