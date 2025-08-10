export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
export const backoff = (attempt: number) =>
  Math.min(2000, 200 * 2 ** attempt) + Math.floor(Math.random() * 100);