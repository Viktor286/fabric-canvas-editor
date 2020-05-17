export default class BoardCamera {
  constructor() {
    // canvas.zoomToPoint({x: 54, y:223}, 1)
    // canvas.zoomToPoint({x:0, y:0}, 2) -- not absolute ToPoint!!

    // canvas.getVpCenter()
    // canvas.vptCoords
    // canvas.calcViewportBoundaries()
    // canvas.setViewportTransform([1, 0, 0, 1, targetPoint.x, targetPoint.y]);
    // canvas.zoomToPoint({ x: targetPoint.x, y: targetPoint.y }, zoomLevel);

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

    this.moveCameraTo({ x: targetPoint.x, y: targetPoint.y }, zoomLevel);
  }

  moveCameraTo(targetPoint = { x: 0, y: 0 }, targetZoom = 1, duration = 0.5, ease = 'power2.out') {
    let viewport = {
      zoomLevel: canvas.viewportTransform[0],
      x: canvas.viewportTransform[4],
      y: canvas.viewportTransform[5],
    };

    this.animationInProgress = true;

    // gsap.ticker.fps(30);
    gsap.to(viewport, {
      duration,
      ease,
      zoomLevel: targetZoom,
      x: targetPoint.x,
      y: targetPoint.y,
      onUpdate: () => {
        canvas.setViewportTransform([viewport.zoomLevel, 0, 0, viewport.zoomLevel, viewport.x, viewport.y]);
      },
      onComplete: () => {
        this.animationInProgress = false;
      },
    });
  }

  suggestNextZoomStep(direction) {
    const currentZoomLevel = canvas.getZoom();

    let step = 10;

    if (currentZoomLevel > 200) {
      if (direction === 'in') {
        step = 0;
      }
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

    if (currentZoomLevel <= 0.05) {
      if (direction === 'out') {
        step = 0;
      }
    }

    return step;
  }

  suggestNextZoomLevel(direction) {
    const currentZoomLevel = canvas.getZoom();
    const nextStep = this.suggestNextZoomStep(direction);

    return direction === 'in' ? currentZoomLevel + nextStep : currentZoomLevel - nextStep;
  }

  zoomController({ duration, direction, targetLevel, resetCoords = false }) {
    return false;
    if (!this.animationInProgress) {
      let zoom = { level: canvas.getZoom() };

      if (!targetLevel) {
        targetLevel =
          direction === 'in'
            ? parseFloat((canvas.getZoom() + step).toFixed(2))
            : parseFloat((canvas.getZoom() - step).toFixed(2));
      }

      // gsap.ticker.fps(30);
      this.animationInProgress = true;
      gsap.to(zoom, {
        duration,
        ease: 'power2.out', // sine.inOut
        level: targetLevel,
        onUpdate: () => {
          if (resetCoords) {
            canvas.zoomToPoint({ x: 0, y: 0 }, zoom.level);
          } else {
            canvas.setZoom(zoom.level);
          }
        },
        onComplete: () => {
          this.animationInProgress = false;
        },
      });
    }
  }
}
