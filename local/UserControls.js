import FilesIO from './interfaces/FilesIO.js';
import Project from './interfaces/Project.js';
import BoardCamera from './interfaces/BoardCamera.js';

export default class UserControls {
  constructor(fabricBridge) {
    this.fabricBridge = fabricBridge;
    this.uiPanelContainer = 'div.uiPanel';

    this.boardCamera = new BoardCamera();

    this.uiClickElements = [
      {
        title: 'Save',
        active: true,
        class: 'saveProject',
        handler: this.saveProject,
      },
      {
        title: 'Open',
        active: true,
        class: 'openFile',
        handler: this.openFile,
      },
      {
        title: 'Log state',
        active: true,
        class: 'getObjects',
        handler: this.getObjects,
      },
      {
        title: 'Zoom In',
        active: true,
        class: 'zoomIn',
        handler: this.zoomIn,
      },
      {
        title: 'Zoom Out',
        active: true,
        class: 'zoomOut',
        handler: this.zoomOut,
      },
      {
        title: 'Zoom 100%',
        active: true,
        class: 'zoom100',
        handler: this.zoomReset,
      },
      {
        title: 'Zoom To Active Object',
        active: true,
        class: 'zoomToActiveObject',
        handler: this.zoomToActiveObject,
      },
      {
        title: 'Duplicate*',
        active: true,
        class: 'duplicateCurrent',
        handler: this.duplicateCurrent,
      },
      {
        title: 'Copy',
        active: false,
        class: 'copyCurrent',
        handler: this.copyCurrent,
      },
      {
        title: 'Download',
        active: true,
        class: 'downloadCurrent',
        handler: this.downloadCurrent,
      },
      {
        title: 'Undo',
        active: false,
        class: 'undo',
        handler: this.undo,
      },
      {
        title: 'Remove',
        active: true,
        class: 'removeCurrent',
        handler: this.removeCurrent,
      },
      {
        title: 'Clear all',
        active: true,
        class: 'clearObjects',
        handler: this.clearObjects,
      },
      {
        title: 'bringToFront',
        active: true,
        class: 'bringToFront',
        handler: this.bringToFront,
        hidden: true,
      },
      {
        title: 'bringForward',
        active: true,
        class: 'bringForward',
        handler: this.bringForward,
        hidden: true,
      },
      {
        title: 'sendToBack',
        active: true,
        class: 'sendToBack',
        handler: this.sendToBack,
        hidden: true,
      },
      {
        title: 'sendBackwards',
        active: true,
        class: 'sendBackwards',
        handler: this.sendBackwards,
        hidden: true,
      },
    ];

    this.initUserInterface();
  }

  initUserInterface() {
    // Build required DOM elements
    this.projectFileInput = FilesIO.createProjectFileInput();
    this.projectFileInput.addEventListener('change', Project.readProjectFile);

    // "Button - click" type of UI
    const uiPanelContainerElm = document.querySelector(this.uiPanelContainer);
    this.uiClickElements.forEach((uiObj) => {
      if (!uiObj.hidden) {
        const button = document.createElement('button');
        button.classList.add(uiObj.class);
        button.innerText = uiObj.title;
        if (!uiObj.active) {
          button.setAttribute('disabled', 'true');
        }

        uiPanelContainerElm.appendChild(button);

        button.addEventListener('click', uiObj.handler);
      }
    });

    // Other User Interaction side effects
    window.addEventListener(
      'paste',
      async (pasteEvent) => {
        if (pasteEvent.clipboardData === false) {
          return;
        }

        const imageBlob = await FilesIO.retrieveImageFromClipboardAsBlob(pasteEvent);

        this.fabricBridge.addImageBlobToCanvas(imageBlob).then(() => {
          // TODO: make UI notification interface for that
          // console.log('imageBlob pasted');
        });
      },
      false,
    );

    window.document.body.addEventListener('drop', async (ev) => {
      ev.preventDefault();
      const imageBlobArr = await FilesIO.retrieveImageOnDragDrop(ev);
      imageBlobArr.forEach((imageBlob, idx) => {
        this.fabricBridge.addImageBlobToCanvas(imageBlob).then(() => {
          // TODO: make UI notification interface for that
          // console.log('imageBlob pasted');
        });
      });
    });

    window.document.body.addEventListener('click', (e) => {
      // getMouseCoords
      // http://fabricjs.com/docs/fabric.Canvas.html#getPointer
      // console.log(
      //   `Relative Coords (ignoring zoom): `,
      //   canvas.getPointer(e, true).x,
      //   canvas.getPointer(e, true).y,
      // );
      // console.log(`Absolute Coords (with zoom): `, canvas.getPointer(e).x, canvas.getPointer(e).y);
    });
  }

  zoomIn = () => {
    this.boardCamera.zoomIn();
  };

  zoomOut = () => {
    this.boardCamera.zoomOut();
  };

  zoomReset = () => {
    this.boardCamera.zoomReset();
  };

  zoomToActiveObject = () => {
    this.boardCamera.zoomToObject(canvas.getActiveObject());
  };

  duplicateCurrent() {
    canvas.getActiveObject().clone(function (cloned) {
      canvas.discardActiveObject();

      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
        evented: true,
      });

      if (cloned.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        cloned.canvas = canvas;
        cloned.forEachObject(function (obj) {
          canvas.add(obj);
        });
        // this should solve the unselectability
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }

      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  }

  openFile = () => {
    this.projectFileInput.click();
  };

  saveProject() {
    // TODO: remove global canvas usage
    Project.saveProjectFile(canvas).then((data) => {
      console.log('saveProjectFile finished', data);
    });
  }

  async downloadCurrent() {
    const file = canvas.getActiveObject().file;
    const fileBlob = await FilesIO.getBlobFromImageURL(file.imageElement);
    FilesIO.downloadFileToClient(fileBlob, 'testSave.png', 'image/png');
  }

  undo() {
    alert('need to implement undo');
  }

  copyCurrent() {
    alert('need to implement copyCurrent');
  }

  removeCurrent() {
    canvas.remove(canvas.getActiveObject());
  }

  getObjects() {
    console.log(canvas.getObjects());
  }

  clearObjects() {
    canvas.clear();
  }

  bringToFront() {
    canvas.getActiveObject().bringToFront();
  }

  bringForward() {
    canvas.getActiveObject().bringForward();
  }

  sendToBack() {
    canvas.getActiveObject().sendToBack();
  }

  sendBackwards() {
    canvas.getActiveObject().sendBackwards();
  }
}
