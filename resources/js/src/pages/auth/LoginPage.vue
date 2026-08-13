<script setup lang='ts'>
const applicationName = 'Miro Collaboration Board';
</script>

<template>
  <main
    class='grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12'
  >
    <section
      class='w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl md:p-10'
    >
      <div
        class='grid size-12 place-items-center rounded-xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/30'
      >
        M
      </div>

      <p class='mt-8 text-sm font-bold uppercase tracking-[0.2em] text-blue-600'>
        Welcome
      </p>

      <h1 class='mt-3 text-3xl font-bold tracking-tight text-slate-950'>
        Collaborate without the chaos.
      </h1>

      <p class='mt-4 leading-7 text-slate-600'>
        Sign in to create projects, invite collaborators, and turn ideas into a shared
        visual workspace.
      </p>

      <button
        type='button'
        class='mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100'
      >
        <span
          class='grid size-6 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 text-xs font-black text-white'
        >
          G
        </span>

        Continue with Google
      </button>

      <p class='mt-6 text-center text-sm leading-6 text-slate-500'>
        Google OAuth akan dihubungkan pada FASE 2 — Authentication.
      </p>

      <div class='mt-8 border-t border-slate-100 pt-6 text-center'>
        <p class='text-sm text-slate-500'>
          {{ applicationName }}
        </p>
      </div>
    </section>
  </main>
</template>
