// window, canvas, localforage
export function saveFileToBrowser(blobFile) {
  localforage
    .setItem("photo", blobFile)
    .then(function (image) {
      console.log("File saved In Browser ", image);
    })
    .catch(function (err) {
      // This code runs if there were any errors
      console.log(err);
    });
}

export async function retrieveImageFromClipboardAsBlob(e) {
  // General pipeline:
  // clipboardData.items comes as DataTransferItemList
  // dataTransferItem.getAsFile() -> File
  // File -> ObjectURL
  // ObjectURL placed into Image
  // After Image.onload the image itself could be used by canvas

  const clipboardDataItems = e.clipboardData.items;

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
      if (dataTransferItem.type.indexOf("image") === -1) continue;

      const imageFile = dataTransferItem.getAsFile();
      // File can also be represent as: stream, text, arrayBuffer (last two via stream reading)
      // File instanceof Blob === true
      // https://developer.mozilla.org/en-US/docs/Web/API/File

      // Convert file to blob to have exactly same
      // blob hashes in Blob URL Store and app reference
      const buffer = await imageFile.arrayBuffer();
      const blobImageFile = new Blob([buffer], { type: "image/png" });
      addImageFileToCanvas(blobImageFile);
    }
  }
}

export function addImageFileToCanvas(blobImageFile, options = {}) {
  // File as HTMLImageElement pipeline
  const imageObjectURL = window.URL.createObjectURL(blobImageFile);
  const imageElement = new Image();
  imageElement.setAttribute("src", imageObjectURL);

  // Async after image loads into HTMLImageElement
  imageElement.onload = () => {
    // Ready to init imageElement in app
    const newFabricImage = new fabric.Image(imageElement, options);

    // Extend file data
    newFabricImage.file = {
      hash: md5(blobImageFile),
      size: blobImageFile.size,
      type: blobImageFile.type,
      blobUrlStore: imageObjectURL,
    };

    canvas.add(newFabricImage); // { HTMLImageElement|String(query selector) }, { options }

    // Looks like we can't release this imageObjectURL since app will still use it
    // window.URL.revokeObjectURL(imageObjectURL);
  };
}
