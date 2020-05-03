// window, canvas, localforage
import FabricBridge from './interfaces/FabricBridge.js';
import BrowserStore from './interfaces/BrowserStore.js';

import UserControls from './UserControls.js';

window.canvas = new fabric.Canvas('canvas');

const fabricBridge = new FabricBridge();
const browserStore = new BrowserStore();

// Is it possible to save whole DOM images collection as html?
// AssetManager -- controller between IndexDB and Backup save/restore

// TODO: 1. Need a DatalessJSON with AssetLoader from localDB (from remote server in perspective)
// TODO: 2. Need an AssetManager which can backup "board" as board.zip -> Canvas.json + files

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
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: 'red',
  }),
);
