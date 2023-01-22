import {
  IDBDatabase as IDBDatabaseClass,
  indexedDB,
} from "https://deno.land/x/indexeddb@v1.1.0/ponyfill.ts";

import { createDeferredPromise } from "./createDeferredPromise.ts";

type IDBDatabase = typeof IDBDatabaseClass;

const DB_NAME = "MY_DB";
const OBJECT_STORE = "KEY-VALUE";

const initIndexedDB = (dbName: string, objectStoreName: string) => {
  const deferred = createDeferredPromise<IDBDatabase>();
  const dbOpenRequest = indexedDB.open(dbName, 1);
  dbOpenRequest.addEventListener("upgradeneeded", (event: any) => {
    try {
      const db: IDBDatabase = event?.target?.result;
      db.createObjectStore(objectStoreName);
    } catch (e) {
      deferred.reject(e);
    }
  });
  dbOpenRequest.addEventListener("success", (event: any) => {
    deferred.resolve(event?.target?.result);
  });
  dbOpenRequest.addEventListener("error", deferred.reject);

  return deferred.promise;
};

const loadFromIndexedDB = async <T = any>(key: string) => {
  const deferred = createDeferredPromise<T>();
  const db = await initIndexedDB(DB_NAME, OBJECT_STORE);
  const tx = db.transaction(OBJECT_STORE);
  const objectStore = tx.objectStore(OBJECT_STORE);
  const request = objectStore.get(key);
  request.addEventListener(
    "success",
    () => deferred.resolve(request.result),
  );
  request.addEventListener("error", deferred.reject);
  return deferred.promise;
};

const saveToIndexedDB = async <T = any>(key: string, value: T) => {
  const deferred = createDeferredPromise<unknown>();
  const db = await initIndexedDB(DB_NAME, OBJECT_STORE);
  const tx = db.transaction(OBJECT_STORE, "readwrite");
  const objectStore = tx.objectStore(OBJECT_STORE);
  const request = objectStore.put(value, key);
  request.addEventListener("success", deferred.resolve);
  request.addEventListener("error", deferred.reject);
  return deferred.promise;
};

export const indexedDBKeyValue = {
  set: saveToIndexedDB,
  get: loadFromIndexedDB,
};
