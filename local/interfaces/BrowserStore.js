export default class BrowserStore {
  constructor() {
    localforage.setDriver(localforage.INDEXEDDB);
  }

  async logKeys() {
    const keys = await localforage.keys();
  }

  saveFileIntoBrowserStore(fileName, blobFile) {
    localforage
      .setItem(fileName, blobFile)
      .then(function (image) {})
      .catch(function (err) {
        console.error(err);
      });
  }
}
