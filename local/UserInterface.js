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
