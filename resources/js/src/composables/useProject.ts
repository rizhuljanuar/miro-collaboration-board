import { ref, watch, type Ref } from 'vue';

import type { ApiResponse } from '@/types/auth';
import type { Project } from '@/types/project';

export function useProject(projectId: Ref<number | null>) {
  const project = ref<Project | null>(null);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const isNotFound = ref(false);

  let activeController: AbortController | null = null;

  async function loadProject(id: number): Promise<void> {
    activeController?.abort();

    const controller = new AbortController();

    activeController = controller;
    project.value = null;
    errorMessage.value = null;
    isNotFound.value = false;
    isLoading.value = true;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (response.status === 404) {
        isNotFound.value = true;

        return;
      }

      if (response.status === 401) {
        throw new Error('Sesi login Anda telah berakhir. Silakan login kembali.');
      }

      if (response.status === 403) {
        throw new Error('Anda tidak memiliki akses ke project ini.');
      }

      if (!response.ok) {
        throw new Error('Detail project tidak dapat dimuat. Silakan coba lagi.');
      }

      const payload = (await response.json()) as ApiResponse<Project>;

      project.value = payload.data;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      errorMessage.value =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memuat detail project.';
    } finally {
      if (activeController === controller) {
        isLoading.value = false;
        activeController = null;
      }
    }
  }

  async function reloadProject(): Promise<void> {
    if (!projectId.value) {
      return;
    }

    await loadProject(projectId.value);
  }

  function dispose(): void {
    activeController?.abort();
    activeController = null;
  }

  watch(
    projectId,
    (id) => {
      if (!id) {
        project.value = null;
        isNotFound.value = true;

        return;
      }

      void loadProject(id);
    },
    {
      immediate: true,
    },
  );

  return {
    project,
    isLoading,
    errorMessage,
    isNotFound,
    reloadProject,
    dispose,
  };
}
