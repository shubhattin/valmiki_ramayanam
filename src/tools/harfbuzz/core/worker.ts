import type { WorkerMessage } from './types';
import { get_text_svg_path, preload_font_from_url, preload_harfbuzzjs_wasm } from './hbjs';

self.onmessage = async function (event) {
  const input: WorkerMessage = event.data;
  if (input.func_name === 'get_text_svg_path') {
    const result = await get_text_svg_path(input.args.text, input.args.font);
    self.postMessage({
      func_name: input.func_name,
      uuid: input.uuid,
      response: result
    });
  } else if (input.func_name === 'preload_harfbuzzjs_wasm') {
    await preload_harfbuzzjs_wasm();
    self.postMessage({
      func_name: input.func_name,
      uuid: input.uuid,
      response: undefined
    });
  } else if (input.func_name === 'preload_font_from_url') {
    await preload_font_from_url(input.args.url);
    self.postMessage({
      func_name: input.func_name,
      uuid: input.uuid,
      response: undefined
    });
  }
};
