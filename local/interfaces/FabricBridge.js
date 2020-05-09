import FilesIO from './FilesIO.js';

export default class FabricBridge {
  constructor() {
    this.fabricCanvas = window.canvas;
    this.fabricObject = window.fabric;
  }

  async addImageBlobToCanvas(imageBlob, options = {}) {
    const imageElement = await FilesIO.saveImageToBlobStore(imageBlob);

    const fabricImage = new this.fabricObject.Image(imageElement, options);
    fabricImage.file = await FabricBridge.constructImageFileData(imageElement, imageBlob);
    this.fabricCanvas.add(fabricImage);
  }

  static async constructImageFileData(imageElement, imageBlob) {
    if (!imageBlob) {
      imageBlob = await FilesIO.getBlobFromImageURL(imageElement);
    }

    return {
      hash: md5(imageBlob),
      size: imageBlob.size,
      type: imageBlob.type,
      blobUrlStore: imageElement.src,
      imageElement,
    };
  }
}
