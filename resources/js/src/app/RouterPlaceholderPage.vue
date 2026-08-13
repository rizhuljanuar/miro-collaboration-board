<script setup lang='ts'>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageContent = computed(() => {
  const routeName = String(route.name ?? '');

  const pages: Record<string, { eyebrow: string; title: string; description: string }> = {
    login: {
      eyebrow: 'Authentication route',
      title: 'Login page placeholder',
      description: 'Pada langkah berikutnya, route ini akan menampilkan halaman Login with Google.',
    },
    projects: {
      eyebrow: 'Protected application route',
      title: 'Project list placeholder',
      description: 'Pada langkah berikutnya, route ini akan menampilkan daftar project dengan pagination.',
    },
    'project-board': {
      eyebrow: 'Protected board route',
      title: 'Project board placeholder',
      description: 'Pada langkah berikutnya, route ini akan menjadi collaboration board untuk sticky notes, editor, canvas, dan realtime state.',
    },
  };

  return (
    pages[routeName] ?? {
      eyebrow: 'Unknown route',
      title: 'Page not found',
      description: 'Route yang Anda buka belum tersedia.',
    }
  );
});
</script>

<template>
  <main
    class='grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12 text-white'
  >
    <section
      class='w-full max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur md:p-12'
    >
      <p class='text-sm font-bold uppercase tracking-[0.2em] text-blue-300'>
        {{ pageContent.eyebrow }}
      </p>

      <h1 class='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
        {{ pageContent.title }}
      </h1>

      <p class='mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg'>
        {{ pageContent.description }}
      </p>

      <div class='mt-8 rounded-lg border border-white/10 bg-slate-950/50 p-4'>
        <p class='text-xs font-semibold uppercase tracking-wider text-slate-400'>
          Current route
        </p>

        <code class='mt-2 block break-all text-sm text-cyan-300'>
          {{ route.fullPath }}
        </code>
      </div>
    </section>
  </main>
</template>
