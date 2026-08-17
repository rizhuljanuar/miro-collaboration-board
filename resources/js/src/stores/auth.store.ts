import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { ApiResponse, AuthUser } from '@/types/auth';
import { getCsrfToken } from '@/helpers/csrf';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  async function fetchCurrentUser(): Promise<void> {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;

    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        user.value = null;
        return;
      }

      if (!response.ok) {
        throw new Error('Tidak dapat memeriksa status login.');
      }

      const payload = (await response.json()) as ApiResponse<AuthUser>;

      user.value = payload.data;
    } catch (error) {
      user.value = null;

      errorMessage.value =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memeriksa status login.';
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }
  }

  function clearUser(): void {
    user.value = null;
  }

  async function logout(): Promise<void> {
    const csrfToken = getCsrfToken();

    if (!csrfToken) {
      throw new Error('CSRF token tidak ditemukan. Refresh halaman lalu coba lagi.');
    }

    errorMessage.value = null;

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (response.status === 401) {
        clearUser();

        return;
      }

      if (!response.ok) {
        throw new Error('Logout gagal. Silahkan coba lagi.');
      }

      clearUser();
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat mencoba logout.';

      throw error;
    }
  }

  return {
    user,
    isInitialized,
    isLoading,
    errorMessage,
    isAuthenticated,
    fetchCurrentUser,
    clearUser,
    logout,
  };
});
