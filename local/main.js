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

// if we need to rebuild several objects on canvas, it good to turn off re-render after each position
// canvas.renderOnAddRemove=false
//github.com/fabricjs/fabric.js/wiki/Optimizing-performance#canvasrenderonaddremovefalse-when-adding-many-objects

// Post-MVP, optimization:
// next step will be to compress png blobs for BrowserStore

async function main() {
  const userInterface = new UserControls(fabricBridge);

  browserStore.logKeys();

  // Test to load image from IndexDB and add it to canvas
  try {
    const blobFile = await localforage.getItem('photo');
    console.log('blobFile from indexdb', blobFile);

    await fabricBridge.addImageBlobToCanvas(blobFile, {
      left: 54,
      top: 233,
      scaleX: 0.32,
      scaleY: 0.32,
    });
  } catch (err) {
    console.log(err);
  }
}

main().then(() => console.log('main initiated'));

canvas.add(
  new fabric.Rect({
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    fill: '#333646',
  }),
);
