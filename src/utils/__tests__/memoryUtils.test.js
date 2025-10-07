import { unloadDistantImages, getIndicesToLoad } from "../memoryUtils";

describe("memoryUtils", () => {
  describe("getIndicesToLoad", () => {
    it("should return current and next 2 slides for index 0 in a 5 slides collection", () => {
      const loadedIndices = new Set();

      const result = getIndicesToLoad(0, 5, loadedIndices);

      expect(result).toEqual([0, 1, 2]);
    });

    it("should return current and next 2 slides for middle index", () => {
      const loadedIndices = new Set();

      const result = getIndicesToLoad(2, 5, loadedIndices);

      expect(result).toEqual([2, 3, 4]);
    });

    it("should not exceed slide count bounds", () => {
      const loadedIndices = new Set();

      const result = getIndicesToLoad(4, 5, loadedIndices);

      expect(result).toEqual([4]);
    });

    it("should exclude already loaded indices", () => {
      const loadedIndices = new Set([0, 2]);

      const result = getIndicesToLoad(0, 5, loadedIndices);

      expect(result).toEqual([1]);
    });

    it("should return empty array when all needed slides are loaded", () => {
      const loadedIndices = new Set([0, 1, 2]);

      const result = getIndicesToLoad(0, 5, loadedIndices);

      expect(result).toEqual([]);
    });

    it("should handle when current index is negative", () => {
      const loadedIndices = new Set();

      const result = getIndicesToLoad(-1, 5, loadedIndices);

      expect(result).toEqual([0, 1]); // Filters out negative indices
    });

    it("should handle a single slide", () => {
      const loadedIndices = new Set();

      const result = getIndicesToLoad(0, 1, loadedIndices);

      expect(result).toEqual([0]);
    });

    it("should handle partial loading scenario", () => {
      const loadedIndices = new Set([1, 3]);

      const result = getIndicesToLoad(2, 6, loadedIndices);

      expect(result).toEqual([2, 4]);
    });
  });

  describe("unloadDistantImages", () => {
    let slides;
    let loadedIndices;

    beforeEach(() => {
      slides = {
        0: { src: "image0.jpg" },
        1: { src: "image1.jpg" },
        2: { src: "image2.jpg" },
        3: { src: "image3.jpg" },
        4: { src: "image4.jpg" },
        5: { src: "image5.jpg" },
        6: { src: "image6.jpg" },
      };

      loadedIndices = new Set([0, 1, 2, 3, 4, 5, 6]);
    });

    it("should unload images outside default cache range (3)", () => {
      unloadDistantImages(slides, loadedIndices, 3);

      expect(loadedIndices.has(0)).toBe(true);
      expect(loadedIndices.has(6)).toBe(true);
      expect(slides[0]).toBeDefined();
      expect(slides[6]).toBeDefined();
    });

    it("should unload images outside cache range", () => {
      slides[10] = { src: "image10.jpg" };
      loadedIndices.add(10);

      unloadDistantImages(slides, loadedIndices, 3);

      expect(loadedIndices.has(10)).toBe(false);
      expect(slides[10]).toBeUndefined();

      expect(loadedIndices.has(0)).toBe(true);
      expect(loadedIndices.has(6)).toBe(true);
    });

    it("should unload images before cache range", () => {
      unloadDistantImages(slides, loadedIndices, 5);

      expect(loadedIndices.has(0)).toBe(false);
      expect(loadedIndices.has(1)).toBe(false);
      expect(slides[0]).toBeUndefined();
      expect(slides[1]).toBeUndefined();

      expect(loadedIndices.has(2)).toBe(true);
      expect(loadedIndices.has(5)).toBe(true);
      expect(loadedIndices.has(6)).toBe(true);
    });

    it("should handle custom cache range", () => {
      const customCacheRange = 1;

      unloadDistantImages(slides, loadedIndices, 3, customCacheRange);

      expect(loadedIndices.has(0)).toBe(false);
      expect(loadedIndices.has(1)).toBe(false);
      expect(loadedIndices.has(5)).toBe(false);
      expect(loadedIndices.has(6)).toBe(false);

      expect(loadedIndices.has(2)).toBe(true);
      expect(loadedIndices.has(3)).toBe(true);
      expect(loadedIndices.has(4)).toBe(true);
    });

    it("should handle  beginning of slides", () => {
      unloadDistantImages(slides, loadedIndices, 0);

      expect(loadedIndices.has(4)).toBe(false);
      expect(loadedIndices.has(5)).toBe(false);
      expect(loadedIndices.has(6)).toBe(false);

      expect(loadedIndices.has(0)).toBe(true);
      expect(loadedIndices.has(1)).toBe(true);
      expect(loadedIndices.has(2)).toBe(true);
      expect(loadedIndices.has(3)).toBe(true);
    });
  });
});
