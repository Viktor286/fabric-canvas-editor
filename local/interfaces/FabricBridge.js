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

    const hash = await FilesIO.getImageHash(imageBlob);

    return {
      hash,
      size: imageBlob.size,
      type: imageBlob.type,
      blobUrlStore: imageElement.src,
      imageElement,
    };
  }

  static getFabricAppState() {
    // Minimal field set
    // const exportFields = [
    //   'aCoords',
    //   'oCoords',
    //   'top',
    //   'left',
    //   'height',
    //   'width',
    //   'translateX',
    //   'translateY',
    //   'scaleX',
    //   'scaleY',
    //   'file',
    //   'filters',
    //   'stroke',
    //   'src',
    // ];
    return canvas.toObject(['file']);
    // return canvas.toJSON(['file']);
  }
}
