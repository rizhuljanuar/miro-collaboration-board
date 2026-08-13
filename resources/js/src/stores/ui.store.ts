import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', () => {
  const isProjectCreateModalOpen = ref(false);

  function openProjectCreateModal(): void {
    isProjectCreateModalOpen.value = true;
  }

  function closeProjectCreateModal(): void {
    isProjectCreateModalOpen.value = false;
  }

  return {
    isProjectCreateModalOpen,
    openProjectCreateModal,
    closeProjectCreateModal,
  };
});
