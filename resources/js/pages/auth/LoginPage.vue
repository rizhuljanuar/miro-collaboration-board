<script setup lang="ts">
import { appConfig } from '../../app/app'
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 p-6">
    <section class="w-full max-w-md rounded-xl bg-white p-8 shadow">
      <img
        :src="`${appConfig.baseUrl}/images/logo.svg`"
        alt="Miro Clone"
        class="mx-auto mb-8 h-16 w-auto"
      />

      <h1 class="mb-2 text-center text-2xl font-bold text-slate-800">
        Welcome Back
      </h1>

      <p class="mb-6 text-center text-sm text-slate-500">
        Login to continue to your workspace
      </p>

      <a
        href="/auth/google/redirect"
        class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 px-4 py-3 font-medium transition hover:bg-slate-100"
      >
        <img
          :src="`${appConfig.baseUrl}/images/google.svg`"
          alt=""
          class="h-5 w-5"
        />

        Login with Google
      </a>
    </section>
  </main>
</template>
