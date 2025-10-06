import { slideUrls } from "./slides";

export function initializeCanvas() {
  const canvas = document.getElementById("slider");
  const ctx = canvas.getContext("2d");

  let canvasWidth, canvasHeight;

  let slides = [];
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

    slides.forEach((img, index) => drawContain(img, index));
  }

  async function loadSlides() {
    slides = await Promise.all(
      slideUrls.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
        });
      })
    );

    drawImages();
  }

  async function loadFirstImage() {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = slideUrls[0];
      img.onload = () => resolve(img);
    });
  }

  async function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const firstImage = await loadFirstImage();
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

  loadSlides();

  canvas.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    const movementX = e.clientX - startX;
    const newOffsetX = offsetX + movementX;
    const leftDraggingOffset = -(slides.length - 1);

    const minOffsetX = leftDraggingOffset * canvasWidth; // using canvasWidth is only valid because of the drawContain function
    const maxOffsetX = 0;

    if (newOffsetX > maxOffsetX || newOffsetX < minOffsetX) return;

    offsetX = newOffsetX;
    startX = e.clientX;

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
