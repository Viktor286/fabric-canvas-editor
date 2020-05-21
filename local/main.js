// window, canvas, localforage
import FabricBridge from './interfaces/FabricBridge.js';
import BrowserStore from './interfaces/BrowserStore.js';

import UserControls from './UserControls.js';

window.canvas = new fabric.Canvas('canvas');
// window.canvas.includeDefaultValues = false;
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = 'white';
fabric.Object.prototype.cornerStrokeColor = '#5f9ae2';
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.borderScaleFactor = 1;
fabric.Object.prototype.cornerSize = 10;
fabric.Object.prototype.hasRotatingPoint = false;
// fabric.Image.prototype.minimumScaleTrigger = 0;
fabric.Image.prototype._controlsVisibility = {
  bl: true,
  br: true,
  mb: false,
  ml: false,
  mr: false,
  mt: false,
  mtr: true,
  tl: true,
  tr: true,
};

const fabricBridge = new FabricBridge();
const browserStore = new BrowserStore();

async function main() {
  const userInterface = new UserControls(fabricBridge);
  browserStore.logKeys();

  try {
    const blobFile = await localforage.getItem('photo');

    await fabricBridge.addImageBlobToCanvas(blobFile, {
      left: 54,
      top: 233,
      scaleX: 0.32,
      scaleY: 0.32,
    });
  } catch (err) {
    console.error(err);
  }
}

main().then(() => console.log('main initiated'));
