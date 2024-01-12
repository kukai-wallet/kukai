import Dexie from 'dexie';

const db: any = new Dexie('Kukai');
const wc_db: any = new Dexie('WALLET_CONNECT_V2_INDEXED_DB');
db.version(1).stores({
  key_value_store: 'key'
});

const dbExist = async (dbName: string, version = 1) => {
  let newDb = false;
  await ((): Promise<void> => {
    return new Promise((resolve) => {
      const req = indexedDB.open(dbName, version);
      req.onupgradeneeded = () => {
        req.transaction.abort();
        newDb = true;
        resolve();
      };
      req.onsuccess = () => {
        resolve();
      };
    });
  })();
  return newDb;
};

const saveToKvDb = async (key: string, value: any): Promise<void> => {
  return new Promise((resolve) => {
    if (db.key_value_store) db.key_value_store.clear();
    db.key_value_store.add({ key: key, value }).then(() => {
      resolve();
    });
  });
};
const getFromKvDb = async (key: string): Promise<any> => {
  const key_value_store = await db.key_value_store.where('key').equals(key).toArray();
  if (key_value_store && key_value_store.length > 0) {
    return key_value_store[0].value;
  }
  return null;
};
const readWcDb = async (key: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const indexedDB: any = window['indexedDB'] || window['mozIndexedDB'] || window['webkitIndexedDB'] || window['msIndexedDB'] || window['shimIndexedDB'];
    if (await dbExist('WALLET_CONNECT_V2_INDEXED_DB')) {
      console.log('wc db doesnt exist yet');
      return null;
    }
    const open = indexedDB.open('WALLET_CONNECT_V2_INDEXED_DB', 1);
    open.onerror = (event) => {
      console.error(event);
      reject(event);
    };
    open.onsuccess = (event) => {
      const db = open.result;
      const tx = db.transaction(['keyvaluestorage'], 'readwrite');
      const store = tx.objectStore('keyvaluestorage');
      const value = store.get(key);
      value.onerror = (event) => {
        console.error(event);
        reject(event);
      };
      value.onsuccess = (event) => {
        if (value?.result) {
          resolve(value?.result);
        } else {
          console.error(`No value found for key: ${key}`);
          reject();
        }
      };
      tx.oncomplete = (event) => {
        db.close();
      };
    };
  });
};
export { saveToKvDb, getFromKvDb, readWcDb };
