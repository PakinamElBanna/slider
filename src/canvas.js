import { slideUrls } from "./slides";

export function initializeCanvas() {
  const canvas = document.getElementById("slider");
  const ctx = canvas.getContext("2d");

  let canvasWidth, canvasHeight;

  let slides = [];
  let loadedIndices = new Set();

  let offsetX = 0;
  let startX = 0;
  let isDragging = false;

  function drawContain(image, slideIndex) {
    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;
    let scaledWidth, scaledHeight;

    if (imageAspectRatio > canvasAspectRatio) {
      scaledWidth = canvasWidth;
      scaledHeight = canvasWidth / imageAspectRatio;
    } else {
      scaledWidth = canvasHeight * imageAspectRatio;
      scaledHeight = canvasHeight;
    }

    const slideStartX = slideIndex * canvasWidth + offsetX;
    const centeredImageX = slideStartX + (canvasWidth - scaledWidth) / 2;
    const centeredImageY = (canvasHeight - scaledHeight) / 2;

    ctx.drawImage(
      image,
      centeredImageX,
      centeredImageY,
      scaledWidth,
      scaledHeight
    );
  }

  function drawImages() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    slides.forEach((img, index) => {
      if (img) drawContain(img, index);
    });
  }

  async function loadImage(index) {
    if (loadedIndices.has(index)) return slides[index]; // not checking if index < 0 and index >= slideUrls.length since we dont have next and previous button. Keeping it simple for now
    return new Promise((resolve) => {
      const img = new Image();
      img.src = slideUrls[index];
      img.onload = () => {
        slides[index] = img;
        loadedIndices.add(index);
        resolve(img);
      };
    });
  }

  async function lazyLoadImages(currentIndex) {
    await Promise.all([loadImage(currentIndex), loadImage(currentIndex + 1)]);
    drawImages();
  }
  async function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const firstImage = slides[0] || (await loadImage(0));
    if (!firstImage) return;
    const imageAspectRatio = firstImage.width / firstImage.height;

    const canvasRect = canvas.getBoundingClientRect();
    canvasWidth = canvasRect.width;
    canvasHeight = canvasWidth / imageAspectRatio;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawImages();
  }

  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

  lazyLoadImages(0);

  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const movementX = e.clientX - startX;
    const newOffsetX = offsetX + movementX;
    const leftDraggingOffset = -(slideUrls.length - 1);

    const minOffsetX = leftDraggingOffset * canvasWidth; // using canvasWidth is only valid because of the drawContain function
    const maxOffsetX = 0;

    if (newOffsetX > maxOffsetX || newOffsetX < minOffsetX) return;

    offsetX = newOffsetX;
    startX = e.clientX;

    const currentIndex = Math.floor(-offsetX / canvasWidth); // again, this assumption is only possible because of the scaling to canvas width

    lazyLoadImages(currentIndex);

    drawImages();
  });

  canvas.addEventListener("pointerup", (e) => {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointercancel", (e) => {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  });
}
