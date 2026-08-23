import { markRaw, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

type LocalPersistenceStatus = 'idle' | 'loading' | 'ready' | 'error';

type YjsConnectionStatus = 'connecting' | 'connected' | 'disconnected';

function getWebsocketUrl(): string {
  return import.meta.env.VITE_YJS_WEBSOCKET_URL?.trim() || 'ws://localhost:1234';
}

function getPersistenceName(roomId: string): string {
  return `miro-collaboration-board:${roomId}`;
}

export const useYjsDocumentStore = defineStore('yjs-document', () => {
  const activeRoomId = shallowRef<string | null>(null);
  const document = shallowRef<Y.Doc | null>(null);

  const provider = shallowRef<WebsocketProvider | null>(null);
  const indexedDbPersistence = shallowRef<IndexeddbPersistence | null>(null);

  const connectionStatus = ref<YjsConnectionStatus>('disconnected');
  const isSynced = ref(false);

  const localPersistenceStatus = ref<LocalPersistenceStatus>('idle');

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

    connectionStatus.value = 'connecting';
    isSynced.value = false;
    localPersistenceStatus.value = 'loading';

    const localPersistence = markRaw(
      new IndexeddbPersistence(getPersistenceName(normalizedRoomId), yDocument),
    );

    indexedDbPersistence.value = localPersistence;

    void localPersistence.whenSynced
      .then(() => {
        if (indexedDbPersistence.value !== localPersistence) {
          return;
        }

        localPersistenceStatus.value = 'ready';
      })
      .catch(() => {
        if (indexedDbPersistence.value !== localPersistence) {
          return;
        }

        localPersistenceStatus.value = 'error';
      });

    const websocketProvider = markRaw(
      new WebsocketProvider(getWebsocketUrl(), normalizedRoomId, yDocument),
    );

    websocketProvider.on('status', (event: { status: YjsConnectionStatus }) => {
      connectionStatus.value = event.status;
    });

    websocketProvider.on('connection-close', () => {
      connectionStatus.value = 'disconnected';
      isSynced.value = false;
    });

    websocketProvider.on('sync', (synced: boolean) => {
      if (provider.value !== websocketProvider) {
        return;
      }

      isSynced.value = synced;
    });

    provider.value = websocketProvider;

    return yDocument;
  }

  function destroyDocument(): void {
    provider.value?.destroy();
    provider.value = null;

    indexedDbPersistence.value?.destroy();
    indexedDbPersistence.value = null;

    document.value?.destroy();
    document.value = null;

    activeRoomId.value = null;

    connectionStatus.value = 'disconnected';
    isSynced.value = false;
    localPersistenceStatus.value = 'idle';
  }

  function isActiveRoom(roomId: string): boolean {
    return activeRoomId.value === roomId;
  }

  return {
    activeRoomId,
    connectionStatus,
    document,
    indexedDbPersistence,
    isSynced,
    localPersistenceStatus,
    provider,
    destroyDocument,
    initializeDocument,
    isActiveRoom,
  };
});
