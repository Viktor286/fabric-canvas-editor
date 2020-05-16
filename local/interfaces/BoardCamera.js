export default class BoardCamera {
  constructor() {
    // canvas.zoomToPoint({x: 54, y:223}, 1)
    // canvas.zoomToPoint({x:0, y:0}, 2)
    // ladder = [1,]
  }

  zoomIn() {
    this.zoomController({ duration: 0.5, direction: 'in' });
  }

  zoomOut() {
    this.zoomController({ duration: 0.5, direction: 'out' });
  }

  zoomController({ duration, direction }) {
    let zoom = { level: canvas.getZoom() };
    let step = 10;

    if (zoom.level > 200) {
      if (direction === 'in') {
        step = 0;
      }
    }

    if (zoom.level < 200) {
      step = 10;
    }

    if (zoom.level < 30) {
      step = 5;
    }

    if (zoom.level < 10) {
      step = 1;
    }

    if (zoom.level < 6) {
      step = 0.5;
    }

    if (zoom.level < 3) {
      step = 0.3;
    }

    if (zoom.level < 1) {
      step = 0.1;
    }

    if (zoom.level < 0.5) {
      step = 0.05;
    }

    if (zoom.level < 0.1) {
      step = 0.01;
    }

    if (zoom.level < 0.03) {
      if (direction === 'out') {
        step = 0;
      }
    }

    const targetLevel = direction === 'in' ? canvas.getZoom() + step : canvas.getZoom() - step;

    console.log('targetLevel', targetLevel);

    gsap.ticker.fps(30);
    gsap.to(zoom, {
      duration,
      ease: 'power2.out', // sine.inOut
      level: targetLevel,
      onUpdate: () => {
        canvas.setZoom(zoom.level);
      },
    });
  }
}
