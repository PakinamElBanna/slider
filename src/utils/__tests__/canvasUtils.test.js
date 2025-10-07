import {
  setupCanvasForDPR,
  calculateBoundaries,
  getCurrentSlideIndex,
  getVisibleSlideRange,
} from "../canvasUtils";

describe("canvasUtils", () => {
  describe("calculateBoundaries", () => {
    it("should calculate correct boundaries for 3 slides", () => {
      const result = calculateBoundaries(3, 800);

      expect(result.minOffsetX).toBe(-1600);
      expect(result.maxOffsetX).toBe(0);
    });

    it("should handle single slide", () => {
      const result = calculateBoundaries(1, 800);

      expect(result.minOffsetX).toBe(-0); // -0 is equivalent to 0 but I wanted to leave it to show the X direction
      expect(result.maxOffsetX).toBe(0);
    });
  });

  describe("getCurrentSlideIndex", () => {
    it("should return 0 for offsetX 0", () => {
      expect(getCurrentSlideIndex(0, 800)).toBe(-0);
    });

    it("should return 1 for negative offsetX", () => {
      expect(getCurrentSlideIndex(-800, 800)).toBe(1);
    });

    it("should return 2 for larger negative offsetX", () => {
      expect(getCurrentSlideIndex(-1600, 800)).toBe(2);
    });
  });

  describe("getVisibleSlideRange", () => {
    it("should return range starting from current slide", () => {
      const result = getVisibleSlideRange(0, 800, 5);

      expect(Math.abs(result.startSlideIndex)).toBe(0);
      expect(result.endSlideIndex).toBe(2);
    });

    it("should not exceed total slides", () => {
      const result = getVisibleSlideRange(-1600, 800, 3);

      expect(result.startSlideIndex).toBe(2);
      expect(result.endSlideIndex).toBe(2);
    });
  });

  describe("setupCanvasForDPR", () => {
    let canvas, ctx;

    beforeEach(() => {
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d");

      // devicePixelRatio mock
      Object.defineProperty(window, "devicePixelRatio", {
        value: 2,
        configurable: true,
      });
    });

    it("should set canvas dimensions with DPR", () => {
      const result = setupCanvasForDPR(canvas, ctx, 800, 600);

      expect(canvas.width).toBe(1600);
      expect(canvas.height).toBe(1200);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it("should set CSS size", () => {
      setupCanvasForDPR(canvas, ctx, 800, 600);

      expect(canvas.style.width).toBe("800px");
      expect(canvas.style.height).toBe("600px");
    });
  });
});
