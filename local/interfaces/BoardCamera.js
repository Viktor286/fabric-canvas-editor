export default class BoardCamera {
  constructor() {
    this.animationInProgress = false;
    canvas.moveCameraTo = this.moveCameraTo;
  }

  getAbsCenterZoomPoint(zoomLevel) {
    const vpCoords = canvas.calcViewportBoundaries();

    const vpAbsWidth = vpCoords.tr.x - vpCoords.bl.x;
    const vpAbsHeight = vpCoords.bl.y - vpCoords.tr.y;

    return {
      x: -((vpCoords.tl.x + vpAbsWidth / 2) * zoomLevel) + canvas.width / 2,
      y: -((vpCoords.tl.y + vpAbsHeight / 2) * zoomLevel) + canvas.height / 2,
    };
  }

  zoomReset() {
    this.moveCameraTo(this.getAbsCenterZoomPoint(1), 1);
  }

  zoomIn() {
    const zoomLevel = this.suggestNextZoomLevel('in');
    this.moveCameraTo(this.getAbsCenterZoomPoint(zoomLevel), zoomLevel);
  }

  zoomOut() {
    const zoomLevel = this.suggestNextZoomLevel('out');
    this.moveCameraTo(this.getAbsCenterZoomPoint(zoomLevel), zoomLevel);
  }

  zoomToObject(targetObject) {
    // Calculate zoom factor
    const zoomFactorWidth = Number((canvas.width / (targetObject.width * targetObject.scaleX)).toFixed(5));
    const zoomFactorHeight = Number((canvas.height / (targetObject.height * targetObject.scaleY)).toFixed(5));
    const optimalZoomLevel = Math.min(...[zoomFactorWidth, zoomFactorHeight]);
    const paddingFactor = (optimalZoomLevel / 100) * 10; // padding 10%
    const zoomLevel = optimalZoomLevel - paddingFactor;

    // Calculate zoom dependant coords
    const halfObjWidth = (targetObject.width * targetObject.scaleX) / 2;
    const halfObjHeight = (targetObject.height * targetObject.scaleY) / 2;

    const targetPoint = {
      x: -((targetObject.left + halfObjWidth) * zoomLevel) + canvas.width / 2,
      y: -((targetObject.top + halfObjHeight) * zoomLevel) + canvas.height / 2,
    };

    this.moveCameraTo({x: targetPoint.x, y: targetPoint.y}, zoomLevel);
  }

  moveCameraTo(targetPoint = {x: 0, y: 0}, targetZoom = 1, duration = 0.5, ease = 'power3.out') {
    let viewport = {
      zoomLevel: canvas.viewportTransform[0],
      x: canvas.viewportTransform[4],
      y: canvas.viewportTransform[5],
    };

    this.animationInProgress = true;

    // optimization ways: turn of filtering during animation
    // make image of the end frame and first (canvas.toDataURL("png");)
    // viewport and zoom lazy loading (object.visible=false -- Shapes outside canvas drawing area still take time to render)
    // Shapes outside canvas drawing area still take time to render

    canvas.selection = false;
    canvas.skipTargetFind = true;
    // canvas.renderOnAddRemove = false;
    // canvas.interactive = false;

    gsap.to(viewport, {
      duration,
      ease,
      zoomLevel: targetZoom,
      x: targetPoint.x,
      y: targetPoint.y,
      onUpdate: () => {
        canvas.setViewportTransform([viewport.zoomLevel, 0, 0, viewport.zoomLevel, viewport.x, viewport.y]);
        // canvas.renderAll.bind(canvas);
      },
      onComplete: () => {
        this.animationInProgress = false;

        canvas.selection = true;
        canvas.skipTargetFind = false;
        // canvas.renderOnAddRemove = true;
        // canvas.interactive = true;
      },
    });
  }

  suggestNextZoomStep(direction) {
    const currentZoomLevel = canvas.getZoom();

    let step = 10;

    if (currentZoomLevel > 200 && direction === 'in') {
      step = 0;
    }

    if (currentZoomLevel < 200) {
      step = 20;
    }

    if (currentZoomLevel < 30) {
      step = 10;
    }

    if (currentZoomLevel < 10) {
      step = 2;
    }

    if (currentZoomLevel < 6) {
      step = 1;
    }

    if (currentZoomLevel < 3) {
      step = 0.6;
    }

    if (currentZoomLevel < 1) {
      step = 0.2;
    }

    if (currentZoomLevel < 0.5) {
      step = 0.1;
    }

    if (currentZoomLevel <= 0.1) {
      step = 0.02;
    }

    if (currentZoomLevel <= 0.05 && direction === 'out') {
      step = 0;
    }

    return step;
  }

  suggestNextZoomLevel(direction) {
    const currentZoomLevel = canvas.getZoom();
    const nextStep = this.suggestNextZoomStep(direction);
    return direction === 'in' ? currentZoomLevel + nextStep : currentZoomLevel - nextStep;
  }
}
