export function createScheduler() {
  let scheduled = false;

  return function scheduleRedraw(callback) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      try {
        callback();
      } catch (err) {
        throw err;
      } finally {
        scheduled = false;
      }
    });
  };
}
