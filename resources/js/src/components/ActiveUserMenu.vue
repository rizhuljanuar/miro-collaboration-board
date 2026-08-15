<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth.store';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

const isLoggingOut = ref(false);
const logoutError = ref<string | null>(null);
const hasAvatarLoadError = ref(false);

const initials = computed(() => {
  if (!user.value) {
    return '?';
  }

  return user.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('');
});

async function handleLogout(): Promise<void> {
  if (isLoggingOut.value) {
    return;
  }

  isLoggingOut.value = true;
  logoutError.value = null;

  try {
    await authStore.logout();

    await router.replace({
      name: 'login',
    });
  } catch (error) {
    logoutError.value = error instanceof Error ? error.message : 'Terjadi kesalahan saat mencoba logout.';
  } finally {
    isLoggingOut.value = false;
  }
}
</script>

<template>
  <div v-if="user" class="flex items-center gap-3">
    <div class="hidden text-right sm:block">
      <p class="max-w-40 truncate text-sm font-semibold text-slate-900">
        {{ user.name }}
      </p>

      <p class="max-w-40 truncate text-xs text-slate-500">
        {{ user.email }}
      </p>

      <div 
        class="grid shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-2 ring-white"
        :title="user.name"
      >
        <img 
          v-if="user.avatar_url && !hasAvatarLoadError"
          :src="user.avatar_url" 
          :alt="`Avatar ${user.name}`"
          class="size-full object-cover"
          @error="hasAvatarLoadError = true"
        >
        
        <span v-else>
          {{ initials }}
        </span>
      </div>

      <button
        type="button"
        class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
      </button>

      <p v-if="logoutError" class="sr-only" role="alert">
        {{ logoutError }}
      </p>
    </div>
  </div>
</template>
