import { createScheduler } from "../scheduleUtils";

describe("scheduleUtils", () => {
  let mockRequestAnimationFrame;
  let mockCallback;

  beforeEach(() => {
    mockRequestAnimationFrame = jest.fn();
    global.requestAnimationFrame = mockRequestAnimationFrame;

    mockCallback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createScheduler", () => {
    it("should return a function", () => {
      const scheduleRedraw = createScheduler();

      expect(typeof scheduleRedraw).toBe("function");
    });

    it("should schedule callback on first call", () => {
      const scheduleRedraw = createScheduler();

      scheduleRedraw(mockCallback);

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should execute callback when requestAnimationFrame runs", () => {
      const scheduleRedraw = createScheduler();

      scheduleRedraw(mockCallback);

      const scheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];

      scheduledFunction();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should reset scheduled state after callback execution", () => {
      const scheduleRedraw = createScheduler();

      scheduleRedraw(mockCallback);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      const scheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];
      scheduledFunction();
      expect(mockCallback).toHaveBeenCalledTimes(1);

      scheduleRedraw(mockCallback);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple schedulers independently", () => {
      const scheduleRedraw1 = createScheduler();
      const scheduleRedraw2 = createScheduler();
      const mockCallback2 = jest.fn();

      scheduleRedraw1(mockCallback);
      scheduleRedraw2(mockCallback2);

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);

      const firstScheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];
      const secondScheduledFunction =
        mockRequestAnimationFrame.mock.calls[1][0];

      firstScheduledFunction();
      secondScheduledFunction();

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback2).toHaveBeenCalledTimes(1);
    });

    it("should handle successive calls and not schedule multiple callbacks if already scheduled", () => {
      const scheduleRedraw = createScheduler();

      scheduleRedraw(mockCallback);
      scheduleRedraw(mockCallback);
      scheduleRedraw(mockCallback);
      scheduleRedraw(mockCallback);

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      const scheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];
      scheduledFunction();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle callback that throws an error", () => {
      const scheduleRedraw = createScheduler();
      const errorCallback = jest.fn(() => {
        throw new Error("Test error");
      });

      scheduleRedraw(errorCallback);
      const scheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];

      expect(() => scheduledFunction()).toThrow("Test error");

      scheduleRedraw(mockCallback);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it("should work with real-world usage pattern", () => {
      const scheduleRedraw = createScheduler();
      let drawCount = 0;

      const drawFunction = () => {
        drawCount++;
      };

      for (let i = 0; i < 10; i++) {
        scheduleRedraw(drawFunction);
      }

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);

      const scheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];
      scheduledFunction();

      expect(drawCount).toBe(1);

      scheduleRedraw(drawFunction);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it("should handle consecutive schedule-execute cycles", () => {
      const scheduleRedraw = createScheduler();
      let executionCount = 0;

      const testCallback = () => {
        executionCount++;
      };

      scheduleRedraw(testCallback);
      let scheduledFunction = mockRequestAnimationFrame.mock.calls[0][0];
      scheduledFunction();

      scheduleRedraw(testCallback);
      scheduledFunction = mockRequestAnimationFrame.mock.calls[1][0];
      scheduledFunction();

      scheduleRedraw(testCallback);
      scheduledFunction = mockRequestAnimationFrame.mock.calls[2][0];
      scheduledFunction();

      expect(executionCount).toBe(3);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(3);
    });
  });
});
