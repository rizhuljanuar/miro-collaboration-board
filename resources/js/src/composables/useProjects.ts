import { ref } from "vue";

import { PaginatedApiResponse, PaginationMeta, Project } from "@/types/project";

const DEFAULT_PER_PAGE = 12;

export function useProjects() {
  const projects = ref<Project[]>([]);
  const pagination = ref<PaginationMeta | null>(null);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);

  let activeController: AbortController | null = null;

  async function loadProjects(page = 1): Promise<void> {
    activeController?.abort();

    const controller = new AbortController();

    activeController = controller;
    isLoading.value = true;
    errorMessage.value = null;

    const searchParams = new URLSearchParams({
      page: String(page),
      per_page: String(DEFAULT_PER_PAGE),
    });

    try {
      const response = await fetch(`/api/projects?${searchParams.toString()}`, {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (response.status === 401) {
        throw new Error('Sesi login Anda telah berakhir. Silahkan login kembali.');
      }

      if (!response.ok) {
        throw new Error('Daftar project tidak dapat dimuat. Silahkan coba lagi,');
      }

      const payload = (await response.json()) as PaginatedApiResponse<Project>;

      projects.value = payload.data;
      pagination.value = payload.meta;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      projects.value = [];
      pagination.value = null;

      errorMessage.value = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat daftar project.';
    } finally {
      if (activeController === controller) {
        isLoading.value = false;
        activeController = null;
      }
    }
  }

  async function goToPage(page: number): Promise<void> {
    if (!pagination.value) {
      return;
    }

    if (page < 1 || page > pagination.value.last_page) {
      return;
    }

    await loadProjects(page);
  }

  async function reloadProjects(): Promise<void> {
    await loadProjects(pagination.value?.current_page ?? 1);
  }

  function dispose(): void {
    activeController?.abort();
    activeController = null;
  }

  return {
    projects,
    pagination,
    isLoading,
    errorMessage,
    loadProjects,
    goToPage,
    reloadProjects,
    dispose,
  };
}
