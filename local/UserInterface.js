import {
  downloadFileToClient,
  imageToBlob,
  saveProjectFile,
  readProjectFile,
} from "./functions.js";

export default class UserInterface {
  constructor() {
    this.uiPanelContainer = "div.uiPanel";

    this.uiClickElements = [
      {
        title: "Log state",
        active: true,
        class: "getObjects",
        handler: this.getObjects,
      },
      {
        title: "Open",
        active: true,
        class: "openFile",
        handler: this.openFile,
      },
      {
        title: "Backup",
        active: true,
        class: "saveBackup",
        handler: this.saveBackup,
      },
      {
        title: "Download",
        active: true,
        class: "downloadCurrent",
        handler: this.downloadCurrent,
      },
      {
        title: "Duplicate",
        active: true,
        class: "duplicateCurrent",
        handler: this.duplicateCurrent,
      },
      {
        title: "Copy",
        active: false,
        class: "copyCurrent",
        handler: this.copyCurrent,
      },
      {
        title: "Undo",
        active: false,
        class: "undo",
        handler: this.undo,
      },
      {
        title: "Remove",
        active: true,
        class: "removeCurrent",
        handler: this.removeCurrent,
      },
      {
        title: "Clear all",
        active: true,
        class: "clearObjects",
        handler: this.clearObjects,
      },
      {
        title: "bringToFront",
        active: true,
        class: "bringToFront",
        handler: this.bringToFront,
        hidden: true,
      },
      {
        title: "bringForward",
        active: true,
        class: "bringForward",
        handler: this.bringForward,
        hidden: true,
      },
      {
        title: "sendToBack",
        active: true,
        class: "sendToBack",
        handler: this.sendToBack,
        hidden: true,
      },
      {
        title: "sendBackwards",
        active: true,
        class: "sendBackwards",
        handler: this.sendBackwards,
        hidden: true,
      },
    ];

    this.initUserInterface();
  }

  duplicateCurrent() {
    canvas.getActiveObject().clone(function (cloned) {
      canvas.discardActiveObject();

      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
        evented: true,
      });

      if (cloned.type === "activeSelection") {
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
    this.zipInput.click();
  };

  saveBackup() {
    // TODO: remove global canvas usage
    saveProjectFile(canvas);
  }

  async downloadCurrent() {
    const file = canvas.getActiveObject().file;
    const fileBlob = await imageToBlob(file.imageElement);
    downloadFileToClient(fileBlob, "testSave.png", "image/png");
  }

  undo() {
    alert("need to implement undo");
  }

  copyCurrent() {
    alert("need to implement copyCurrent");
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

  initUserInterface() {
    // Build required DOM elements
    this.zipInput = document.createElement("input");
    this.zipInput.accept = ".flow";
    this.zipInput.type = "file";
    this.zipInput.addEventListener("change", readProjectFile);

    // "Button - click" type of UI
    const uiPanelContainerElm = document.querySelector(this.uiPanelContainer);
    this.uiClickElements.forEach((uiObj) => {
      if (!uiObj.hidden) {
        const button = document.createElement("button");
        button.classList.add(uiObj.class);
        button.innerText = uiObj.title;
        if (!uiObj.active) {
          button.setAttribute("disabled", "true");
        }

        uiPanelContainerElm.appendChild(button);

        button.addEventListener("click", uiObj.handler);
      }
    });
  }
}
