// window, canvas, localforage
import {
  retrieveImageFromClipboardAsBlob,
  addImageFileToCanvas,
} from "./functions.js";

import UserInterface from "./UserInterface.js";

localforage.setDriver(localforage.INDEXEDDB);

// Is it possible to save whole thing as html?
// AssetManager -- controller between IndexDB and Backup save/restore

// TODO: 1. Need a DatalessJSON with AssetLoader from localDB (from remote server in perspective)

// TODO: 2. Need an AssetManager which can backup "board" as board.zip -> Canvas.json + files

// We can extend fabric.Image object with
// (md5)hash "b9e739a2ad26d3a6bdcfdad8375eda4e" which will be key for localDB and filename for Backup/server
// const newBlob = await imageToBlob(canvas.item(2)._originalElement);

// Post-MVP, optimization:
// next step will be to compress png blobs

async function main() {
  const userInterface = new UserInterface();

  const keys = await localforage.keys();

  console.log("localforage keys is: ", keys);

  // Test to load image from IndexDB and add it to canvas
  try {
    const blobFile = await localforage.getItem("photo");
    console.log("blobFile from indexdb", blobFile);
    addImageFileToCanvas(blobFile, {
      left: 54,
      top: 233,
      scaleX: 0.32,
      scaleY: 0.32,
    });
  } catch (err) {
    console.log(err);
  }
}

main().then(() => console.log("main initiated"));

window.addEventListener(
  "paste",
  function (e) {
    console.log("paste event ", e);

    if (e.clipboardData === false) {
      return;
    }

    retrieveImageFromClipboardAsBlob(e);
  },
  false
);

// Global functions for test

function ejectCanvasToPage(canvasElement) {
  canvasElement.toBlob((blob) => {
    const imageObjectURL = window.URL.createObjectURL(blob);
    const imageElement = new Image();
    imageElement.setAttribute("src", imageObjectURL);
    imageElement.onload = () => {
      document.body.appendChild(imageElement);
    };
  });
}

function ejectBlobToPage(blob) {
  const imageObjectURL = window.URL.createObjectURL(blob);
  const imageElement = new Image();
  imageElement.setAttribute("src", imageObjectURL);
  imageElement.onload = () => {
    document.body.appendChild(imageElement);
  };
}

function ejectImgToPage(img) {
  document.body.appendChild(img);
}
