<script setup lang='ts'>
import { computed, onBeforeUnmount } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { useProject } from '@/composables/useProject';

import ActiveUserMenu from '@/components/ActiveUserMenu.vue';
import ShareBoardButton from '@/components/ShareBoardButton.vue';

const route = useRoute();

const projectId = computed<number | null>(() => {
  const value = Number(route.params.projectId);

  return Number.isInteger(value) && value > 0 ? value : null;
});

const {
  project,
  isLoading,
  errorMessage,
  isNotFound,
  reloadProject,
  dispose,
} = useProject(projectId);

onBeforeUnmount(() => {
  dispose();
});
</script>

<template>
  <main class='flex min-h-screen flex-col bg-slate-100'>
    <header
      class='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4'
    >
      <div class='flex min-w-0 items-center gap-4'>
        <RouterLink
          :to='{ name: "projects" }'
          class='shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100'
        >
          ← Projects
        </RouterLink>

        <div class='h-8 w-px shrink-0 bg-slate-200'></div>

        <div class='min-w-0'>
          <p class='text-xs font-bold uppercase tracking-[0.18em] text-blue-600'>
              Project board
          </p>

          <h1 class='mt-1 truncate text-lg font-bold text-slate-950'>
              {{ project?.name ?? 'Loading project...' }}
          </h1>
        </div>
      </div>

      <div class='flex flex-wrap items-center gap-3'>
        <ActiveUserMenu />

        <ShareBoardButton
            v-if='project'
            :project-id='project.id'
            :project-name='project.name'
        />
      </div>
    </header>

    <section
      v-if='isLoading'
      class='grid flex-1 place-items-center p-6'
      aria-label='Loading project board'
    >
      <div class='w-full max-w-3xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12'>
        <div class='mx-auto size-16 rounded-2xl bg-slate-200'></div>

        <div class='mx-auto mt-6 h-5 w-40 rounded bg-slate-200'></div>

        <div class='mx-auto mt-4 h-9 w-2/3 rounded bg-slate-200'></div>

        <div class='mx-auto mt-5 h-5 w-4/5 rounded bg-slate-100'></div>
      </div>
    </section>

    <section
      v-else-if='isNotFound'
      class='grid flex-1 place-items-center p-6'
    >
      <div class='w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm'>
        <p class='text-sm font-bold uppercase tracking-[0.18em] text-amber-700'>
            Project unavailable
        </p>

        <h2 class='mt-3 text-2xl font-bold text-amber-950'>
            Project tidak ditemukan
        </h2>

        <p class='mt-3 leading-7 text-amber-900'>
            Project mungkin sudah dihapus, URL tidak valid, atau Anda belum menjadi
            collaborator pada project ini.
        </p>

        <RouterLink
            :to='{ name: "projects" }'
            class='mt-6 inline-flex rounded-xl bg-amber-700 px-4 py-3 font-semibold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-200'
        >
            Back to projects
        </RouterLink>
      </div>
    </section>

    <section
      v-else-if='errorMessage'
      class='grid flex-1 place-items-center p-6'
    >
      <div class='w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm'>
        <p class='text-sm font-bold uppercase tracking-[0.18em] text-red-700'>
          Board error
        </p>

        <h2 class='mt-3 text-2xl font-bold text-red-950'>
          Board tidak dapat dimuat
        </h2>

        <p class='mt-3 leading-7 text-red-800'>
          {{ errorMessage }}
        </p>

        <div class='mt-6 flex flex-wrap justify-center gap-3'>
          <button
            type='button'
            class='rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200'
            @click='reloadProject'
          >
            Coba lagi
          </button>

          <RouterLink
            :to='{ name: "projects" }'
            class='rounded-xl bg-white px-4 py-3 font-semibold text-red-800 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200'
          >
            Back to projects
          </RouterLink>
        </div>
      </div>
    </section>

      <section v-else-if='project' class='flex flex-1 items-center justify-center p-6'>
        <div
          class='w-full max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm md:p-12'
        >
          <div
            class='mx-auto grid size-16 place-items-center rounded-2xl bg-blue-100 text-3xl text-blue-700'
          >
            ✦
          </div>

          <p class='mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-600'>
            Board ready
          </p>

          <h2 class='mt-3 text-3xl font-bold tracking-tight text-slate-950'>
            {{ project.name }}
          </h2>

          <p class='mx-auto mt-4 max-w-xl leading-7 text-slate-600'>
            {{
              project.description ||
              'Project ini belum memiliki deskripsi. Anda dapat mulai menambahkan ide di board.'
            }}
          </p>

          <div class='mt-8 flex flex-wrap justify-center gap-3'>
            <span class='rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700'>
              Role: {{ project.role ?? 'member' }}
            </span>

            <span class='rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800'>
              {{ project.members_count ?? 1 }} collaborator{{
                (project.members_count ?? 1) === 1 ? '' : 's'
              }}
            </span>
          </div>

          <p class='mx-auto mt-8 max-w-xl text-sm leading-6 text-slate-500'>
            Pada FASE 4, area ini akan menjadi layout board dengan toolbar, color palette,
            undo/redo, sidebar, dan workspace canvas.
          </p>
        </div>
      </section>
  </main>
</template>
