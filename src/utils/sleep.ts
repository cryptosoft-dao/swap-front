export async function sleep(sleepFor: number) {
  return new Promise((resolve) => {
    let interval: NodeJS.Timeout | null = null;
    interval = setTimeout(() => {
      resolve(null);
      interval && clearTimeout(interval);
    }, sleepFor);
  });
}
