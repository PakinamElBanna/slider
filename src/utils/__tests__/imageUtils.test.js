import {
  drawImageContained,
  drawErrorPlaceholder,
  loadImage,
} from "../imageUtils";

describe("imageUtils", () => {
  let ctx;
  let canvas;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");

    // Mock canvas context methods
    jest.spyOn(ctx, "drawImage").mockImplementation(jest.fn());
    jest.spyOn(ctx, "fillText").mockImplementation(jest.fn());
    jest.spyOn(ctx, "fillRect").mockImplementation(jest.fn());

    // Mock console methods
    jest.spyOn(console, "warn").mockImplementation(jest.fn());
    jest.spyOn(console, "error").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("drawImageContained", () => {
    it("should draw landscape image correctly", () => {
      const mockImg = { width: 1600, height: 900 };
      const canvasWidth = 800;
      const canvasHeight = 600;

      drawImageContained(ctx, mockImg, 0, 0, canvasWidth, canvasHeight);

      expect(ctx.drawImage).toHaveBeenCalledWith(
        mockImg,
        0,
        0,
        1600,
        900,
        0,
        75,
        800,
        450
      );
    });

    it("should draw portrait images correctly", () => {
      const mockImg = { width: 600, height: 800 };
      const canvasWidth = 800;
      const canvasHeight = 600;

      drawImageContained(ctx, mockImg, 0, 0, canvasWidth, canvasHeight);

      expect(ctx.drawImage).toHaveBeenCalledWith(
        mockImg,
        0,
        0,
        600,
        800,
        175,
        0,
        450,
        600
      );
    });

    it("should handle perfect aspect ratio match without scaling", () => {
      const mockImg = { width: 800, height: 600 };
      const canvasWidth = 800;
      const canvasHeight = 600;

      drawImageContained(ctx, mockImg, 100, 50, canvasWidth, canvasHeight);

      expect(ctx.drawImage).toHaveBeenCalledWith(
        mockImg,
        0,
        0,
        800,
        600,
        100,
        50,
        800,
        600
      );
    });
  });

  describe("drawErrorPlaceholder", () => {
    it("should set correct text properties and draw error message", () => {
      drawErrorPlaceholder(ctx, 0, 0, 800, 600);

      expect(ctx.fillStyle).toBe("#333333");
      expect(ctx.textAlign).toBe("center");
      expect(ctx.textBaseline).toBe("middle");
      expect(ctx.font).toBe("16px Arial");
      expect(ctx.fillText).toHaveBeenCalledWith(
        "Failed to load image",
        400,
        300
      );
    });

    it("should handle different canvas dimensions", () => {
      drawErrorPlaceholder(ctx, 100, 50, 400, 300);

      expect(ctx.fillText).toHaveBeenCalledWith(
        "Failed to load image",
        300,
        200
      );
    });

    it("should handle offset positioning", () => {
      drawErrorPlaceholder(ctx, 200, 100, 600, 400);

      expect(ctx.fillText).toHaveBeenCalledWith(
        "Failed to load image",
        500,
        300
      );
    });
  });

  describe("loadImage", () => {
    const slideUrls = ["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"];
    const fallbackUrls = [
      "fallback1.jpg",
      "fallback2.jpg",
      "fallback3.jpg",
      "fallback4.jpg",
    ];

    beforeEach(() => {
      global.Image = class {
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
        set src(_v) {
          this.width = 800;
          this.height = 600;
        }
      };
    });

    it("should successfully load an image", async () => {
      const img = await loadImage(0, slideUrls, fallbackUrls);

      expect(img).toBeDefined();
      expect(img.width).toBe(800);
      expect(img.height).toBe(600);
    });

    it("should retry on failure and eventually succeed", async () => {
      let callCount = 0;
      global.Image = class {
        constructor() {
          setTimeout(() => {
            callCount++;
            if (callCount <= 2) {
              if (this.onerror) this.onerror(new Error("Network error"));
            } else {
              if (this.onload) this.onload();
            }
          }, 0);
        }
        set src(_v) {
          this.width = 800;
          this.height = 600;
        }
      };

      const img = await loadImage(0, slideUrls, fallbackUrls);

      expect(img).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Retrying to load image at index 0")
      );
    });

    it("should switch to fallback URL after retries exhausted", async () => {
      let useFallback = false;
      global.Image = class {
        constructor() {
          setTimeout(() => {
            if (!useFallback) {
              if (this.onerror) this.onerror(new Error("Network error"));
            } else {
              if (this.onload) this.onload();
            }
          }, 0);
        }
        set src(url) {
          if (url === fallbackUrls[0]) {
            useFallback = true;
          }
          this.width = 800;
          this.height = 600;
        }
      };

      const img = await loadImage(0, slideUrls, fallbackUrls);

      expect(img).toBeDefined();
      expect(console.warn).toHaveBeenCalledWith(
        "Switching to fallback for index 0"
      );
    });

    it("should return null when both primary and fallback fail", async () => {
      global.Image = class {
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error("Network error"));
          }, 0);
        }
        set src(_v) {}
      };

      const img = await loadImage(2, slideUrls, fallbackUrls);

      expect(img).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to load image at index 2: fallback3.jpg (fallback)"
      );
    });
  });
});
