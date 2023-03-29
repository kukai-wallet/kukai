import Dexie from 'dexie';

const db: any = new Dexie('Kukai');
db.version(1).stores({
  key_value_store: 'key'
});

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
export { saveToKvDb, getFromKvDb };
