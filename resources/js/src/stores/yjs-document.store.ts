import { markRaw, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import * as Y from 'yjs';

export const useYjsDocumentStore = defineStore('yjs-document', () => {
  const activeRoomId = shallowRef<string | null>(null);
  const document = shallowRef<Y.Doc | null>(null);

  function initializeDocument(roomId: string): Y.Doc {
    const normalizedRoomId = roomId.trim();

    if (!normalizedRoomId) {
      throw new Error('Yjs room ID tidak boleh kosong.');
    }

    if (document.value && activeRoomId.value === normalizedRoomId) {
      return document.value;
    }

    destroyDocument();

    const yDocument = markRaw(new Y.Doc());

    document.value = yDocument;
    activeRoomId.value = normalizedRoomId;

    return yDocument;
  }

  function destroyDocument(): void {
    document.value?.destroy();

    document.value = null;
    activeRoomId.value = null;
  }

  function isActiveRoom(roomId: string): boolean {
    return activeRoomId.value === roomId;
  }

  return {
    activeRoomId,
    document,
    initializeDocument,
    destroyDocument,
    isActiveRoom,
  };
});
