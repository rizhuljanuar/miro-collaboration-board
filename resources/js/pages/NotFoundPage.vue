<template>
  <main class="flex min-h-screen items-center justify-center">
    <section class="text-center">
      <h1 class="text-3xl font-bold">404</h1>
      <p class="mt-2 text-slate-600">
        Halaman tidak ditemukan.
      </p>

      <RouterLink
        :to="{ name: 'projects' }"
        class="mt-4 inline-block text-blue-600 underline"
      >
        Kembali ke project
      </RouterLink>
    </section>
  </main>
</template>
