export function createScheduler() {
  let scheduled = false;

  return function scheduleRedraw(callback) {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        callback();
        scheduled = false;
      });
    }
  };
}
