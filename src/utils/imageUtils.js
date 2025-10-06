export function drawImageContained(ctx, img, x, y, width, height) {
  const imageAspectRatio = img.width / img.height;
  const canvasAspectRatio = width / height;

  let scaledWidth, scaledHeight;
  if (imageAspectRatio > canvasAspectRatio) {
    scaledWidth = width;
    scaledHeight = width / imageAspectRatio;
  } else {
    scaledWidth = height * imageAspectRatio;
    scaledHeight = height;
  }

  const centeredX = x + (width - scaledWidth) / 2;
  const centeredY = y + (height - scaledHeight) / 2;

  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centeredX,
    centeredY,
    scaledWidth,
    scaledHeight
  );
}

export function drawErrorPlaceholder(ctx, x, y, width, height) {
  ctx.fillStyle = "#333333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "16px Arial";

  ctx.fillText("Failed to load image", x + width / 2, y + height / 2);
}

export async function loadImage(index, slideUrls, fallbackUrls, retries = 3) {
  return new Promise((resolve) => {
    const attemptLoad = (retryCount, useFallback) => {
      const img = new Image();
      img.src = useFallback ? fallbackUrls[index] : slideUrls[index];
      img.onload = () => {
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
            `Failed to load image at index ${index}: ${fallbackUrls[index]} (fallback)`
          );
          resolve(null);
        }
      };
    };
    attemptLoad(retries);
  });
}
