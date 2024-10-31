import { normalize } from './normalise_lang';
import load_lekhika__worker from './worker?worker';
import type { Arg, ArgUUID } from './types';
import type * as functions from './lekhika_core';

let lekhika_worker: Worker = null!;

// uuid: [func_name, callback]
const messages_queue: Record<string, [string, (response: any) => void]> = {};

if (typeof Worker !== 'undefined') {
  lekhika_worker = new load_lekhika__worker();

  lekhika_worker.onmessage = (event) => {
    const data = event.data;
    if (data.uuid in messages_queue) {
      const [func_name, resolve] = messages_queue[data.uuid];
      if (data.func_name === func_name) {
        resolve(data?.response);
        delete messages_queue[data.uuid];
      }
    }
  };
}

export const load_lipi_lekhika_instance = async () => {
  return await import('./lekhika_core');
};

async function postMessage<F extends keyof typeof functions>(
  message: Arg<F>,
  load_main: 'both' | 'only' | false = false
) {
  return new Promise<ReturnType<(typeof functions)[F]>>(async (resolve, reject) => {
    if (!lekhika_worker || load_main) {
      const lipi_lekhika = await load_lipi_lekhika_instance();
      // @ts-ignore
      resolve(lipi_lekhika[message.func_name](...message.args));
      if (!load_main || load_main === 'only') return;
    }
    const uuid = crypto.randomUUID();
    const post_message: ArgUUID<F> = {
      ...message,
      uuid
    };
    messages_queue[uuid] = [message.func_name, resolve];
    lekhika_worker.postMessage(post_message);
  });
}

export const normalize_lang_code = (lang: string) => {
  return normalize(lang);
};

export const get_sa_mode = async (lang: string) => {
  return await postMessage({
    func_name: 'get_sa_mode',
    args: [lang]
  });
};

export const load_parivartak_lang_data = async (lang: string, base_lang_folder = './src') => {
  return await postMessage({
    func_name: 'load_parivartak_lang_data',
    args: [lang, base_lang_folder]
  });
};

const _lipi_parivartak = async (val: string, from: string, to: string) => {
  return await postMessage({
    func_name: '_lipi_parivartak',
    args: [val, from, to]
  });
};

/**
 * This function is an async version of the lipi_parivartak function
 * It does not require the user to manually load the languages before converting the text
 * It is used to convert the text from one script to another
 * @param {string} val - The text to be converted
 * @param {string} from - The script of the text to be converted
 * @param {string} to - The script to which the text is to be converted
 * @returns {Promise<string>} - The text converted to the desired script
 **/
export const lipi_parivartak = async (val: string, from: string, to: string) => {
  await load_parivartak_lang_data(from);
  await load_parivartak_lang_data(to);
  return await _lipi_parivartak(val, from, to);
};

/**
 * The mukhya function performs a specific task.
 *
 * @param {any} elmt - The textarea element parameter.
 * @param {string} [event_data=''] - The text parameter. Default value is an empty string.
 * @param {string} [lang=''] - The lang parameter. Default value is an empty string.
 * @param {boolean} [on_status=true] - The on_status parameter. Default value is true.
 * @param {any} [callback=null] - The callback parameter. Default value is null.
 * @param {0|1|undefined|null} [sa_mode=null] - The sa_mode parameter. Default value is null.
 * @returns {Promise<void>}
 */
export const lekhika_typing_tool = async (
  elm: any,
  event_data: string = '',
  lang: string = '',
  on_status: boolean = true,
  callback: any = null,
  sa_mode: 0 | 1 | undefined | null = null
) => {
  const input_data = await postMessage({
    func_name: 'lekhika_typing_tool',
    args: [event_data, lang, on_status, sa_mode]
  });
  if (!input_data) {
    return;
  }
  const { val, from_click } = input_data;
  let dyn = elm.value;
  let current_cursor_pos = elm.selectionStart + 1;
  let ex = 0;
  if (from_click) {
    current_cursor_pos++;
    ex = 1;
  }
  let pre_part = dyn.substring(0, current_cursor_pos - val[1] - 2);
  let changing_part = val[0];
  let post_part = '';
  if (dyn.length + 1 + (from_click ? 1 : 0) == current_cursor_pos)
    post_part = dyn.substring(current_cursor_pos + 1);
  else if (dyn.length + 1 != current_cursor_pos)
    post_part = dyn.substring(current_cursor_pos - 1 - ex);
  let length = pre_part.length + changing_part.length;
  const new_value = pre_part + changing_part + post_part;
  elm.value = new_value;
  elm.focus();
  elm.selectionStart = length;
  elm.selectionEnd = length;
  callback && callback(new_value);
};
