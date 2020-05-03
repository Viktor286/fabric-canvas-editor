export default class BrowserStore {
  constructor() {
    localforage.setDriver(localforage.INDEXEDDB);
  }

  async logKeys() {
    const keys = await localforage.keys();
    console.log('localforage keys is: ', keys);
  }

  saveFileIntoBrowserStore(fileName, blobFile) {
    localforage
      .setItem(fileName, blobFile)
      .then(function (image) {
        console.log('File saved In Browser ', image);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
}
