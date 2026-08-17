<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

import ActiveUserMenu from '@/components/ActiveUserMenu.vue';
import CreateProjectModal from '@/components/CreateProjectModal.vue';
import { useProjects } from '@/composables/useProjects';
import { useUiStore } from '@/stores/ui.store';
import type { Project } from '@/types/project';

const uiStore = useUiStore();

const { isProjectCreateModalOpen } = storeToRefs(uiStore);

const {
  projects,
  pagination,
  isLoading,
  errorMessage,
  loadProjects,
  goToPage,
  reloadProjects,
  dispose,
} = useProjects();

const hasProjects = computed(() => projects.value.length > 0);

function formatUpdatedAt(project: Project): string {
  if (!project.updated_at) {
    return 'Belum pernah diperbarui';
  }

  const date = new Date(project.updated_at);

  if (Number.isNaN(date.getTime())) {
    return 'Tanggal pembaruan tidak tersedia';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getProjectInitial(project: Project): string {
  return project.name.trim().charAt(0).toUpperCase() || 'P';
}

async function handleProjectCreated(): Promise<void> {
  uiStore.closeProjectCreateModal();

  await loadProjects(1);
}

onMounted(() => {
  void loadProjects();
});

onBeforeUnmount(() => {
  dispose();
});
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-6 py-8 md:px-10">
    <div class="mx-auto max-w-6xl">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Workspace</p>

          <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your projects</h1>

          <p class="mt-2 text-slate-600">Buat, buka, dan kelola collaboration board Anda.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <ActiveUserMenu />

          <button
            type="button"
            class="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            @click="uiStore.openProjectCreateModal"
          >
            New project
          </button>
        </div>
      </header>

      <CreateProjectModal
        v-if="isProjectCreateModalOpen"
        @close="uiStore.closeProjectCreateModal"
        @created="handleProjectCreated"
      />

      <section
        v-if="isLoading && !hasProjects"
        class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading projects"
      >
        <article
          v-for="index in 6"
          :key="index"
          class="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="size-11 rounded-xl bg-slate-200"></div>

          <div class="mt-6 h-6 w-3/4 rounded bg-slate-200"></div>

          <div class="mt-3 h-4 w-full rounded bg-slate-100"></div>

          <div class="mt-2 h-4 w-2/3 rounded bg-slate-100"></div>
        </article>
      </section>

      <section
        v-else-if="errorMessage"
        class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950"
        role="alert"
      >
        <h2 class="text-lg font-bold">Project tidak dapat dimuat</h2>

        <p class="mt-2 leading-7 text-red-800">
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="mt-5 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200"
          @click="reloadProjects"
        >
          Coba lagi
        </button>
      </section>

      <section
        v-else-if="!hasProjects"
        class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"
      >
        <div
          class="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700"
        >
          +
        </div>

        <h2 class="mt-6 text-2xl font-bold tracking-tight text-slate-950">Belum ada project</h2>

        <p class="mx-auto mt-3 max-w-md leading-7 text-slate-600">
          Buat project pertama untuk mulai menyusun ide, sticky notes, drawing, dan collaboration
          board bersama tim.
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          @click="uiStore.openProjectCreateModal"
        >
          Create your first project
        </button>
      </section>

      <section v-else class="mt-8">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-slate-600">
            {{ pagination?.total ?? projects.length }}
            project tersedia di workspace Anda.
          </p>

          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
            @click="reloadProjects"
          >
            {{ isLoading ? 'Memuat...' : 'Refresh' }}
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="project in projects"
            :key="project.id"
            :to="{ name: 'project-board', params: { projectId: project.id } }"
            class="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <div class="flex items-start justify-between gap-4">
              <span
                class="grid size-11 place-items-center rounded-xl bg-blue-100 font-bold text-blue-700"
              >
                {{ getProjectInitial(project) }}
              </span>

              <span
                class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600"
              >
                {{ project.role ?? 'member' }}
              </span>
            </div>

            <h2
              class="mt-6 line-clamp-1 text-xl font-bold text-slate-900 transition group-hover:text-blue-700"
            >
              {{ project.name }}
            </h2>

            <p class="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
              {{ project.description || 'Belum ada deskripsi untuk project ini.' }}
            </p>

            <div class="mt-6 border-t border-slate-100 pt-4">
              <p class="text-xs text-slate-500">Updated {{ formatUpdatedAt(project) }}</p>

              <p class="mt-1 text-xs text-slate-500">
                {{ project.members_count ?? 1 }}
                collaborator{{ (project.members_count ?? 1) === 1 ? '' : 's' }}
              </p>
            </div>

            <span class="mt-5 inline-flex text-sm font-semibold text-blue-600"> Open board → </span>
          </RouterLink>
        </div>

        <nav
          v-if="pagination && pagination.last_page > 1"
          class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6"
          aria-label="Project pagination"
        >
          <p class="text-sm text-slate-600">
            Menampilkan {{ pagination.from ?? 0 }}–{{ pagination.to ?? 0 }} dari
            {{ pagination.total }} project
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="pagination.current_page <= 1 || isLoading"
              @click="goToPage(pagination.current_page - 1)"
            >
              Previous
            </button>

            <span
              class="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
              aria-live="polite"
            >
              Page {{ pagination.current_page }} / {{ pagination.last_page }}
            </span>

            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="pagination.current_page >= pagination.last_page || isLoading"
              @click="goToPage(pagination.current_page + 1)"
            >
              Next
            </button>
          </div>
        </nav>
      </section>
    </div>
  </main>
</template>
