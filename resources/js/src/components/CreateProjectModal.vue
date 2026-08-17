<script setup lang='ts'>
import { computed, ref } from 'vue';

import { getCsrfToken } from '@/helpers/csrf';
import type { ApiResponse } from '@/types/auth';
import type { Project } from '@/types/project';

const emit = defineEmits<{
  close: [];
  created: [project: Project];
}>();

const name = ref('');
const description = ref('');
const isSubmitting = ref(false);
const formError = ref<string | null>(null);
const fieldErrors = ref<Record<string, string[]>>({});

const isNameInvalid = computed(() => {
  return name.value.trim().length > 0 && name.value.trim().length < 3;
});

function resetErrors(): void {
  formError.value = null;
  fieldErrors.value = {};
}

function getFieldError(field: string): string | null {
  return fieldErrors.value[field]?.[0] ?? null;
}

function closeModal(): void {
  if (isSubmitting.value) {
    return;
  }

  emit('close');
}

async function submit(): Promise<void> {
  const projectName = name.value.trim();
  const projectDescription = description.value.trim();
  const csrfToken = getCsrfToken();

  resetErrors();

  if (projectName.length < 3) {
    fieldErrors.value = {
      name: ['Nama project minimal terdiri dari 3 karakter.'],
    };

    return;
  }

  if (!csrfToken) {
    formError.value = 'CSRF token tidak ditemukan. Refresh halaman lalu coba lagi.';

    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription || null,
      }),
    });

    if (response.status === 401) {
      throw new Error('Sesi login Anda telah berakhir. Silakan login kembali.');
    }

    if (response.status === 422) {
      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      formError.value = payload.message ?? 'Input project belum valid.';
      fieldErrors.value = payload.errors ?? {};

      return;
    }

    if (!response.ok) {
      throw new Error('Project tidak dapat dibuat. Silakan coba lagi.');
    }

    const payload = (await response.json()) as ApiResponse<Project>;

    emit('created', payload.data);

    name.value = '';
    description.value = '';
  } catch (error) {
    formError.value =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat membuat project.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div
    class='fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm'
    role='presentation'
    @click.self='closeModal'
  >
    <section
      class='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8'
      role='dialog'
      aria-modal='true'
      aria-labelledby='create-project-title'
    >
      <div class='flex items-start justify-between gap-4'>
        <div>
          <p class='text-sm font-bold uppercase tracking-[0.18em] text-blue-600'>
            New workspace
          </p>

          <h2 id='create-project-title' class='mt-2 text-2xl font-bold text-slate-950'>
            Create a project
          </h2>
        </div>

        <button
          type='button'
          class='rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50'
          aria-label='Close create project modal'
          :disabled='isSubmitting'
          @click='closeModal'
        >
          ✕
        </button>
      </div>

      <form class='mt-7 space-y-5' @submit.prevent='submit'>
        <div>
          <label for='project-name' class='text-sm font-semibold text-slate-800'>
            Project name
          </label>

          <input
            id='project-name'
            v-model='name'
            type='text'
            name='name'
            maxlength='150'
            autocomplete='off'
            placeholder='Example: Website Redesign'
            class='mt-2 w-full rounded-xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4'
            :class='
              getFieldError("name")
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
            '
            :aria-invalid='Boolean(getFieldError("name"))'
            aria-describedby='project-name-error'
            :disabled='isSubmitting'
          >

          <p
            v-if='getFieldError("name")'
            id='project-name-error'
            class='mt-2 text-sm text-red-700'
          >
            {{ getFieldError('name') }}
          </p>

          <p v-else-if='isNameInvalid' class='mt-2 text-sm text-amber-700'>
            Nama project minimal terdiri dari 3 karakter.
          </p>
        </div>

        <div>
          <label for='project-description' class='text-sm font-semibold text-slate-800'>
            Description
            <span class='font-normal text-slate-500'>(optional)</span>
          </label>

          <textarea
            id='project-description'
            v-model='description'
            name='description'
            rows='4'
            maxlength='2000'
            placeholder='Jelaskan tujuan project ini secara singkat.'
            class='mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
            :disabled='isSubmitting'
          ></textarea>

          <p class='mt-2 text-right text-xs text-slate-500'>
            {{ description.length }} / 2000
          </p>
        </div>

          <div
            v-if='formError'
            class='rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800'
            role='alert'
          >
            {{ formError }}
          </div>

          <div class='flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5'>
            <button
              type='button'
              class='rounded-xl px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50'
              :disabled='isSubmitting'
              @click='closeModal'
            >
              Cancel
            </button>

            <button
              type='submit'
              class='rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60'
              :disabled='isSubmitting || name.trim().length < 3'
            >
              {{ isSubmitting ? 'Creating...' : 'Create project' }}
            </button>
          </div>
      </form>
    </section>
  </div>
</template>
