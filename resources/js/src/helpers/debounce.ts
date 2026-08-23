export function createDebouncedCallback(callback: () => void, delayMs: number) {
  let timerId: number | null = null;

  function cancel(): void {
    if (timerId === null) {
      return;
    }

    window.clearTimeout(timerId);

    timerId = null;
  }

  function schedule(): void {
    cancel();

    timerId = window.setTimeout(() => {
      timerId = null;

      callback();
    }, delayMs);
  }

  function flush(): void {
    if (timerId === null) {
      return;
    }

    cancel();
    callback();
  }

  return {
    cancel,
    flush,
    schedule,
  };
}
