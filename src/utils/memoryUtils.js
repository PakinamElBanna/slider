export function unloadDistantImages(
  slides,
  loadedIndices,
  currentIndex,
  cacheRange = 3
) {
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

export function getIndicesToLoad(currentIndex, slideCount, loadedIndices) {
  return [currentIndex, currentIndex + 1, currentIndex + 2].filter(
    (index) => index >= 0 && index < slideCount && !loadedIndices.has(index)
  );
}
