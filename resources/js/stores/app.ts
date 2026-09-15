import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore('app', () => {
  const appName = ref('Miro Clone');
  const isLoading = ref(false);

  function setLoading(value: boolean) {
    isLoading.value = value;
  }

  return {
    appName,
    isLoading,
    setLoading,  
  }
});
