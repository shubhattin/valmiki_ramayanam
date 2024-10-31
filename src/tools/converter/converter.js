import { normalize } from './normalise_lang';

const get_lipi_lekhika_instance = async () => {
  return (await import('./lekhika_core')).default;
};

/**
 * @param {string} lang
 * @returns {string}
 */
export const normalize_lang_code = (lang) => {
  return normalize(lang);
};

/**
 * @param {string} lang
 * @returns {Promise<number>}
 */
export const get_sa_mode = async (lang) => {
  const LipiLekhikA = await get_lipi_lekhika_instance();
  lang = normalize_lang_code(lang);
  return LipiLekhikA.k.akSharAH[lang].sa;
};

export const load_parivartak_lang_data = async (lang, base_lang_folder = './src') => {
  const LipiLekhikA = await get_lipi_lekhika_instance();
  await LipiLekhikA.k.load_lang(lang, null, false, true, base_lang_folder);
};

const pacham_patches = [
  // patching कवर्ग
  ['Gk', 'nk'],
  ['Gkh', 'nkh'],
  ['Gg', 'ng'],
  ['Ggh', 'ngh'],
  // patching चवर्ग
  ['Jch', 'nch'],
  ['JCh', 'nCh'],
  ['Jj', 'nj'],
  ['Jjh', 'njh'],
  ['jJ', 'jn']
]; // this info will also be use to convert to Normal as well from Normal

/**
 * @type {Array<Array<string>>}
 */
const VARGANI = [
  ['क', 'ख', 'ग', 'घ', 'ङ'],
  ['च', 'छ', 'ज', 'झ', 'ञ'],
  ['ट', 'ठ', 'ड', 'ढ', 'ण'],
  ['त', 'थ', 'द', 'ध', 'न'],
  ['प', 'फ', 'ब', 'भ', 'म']
];
const HALANT = '्';
const ANUNASIK = 'ं';

/**
 * This function is used to convert the text from one script to another
 * @param {string} val - The text to be converted
 * @param {string} from - The script of the text to be converted
 * @param {string} to - The script to which the text is to be converted
 * @returns {string} - The text converted to the desired script
 *
 */
export const _lipi_parivartak = async (val, from, to) => {
  const LipiLekhikA = await get_lipi_lekhika_instance();
  from = normalize_lang_code(from);
  to = normalize_lang_code(to);
  if (from == 'Normal') {
    for (let text of pacham_patches) {
      val = val.replaceAll(text[1], text[0]);
    }
  }
  const SCRIPTS_TO_REPLACE_WITH_ANUNASIK = ['Telugu', 'Kannada'];
  if (from === 'Sanskrit' && SCRIPTS_TO_REPLACE_WITH_ANUNASIK.indexOf(to) !== -1) {
    for (let varga of VARGANI) {
      for (let i = 0; i <= 3; i++)
        val = val.replaceAll(varga[4] + HALANT + varga[i], ANUNASIK + varga[i]);
    }
  }
  let out = LipiLekhikA._parivartak(val, from, to);
  if (to === 'Normal' || to === 'Romanized') {
    // Doing this type of a patch here, for now because its better not touch the main lipi parivartak codebase
    for (let i = 0; i < 10; i++) out = out.replaceAll(`.${i}`, i);
    // removing . and .. for । and ॥ respectively
    // the change below is a lossfull change and cannot be recovered while converting back to the original script
    out = out.replaceAll('..', '');
    out = out.replaceAll('.', '');
    // replacing avagraha with a
    out = out.replaceAll("''", 'a');
    if (to === 'Normal') {
      let replaces = [
        // patching छ and ञ from Y -> J
        ['chh', 'Ch'],
        ['Y', 'J']
      ];
      replaces.push(...pacham_patches);
      for (let text of replaces) {
        out = out.replaceAll(text[0], text[1]);
      }
    }
  }
  return out;
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
export const lipi_parivartak = async (val, from, to) => {
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
  elmt,
  event_data = '',
  lang = '',
  on_status = true,
  callback = null,
  sa_mode = null
) => {
  const LipiLekhikA = await get_lipi_lekhika_instance();
  const input_data = LipiLekhikA.mukhya(elmt, event_data, lang, on_status, callback, sa_mode);
  if (!input_data) return;
  const { val, from_click } = input_data;
  let elm = elmt;
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
  if (callback) {
    callback(new_value);
    callback = null;
  }
};
