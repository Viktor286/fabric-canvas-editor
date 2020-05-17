export default class BoardCamera {
  constructor() {
    // canvas.zoomToPoint({x: 54, y:223}, 1)
    // canvas.zoomToPoint({x:0, y:0}, 2)
    // ladder = [1,]
    this.animationInProgress = false;
  }

  zoomReset() {
    this.zoomController({ duration: 0.5, targetLevel: 1 });
  }

  zoomIn() {
    this.zoomController({ duration: 0.5, direction: 'in' });
  }

  zoomOut() {
    this.zoomController({ duration: 0.5, direction: 'out' });
  }

  zoomToObject() {
    const targetObject = canvas.getActiveObject();

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

    // gsap.ticker.fps(30);
    let zoom = {
      level: canvas.viewportTransform[0],
      x: canvas.viewportTransform[4],
      y: canvas.viewportTransform[5],
    };

    this.animationInProgress = true;

    gsap.to(zoom, {
      duration: 0.5,
      ease: 'power2.out', // sine.inOut
      level: zoomLevel,
      x: targetPoint.x,
      y: targetPoint.y,
      onUpdate: () => {
        canvas.setViewportTransform([zoom.level, 0, 0, zoom.level, zoom.x, zoom.y]);
      },
      onComplete: () => {
        this.animationInProgress = false;
      },
    });

    // canvas.getVpCenter()
    // canvas.vptCoords
    // canvas.calcViewportBoundaries()
    // canvas.setViewportTransform([1, 0, 0, 1, targetPoint.x, targetPoint.y]);
    // canvas.zoomToPoint({ x: targetPoint.x, y: targetPoint.y }, zoomLevel);
  }

  zoomController({ duration, direction, targetLevel }) {
    if (!this.animationInProgress) {
      let zoom = { level: canvas.getZoom() };
      let step = 10;

      if (zoom.level > 200) {
        if (direction === 'in') {
          step = 0;
        }
      }

      if (zoom.level < 200) {
        step = 20;
      }

      if (zoom.level < 30) {
        step = 10;
      }

      if (zoom.level < 10) {
        step = 2;
      }

      if (zoom.level < 6) {
        step = 1;
      }

      if (zoom.level < 3) {
        step = 0.6;
      }

      if (zoom.level < 1) {
        step = 0.2;
      }

      if (zoom.level < 0.5) {
        step = 0.1;
      }

      if (zoom.level <= 0.1) {
        step = 0.02;
      }

      if (zoom.level <= 0.05) {
        if (direction === 'out') {
          step = 0;
        }
      }

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
          canvas.setZoom(zoom.level);
        },
        onComplete: () => {
          this.animationInProgress = false;
        },
      });
    }
  }
}
