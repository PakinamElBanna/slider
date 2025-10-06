export function setupCanvasForDPR(canvas, ctx, width, height) {
  const dpr = window.devicePixelRatio || 1;

  if (!canvas.style.width || !canvas.style.height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  return { width, height };
}

export function calculateBoundaries(slideCount, canvasWidth) {
  const maxSlideLeftOffset = -(slideCount - 1);
  return {
    minOffsetX: maxSlideLeftOffset * canvasWidth,
    maxOffsetX: 0,
  };
}

export function getCurrentSlideIndex(offsetX, canvasWidth) {
  return Math.floor(-offsetX / canvasWidth);
}

export function getVisibleSlideRange(offsetX, canvasWidth, totalSlides) {
  const startSlideIndex = Math.floor(-offsetX / canvasWidth);
  const endSlideIndex = Math.min(startSlideIndex + 2, totalSlides - 1);
  return { startSlideIndex, endSlideIndex };
}
