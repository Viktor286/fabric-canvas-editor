export default class FilesIO {
  static createProjectFileInput() {
    const projectFileInput = document.createElement('input');
    projectFileInput.accept = '.flow';
    projectFileInput.type = 'file';
    return projectFileInput;
  }

  static downloadFileToClient(data, filename, type) {
    const file = new Blob([data], { type: type });
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  static async getBlobFromImageURL(HTMLImageElement) {
    // Todo: fallback to "convertImageElementToBlob"?
    const request = await fetch(HTMLImageElement.src);
    return request.blob();
  }

  static convertImageElementToBlob(HTMLImageElement) {
    return new Promise((resolve) => {
      let tempCanvas = document.createElement('canvas');
      tempCanvas.width = HTMLImageElement.width;
      tempCanvas.height = HTMLImageElement.height;
      let context = tempCanvas.getContext('2d');
      context.drawImage(HTMLImageElement, 0, 0);

      tempCanvas.toBlob((blob) => {
        tempCanvas = undefined;
        context = undefined;
        resolve(blob);
      });
    });
  }

  static async retrieveImageFromClipboardAsBlob(pasteEvent, onLoadImageFromClipboard) {
    // General pipeline:
    // clipboardData.items comes as DataTransferItemList
    // dataTransferItem.getAsFile() -> File
    // File -> ObjectURL
    // ObjectURL placed into Image
    // After Image.onload the image itself could be used by canvas

    const clipboardDataItems = pasteEvent.clipboardData.items;

    // In case of "dragged files" or "files from buffer"
    // "clipboardData.items" will be "DataTransferItemList"
    // -- we can't see items of the list in console, the length will be 0
    // methods of "DataTransferItemList" is not well supported (Android, Mac)
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
    if (clipboardDataItems instanceof DataTransferItemList) {
      // DataTransferItemList.length not supported on Mobile and Safari Desktop
      for (let i = 0; i < clipboardDataItems.length; i++) {
        const dataTransferItem = clipboardDataItems[i];

        // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
        if (dataTransferItem.type.indexOf('image') === -1) continue;

        const imageFile = dataTransferItem.getAsFile();
        // File can also be represent as: stream, text, arrayBuffer (last two via stream reading)
        // File instanceof Blob === true
        // https://developer.mozilla.org/en-US/docs/Web/API/File

        // Convert file to blob to have exactly same
        // blob hashes in Blob URL Store and app reference
        const buffer = await imageFile.arrayBuffer();
        return new Blob([buffer], { type: 'image/png' });
      }
    }
  }

  static saveImageToBlobStore(blob) {
    return new Promise((resolve) => {
      const imageObjectURL = window.URL.createObjectURL(blob);
      const imageElement = new Image();
      imageElement.setAttribute('src', imageObjectURL);
      imageElement.onload = () => {
        resolve(imageElement);
      };
    });
  }
}
