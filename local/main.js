// window, canvas, localforage
import FabricBridge from './interfaces/FabricBridge.js';
import BrowserStore from './interfaces/BrowserStore.js';

import UserControls from './UserControls.js';

window.canvas = new fabric.Canvas('canvas');

const fabricBridge = new FabricBridge();
const browserStore = new BrowserStore();

// Is it possible to save whole DOM images collection as html?
// AssetManager -- controller between IndexDB and Backup save/restore

// TODO: 1. ProjectManager/ProjectLoader (From file, browserStore, remote server)
// TODO: 2. AssetManager/AssetLoader (From file, browserStore, remote server)

// TODO: 0. Setup support fabricImage.file object
// Add project title(wire to filename?) and id to manage opening and cache of projects

// toObject --  Returns object representation of an instance
// include param into object representation temp1.toObject(['file'])

// on a class level there is "stateProperties" field that keep config for exporting props
// src\shapes\image.class.js:stateProperties
// TODO: looks like we need to extend image class in the FabricBridge

// if we need to rebuil several objects on canvas, it good to turn off re-render after each position
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
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: 'red',
  }),
);
