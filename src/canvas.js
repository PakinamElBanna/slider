import { slideUrls, fallbackUrls } from "./slides";

export function initializeCanvas() {
  const canvas = document.getElementById("slider");
  const ctx = canvas.getContext("2d");
  const redrawThreshold = 5;

  let canvasWidth, canvasHeight, minOffsetX, maxOffsetX;

  let slides = [];
  let loadedIndices = new Set();

  let offsetX = 0;
  let startX = 0;
  let isDragging = false;

  function updateBoundaries() {
    const maxSlideLeftOffset = -(slideUrls.length - 1);
    minOffsetX = maxSlideLeftOffset * canvasWidth; // using canvasWidth is only valid because of the drawContain function
    maxOffsetX = 0;
  }

  function unloadImages(currentIndex) {
    const cacheRange = 3;
    loadedIndices.forEach((index) => {
      if (
        index < currentIndex - cacheRange ||
        index > currentIndex + cacheRange
      ) {
        delete slides[index];
        loadedIndices.delete(index);
      }
    });
  }

  function drawContain(image, slideIndex) {
    let scaledWidth, scaledHeight;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    if (image === null) {
      scaledWidth = canvasWidth;
      scaledHeight = canvasHeight;
    } else {
      const imageAspectRatio = image.width / image.height;

      if (imageAspectRatio > canvasAspectRatio) {
        scaledWidth = canvasWidth;
        scaledHeight = canvasWidth / imageAspectRatio;
      } else {
        scaledWidth = canvasHeight * imageAspectRatio;
        scaledHeight = canvasHeight;
      }
    }

    const slideStartX = slideIndex * canvasWidth + offsetX;
    const centeredImageX = slideStartX + (canvasWidth - scaledWidth) / 2;
    const centeredImageY = (canvasHeight - scaledHeight) / 2;

    if (image) {
      ctx.drawImage(
        image,
        centeredImageX,
        centeredImageY,
        scaledWidth,
        scaledHeight
      );
    } else {
      ctx.fillStyle = "rgb(212, 209, 209)";
      ctx.fillRect(centeredImageX, centeredImageY, scaledWidth, scaledHeight);
      ctx.fillStyle = "rgb(148, 146, 146)";
      ctx.font = "12px";
      ctx.textAlign = "center";
      ctx.fillText(
        "Image unavailable",
        centeredImageX + scaledWidth / 2,
        centeredImageY + scaledHeight / 2
      );
    }
  }

  function drawImages() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    slides.forEach((img, index) => {
      if (loadedIndices.has(index)) {
        drawContain(img, index);
      }
    });
  }

  async function loadImage(index, retries = 3) {
    if (loadedIndices.has(index)) return slides[index]; // not checking if index < 0 and index >= slideUrls.length since we dont have next and previous button. Keeping it simple for now
    return new Promise((resolve) => {
      const attemptLoad = (retryCount, useFallback) => {
        const img = new Image();
        img.src = useFallback ? fallbackUrls[index] : slideUrls[index];
        img.onload = () => {
          slides[index] = img;
          loadedIndices.add(index);
          resolve(img);
        };
        img.onerror = () => {
          if (retryCount > 0) {
            console.warn(
              `Retrying to load image at index ${index}: ${slideUrls[index]} (${retries - retryCount + 1} attempt)`
            );
            attemptLoad(retryCount - 1, useFallback);
          } else if (!useFallback) {
            console.warn(`Switching to fallback for index ${index}`);
            attemptLoad(retries, true);
          } else {
            console.error(
              `Failed to load image at index ${index}: ${
                fallbackUrls[index]
              } (fallback)`
            );
            slides[index] = null;
            loadedIndices.add(index);
            resolve(null);
          }
        };
      };
      attemptLoad(retries);
    });
  }

  async function lazyLoadImages(currentIndex) {
    const indicesToLoad = [
      currentIndex,
      currentIndex + 1,
      currentIndex + 2,
    ].filter(
      (index) =>
        !loadedIndices.has(index) && index >= 0 && index < slideUrls.length
    );

    if (indicesToLoad.length > 0) {
      await Promise.all(indicesToLoad.map((index) => loadImage(index)));
      drawImages();
    }
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

    updateBoundaries();
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

    if (Math.abs(movementX) < redrawThreshold) return;

    const newOffsetX = offsetX + movementX;

    if (newOffsetX > maxOffsetX || newOffsetX < minOffsetX) return;

    offsetX = newOffsetX;
    startX = e.clientX;

    const currentIndex = Math.floor(-offsetX / canvasWidth); // again, this assumption is only possible because of the scaling to canvas width

    lazyLoadImages(currentIndex).then(() => unloadImages(currentIndex));

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      const nextIndex = Math.min(
        Math.floor(-offsetX / canvasWidth) + 1,
        slideUrls.length - 1
      );
      offsetX = -nextIndex * canvasWidth;
      lazyLoadImages(nextIndex);
      drawImages();
    } else if (e.key === "ArrowLeft") {
      const prevIndex = Math.max(Math.floor(-offsetX / canvasWidth) - 1, 0);
      offsetX = -prevIndex * canvasWidth;
      lazyLoadImages(prevIndex);
      drawImages();
    }
  });
}
