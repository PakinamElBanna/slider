import { slideUrls, fallbackUrls } from "./slides";
import {
  drawImageContained,
  drawErrorPlaceholder,
  loadImage,
} from "./utils/imageUtils";
import {
  setupCanvasForDPR,
  calculateBoundaries,
  getCurrentSlideIndex,
  getVisibleSlideRange,
} from "./utils/canvasUtils";
import { createScheduler } from "./utils/scheduleUtils";
import { unloadDistantImages, getIndicesToLoad } from "./utils/memoryUtils";

export function initializeCanvas() {
  const canvas = document.getElementById("slider");
  if (!canvas) {
    console.error("Canvas element with id 'slider' not found");
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false });

  const redrawThreshold = 5;

  let canvasWidth, canvasHeight, minOffsetX, maxOffsetX;
  let slides = [];
  let loadedIndices = new Set();
  let offsetX = 0;
  let startX = 0;
  let isDragging = false;

  const scheduleRedraw = createScheduler();

  function updateBoundaries() {
    ({ minOffsetX, maxOffsetX } = calculateBoundaries(
      slideUrls.length,
      canvasWidth
    ));
  }

  function drawVisibleArea() {
    ctx.fillStyle = "lightgray";

    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const { startSlideIndex, endSlideIndex } = getVisibleSlideRange(
      offsetX,
      canvasWidth,
      slideUrls.length
    );

    for (let i = startSlideIndex; i <= endSlideIndex; i++) {
      if (i < 0 || i >= slideUrls.length) continue;

      const slideX = i * canvasWidth + offsetX;
      const img = slides[i];

      if (img) {
        drawImageContained(ctx, img, slideX, 0, canvasWidth, canvasHeight);
      } else if (loadedIndices.has(i)) {
        drawErrorPlaceholder(ctx, slideX, 0, canvasWidth, canvasHeight);
      }
    }
  }

  async function lazyLoadImages(currentIndex) {
    const indicesToLoad = getIndicesToLoad(
      currentIndex,
      slideUrls.length,
      loadedIndices
    );

    const loadedImages = await Promise.all(
      indicesToLoad.map((index) => loadImage(index, slideUrls, fallbackUrls))
    );

    // Update slides array
    indicesToLoad.forEach((index, i) => {
      const img = loadedImages[i];
      slides[index] = img;
      loadedIndices.add(index);
    });

    scheduleRedraw(() => drawVisibleArea());
    unloadDistantImages(slides, loadedIndices, currentIndex);
  }

  async function resizeCanvas() {
    const firstImage =
      slides[0] || (await loadImage(0, slideUrls, fallbackUrls));
    if (!firstImage) return;

    const imageAspectRatio = firstImage.width / firstImage.height;
    const canvasRect = canvas.getBoundingClientRect();

    canvasWidth = canvasRect.width;
    canvasHeight = canvasWidth / imageAspectRatio;

    setupCanvasForDPR(canvas, ctx, canvasWidth, canvasHeight);

    // Use actual CSS size
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;

    updateBoundaries();
    scheduleRedraw(() => drawVisibleArea());
  }

  // Initialize
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  lazyLoadImages(0);

  // Event listeners
  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
    canvas.focus();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const movementX = e.clientX - startX;
    if (Math.abs(movementX) < redrawThreshold) return;

    const newOffsetX = offsetX + movementX;
    if (newOffsetX > maxOffsetX || newOffsetX < minOffsetX) return;

    offsetX = newOffsetX;
    startX = e.clientX;

    const currentIndex = getCurrentSlideIndex(offsetX, canvasWidth);
    lazyLoadImages(currentIndex);
    scheduleRedraw(() => drawVisibleArea());
  });

  canvas.addEventListener("pointerup", (e) => {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointercancel", (e) => {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  });

  window.addEventListener("keydown", (e) => {
    if (document.activeElement !== canvas) return;

    if (e.key === "ArrowRight") {
      const currentIndex = getCurrentSlideIndex(offsetX, canvasWidth);
      const nextIndex = Math.min(currentIndex + 1, slideUrls.length - 1);
      offsetX = -nextIndex * canvasWidth;
      lazyLoadImages(nextIndex);
      scheduleRedraw(() => drawVisibleArea());
    } else if (e.key === "ArrowLeft") {
      const currentIndex = getCurrentSlideIndex(offsetX, canvasWidth);
      const prevIndex = Math.max(currentIndex - 1, 0);
      offsetX = -prevIndex * canvasWidth;
      lazyLoadImages(prevIndex);
      scheduleRedraw(() => drawVisibleArea());
    }
  });
}
