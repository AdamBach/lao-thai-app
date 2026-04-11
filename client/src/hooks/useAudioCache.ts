import { useState, useCallback, useEffect } from "react";

interface CachedAudio {
  key: string;
  audioUrl: string;
  blob: Blob;
  timestamp: number;
  expiresAt: number;
}

const DB_NAME = "LaoThaiLearning";
const STORE_NAME = "audioCache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Custom hook for caching audio files using IndexedDB
 * Automatically expires cache after 7 days
 */
export function useAudioCache() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => {
          console.error("[AudioCache] Failed to open IndexedDB");
          setIsReady(true);
        };

        request.onsuccess = () => {
          const database = request.result;
          setDb(database);
          setIsReady(true);
        };

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: "key" });
          }
        };
      } catch (error) {
        console.error("[AudioCache] IndexedDB not available:", error);
        setIsReady(true);
      }
    };

    initDB();
  }, []);

  /**
   * Get cached audio by key
   */
  const getAudio = useCallback(
    async (key: string): Promise<string | null> => {
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onsuccess = () => {
            const cached = request.result as CachedAudio | undefined;

            if (!cached) {
              resolve(null);
              return;
            }

            // Check if cache has expired
            if (Date.now() > cached.expiresAt) {
              // Delete expired cache
              deleteAudio(key);
              resolve(null);
              return;
            }

            // Create object URL from cached blob
            const url = URL.createObjectURL(cached.blob);
            resolve(url);
          };

          request.onerror = () => {
            console.error("[AudioCache] Failed to get audio:", request.error);
            resolve(null);
          };
        } catch (error) {
          console.error("[AudioCache] Error getting audio:", error);
          resolve(null);
        }
      });
    },
    [db]
  );

  /**
   * Cache audio blob
   */
  const cacheAudio = useCallback(
    async (key: string, audioUrl: string, blob: Blob): Promise<boolean> => {
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readwrite");
          const store = transaction.objectStore(STORE_NAME);

          const cached: CachedAudio = {
            key,
            audioUrl,
            blob,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_DURATION,
          };

          const request = store.put(cached);

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            console.error("[AudioCache] Failed to cache audio:", request.error);
            resolve(false);
          };
        } catch (error) {
          console.error("[AudioCache] Error caching audio:", error);
          resolve(false);
        }
      });
    },
    [db]
  );

  /**
   * Delete cached audio
   */
  const deleteAudio = useCallback(
    async (key: string): Promise<boolean> => {
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(key);

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            console.error("[AudioCache] Failed to delete audio:", request.error);
            resolve(false);
          };
        } catch (error) {
          console.error("[AudioCache] Error deleting audio:", error);
          resolve(false);
        }
      });
    },
    [db]
  );

  /**
   * Clear all expired cache
   */
  const clearExpired = useCallback(async (): Promise<number> => {
    if (!db) return 0;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const allCached = request.result as CachedAudio[];
          let deletedCount = 0;

          allCached.forEach((cached) => {
            if (Date.now() > cached.expiresAt) {
              store.delete(cached.key);
              deletedCount++;
            }
          });

          resolve(deletedCount);
        };

        request.onerror = () => {
          console.error("[AudioCache] Failed to clear expired:", request.error);
          resolve(0);
        };
      } catch (error) {
        console.error("[AudioCache] Error clearing expired:", error);
        resolve(0);
      }
    });
  }, [db]);

  /**
   * Clear all cache
   */
  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          console.error("[AudioCache] Failed to clear all:", request.error);
          resolve(false);
        };
      } catch (error) {
        console.error("[AudioCache] Error clearing all:", error);
        resolve(false);
      }
    });
  }, [db]);

  return {
    isReady,
    getAudio,
    cacheAudio,
    deleteAudio,
    clearExpired,
    clearAll,
  };
}
