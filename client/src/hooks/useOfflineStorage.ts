import { useState, useCallback, useEffect } from "react";

interface OfflineLesson {
  id: number;
  language: "thai" | "lao";
  category: string;
  title: string;
  content: string;
  downloadedAt: number;
}

interface OfflineProgress {
  lessonId: number;
  completed: number;
  accuracy: number;
  lastReviewed: number;
}

const DB_NAME = "lao_thai_learning";
const LESSONS_STORE = "offline_lessons";
const PROGRESS_STORE = "offline_progress";

export function useOfflineStorage() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => {
          console.error("Failed to open IndexedDB");
        };

        request.onsuccess = () => {
          const database = request.result;
          setDb(database);
          setIsInitialized(true);
        };

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;

          // Create lessons store
          if (!database.objectStoreNames.contains(LESSONS_STORE)) {
            const lessonsStore = database.createObjectStore(LESSONS_STORE, { keyPath: "id" });
            lessonsStore.createIndex("language", "language", { unique: false });
            lessonsStore.createIndex("category", "category", { unique: false });
          }

          // Create progress store
          if (!database.objectStoreNames.contains(PROGRESS_STORE)) {
            const progressStore = database.createObjectStore(PROGRESS_STORE, { keyPath: "lessonId" });
            progressStore.createIndex("lastReviewed", "lastReviewed", { unique: false });
          }
        };
      } catch (error) {
        console.error("Error initializing IndexedDB:", error);
      }
    };

    initDB();
  }, []);

  // Download lesson for offline use
  const downloadLesson = useCallback(
    async (lesson: OfflineLesson): Promise<boolean> => {
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([LESSONS_STORE], "readwrite");
          const store = transaction.objectStore(LESSONS_STORE);

          const request = store.put({
            ...lesson,
            downloadedAt: Date.now(),
          });

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            resolve(false);
          };
        } catch (error) {
          console.error("Error downloading lesson:", error);
          resolve(false);
        }
      });
    },
    [db]
  );

  // Get offline lesson
  const getOfflineLesson = useCallback(
    async (lessonId: number): Promise<OfflineLesson | null> => {
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([LESSONS_STORE], "readonly");
          const store = transaction.objectStore(LESSONS_STORE);
          const request = store.get(lessonId);

          request.onsuccess = () => {
            resolve(request.result || null);
          };

          request.onerror = () => {
            resolve(null);
          };
        } catch (error) {
          console.error("Error getting offline lesson:", error);
          resolve(null);
        }
      });
    },
    [db]
  );

  // Get all offline lessons
  const getAllOfflineLessons = useCallback(async (): Promise<OfflineLesson[]> => {
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([LESSONS_STORE], "readonly");
        const store = transaction.objectStore(LESSONS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          resolve([]);
        };
      } catch (error) {
        console.error("Error getting all offline lessons:", error);
        resolve([]);
      }
    });
  }, [db]);

  // Save offline progress
  const saveOfflineProgress = useCallback(
    async (progress: OfflineProgress): Promise<boolean> => {
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([PROGRESS_STORE], "readwrite");
          const store = transaction.objectStore(PROGRESS_STORE);

          const request = store.put({
            ...progress,
            lastReviewed: Date.now(),
          });

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = () => {
            resolve(false);
          };
        } catch (error) {
          console.error("Error saving offline progress:", error);
          resolve(false);
        }
      });
    },
    [db]
  );

  // Get offline progress
  const getOfflineProgress = useCallback(
    async (lessonId: number): Promise<OfflineProgress | null> => {
      if (!db) return null;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([PROGRESS_STORE], "readonly");
          const store = transaction.objectStore(PROGRESS_STORE);
          const request = store.get(lessonId);

          request.onsuccess = () => {
            resolve(request.result || null);
          };

          request.onerror = () => {
            resolve(null);
          };
        } catch (error) {
          console.error("Error getting offline progress:", error);
          resolve(null);
        }
      });
    },
    [db]
  );

  // Delete offline lesson
  const deleteOfflineLesson = useCallback(
    async (lessonId: number): Promise<boolean> => {
      if (!db) return false;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction([LESSONS_STORE, PROGRESS_STORE], "readwrite");

          const lessonsStore = transaction.objectStore(LESSONS_STORE);
          const progressStore = transaction.objectStore(PROGRESS_STORE);

          const deleteLesson = lessonsStore.delete(lessonId);
          const deleteProgress = progressStore.delete(lessonId);

          deleteLesson.onsuccess = () => {
            resolve(true);
          };

          deleteLesson.onerror = () => {
            resolve(false);
          };
        } catch (error) {
          console.error("Error deleting offline lesson:", error);
          resolve(false);
        }
      });
    },
    [db]
  );

  // Clear all offline data
  const clearAllOfflineData = useCallback(async (): Promise<boolean> => {
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([LESSONS_STORE, PROGRESS_STORE], "readwrite");

        const lessonsStore = transaction.objectStore(LESSONS_STORE);
        const progressStore = transaction.objectStore(PROGRESS_STORE);

        lessonsStore.clear();
        progressStore.clear();

        transaction.oncomplete = () => {
          resolve(true);
        };

        transaction.onerror = () => {
          resolve(false);
        };
      } catch (error) {
        console.error("Error clearing offline data:", error);
        resolve(false);
      }
    });
  }, [db]);

  return {
    isInitialized,
    downloadLesson,
    getOfflineLesson,
    getAllOfflineLessons,
    saveOfflineProgress,
    getOfflineProgress,
    deleteOfflineLesson,
    clearAllOfflineData,
  };
}
