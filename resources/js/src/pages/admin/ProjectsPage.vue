<script setup lang='ts'>
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useUiStore } from '@/stores/ui.store';
import ActiveUserMenu from '@/components/ActiveUserMenu.vue';

interface ProjectPreview {
  id: number;
  name: string;
  updatedAt: string;
  members: number;
}

const uiStore = useUiStore();

const { isProjectCreateModalOpen } = storeToRefs(uiStore);

const projects: ProjectPreview[] = [
  {
    id: 1,
    name: 'Website Redesign',
    updatedAt: 'Updated just now',
    members: 3,
  },
  {
    id: 2,
    name: 'Mobile App Roadmap',
    updatedAt: 'Updated 2 hours ago',
    members: 5,
  },
  {
    id: 3,
    name: 'Marketing Sprint',
    updatedAt: 'Updated yesterday',
    members: 2,
  },
];
</script>

<template>
  <main class='min-h-screen bg-slate-100 px-6 py-8 md:px-10'>
    <div class='mx-auto max-w-6xl'>
      <header class='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p class='text-sm font-bold uppercase tracking-[0.2em] text-blue-600'>
            Workspace
          </p>

          <h1 class='mt-2 text-3xl font-bold tracking-tight text-slate-950'>
            Your projects
          </h1>

          <p class='mt-2 text-slate-600'>
            Data di bawah masih placeholder. API project dan pagination dibuat pada
            FASE 3.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <ActiveUserMenu />

          <button
            type='button'
            class='rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200'
            @click="uiStore.openProjectCreateModal"
          >
            New project
          </button>
        </div>

        <div
          v-if='isProjectCreateModalOpen'
          class='mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950'
        >
          <div>
            <p class='font-semibold'>Create project modal is ready for the next phase.</p>

            <p class='mt-1 text-sm text-blue-800'>
                Form, validation, dan request API create project akan dibuat pada FASE 3.
            </p>
          </div>

          <button
            type='button'
            class='rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100'
            @click='uiStore.closeProjectCreateModal'
          >
            Close
          </button>
        </div>
      </header>

      <section class='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <RouterLink
          v-for='project in projects'
          :key='project.id'
          :to='{ name: "project-board", params: { projectId: project.id } }'
          class='group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70'
        >
          <div class='flex items-start justify-between gap-4'>
            <span
              class='grid size-11 place-items-center rounded-xl bg-blue-100 font-bold text-blue-700'
            >
              {{ project.name.charAt(0) }}
            </span>

            <span class='text-sm font-medium text-slate-500'>
              {{ project.members }} members
            </span>
          </div>

          <h2 class='mt-6 text-xl font-bold text-slate-900 transition group-hover:text-blue-700'>
            {{ project.name }}
          </h2>

          <p class='mt-2 text-sm text-slate-500'>
            {{ project.updatedAt }}
          </p>

          <span class='mt-6 inline-flex text-sm font-semibold text-blue-600'>
            Open board →
          </span>
        </RouterLink>
      </section>
    </div>
  </main>
</template>
