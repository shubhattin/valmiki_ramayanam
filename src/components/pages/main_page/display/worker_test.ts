import { lipi_parivartak_async } from '~/tools/converter';

self.onmessage = async function (event) {
  const text = event.data;
  const result = await lipi_parivartak_async(text, 'Normal', 'Hindi');
  // Send the result back to the main thread
  self.postMessage(result);
};
export function test() {
  return 2 + 3;
}
