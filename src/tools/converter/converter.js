import * as fs from 'fs';
import { lipi_helper } from './helper';
import { browser } from '$app/environment';
import { $l, $lf } from './lquery';

class LipiParivartak {
  constructor() {
    this.k = lipi_hlp;
    this.karya = true;
    this.time = lipi_hlp.time();
    this.back_space = 0;
    this.sahayika_usage = true;
    this.halant_add_status = false;
    this.script = 'Hindi';
    //[key record, output, whats on screen]
    this.varna = ['', '', ''];
    this.next_chars = '';
    this.d = false;
    this.mAtrA_sthiti = false;
    this.capital = [0, '', -1, -1, 0, 0, false];
    this.store_last_of_3 = '';
    this.added_fonts = [];
    this.last_of_3_status_for_mAtrA = false;
    this.special_ved_s = false;
    this.usage_table_link = (lang) => {
      return `${lipi_hlp.image_loca}/${this.k.normalize(lang)}.png`;
    };
    this.pUrva_lekhit = [
      ['', -1],
      ['', -1],
      ['', -1],
      ['', -1],
      ['', -1]
    ];
    this.second_cap_time = 0;
    if (browser) {
      this.sahayika = new lekhan_sahayika();
      this.set_interface_lang = (lang = 'English') => this.sahayika.set_lang(lang);
      this.hide = () => this.sahayika.elm.hide();
    }
    // patch
    this.callback_func_for_state_update = null;
  }

  /**
   * The mukhya function performs a specific task.
   *
   * @param {any} elmt - The textarea element parameter.
   * @param {string} [event_data=''] - The text parameter. Default value is an empty string.
   * @param {string} [lang=''] - The lang parameter. Default value is an empty string.
   * @param {boolean} [on_status=true] - The on_status parameter. Default value is true.
   * @param {any} [callback=null] - The callback parameter. Default value is null.
   * @param {0|1|ndefined|null} [sa_mode=null] - The sa_mode parameter. Default value is null.
   * @returns {void}
   */

  mukhya(elmt, event_data = '', lang = '', on_status = true, callback = null, sa_mode = null) {
    // if (!this.karya) return;
    if (!on_status) return;
    if (event_data == null || event_data == undefined) {
      this.clear_all_val(true);
      return;
    }
    event_data = event_data.substring(event_data.length - 1);
    let elf = this.elphased_time() < 15.0;
    if (this.k.in(this.k.pUrNasarve, event_data)) {
      if (!elf) this.clear_all_val(true);
      let lng = lang;
      lng = this.k.normalize(lng);
      this.callback_func_for_state_update = callback;
      this.prakriyA({
        text: event_data,
        typing: 1, // sanskrit mode
        lang: lng,
        mode: sa_mode ?? this.k.akSharAH[lng].sa, // element mode, 0 for text mode
        element: elmt
      });
    } else this.clear_all_val(true);
  }
  elphased_time() {
    let t = this.time,
      c = this.k.time();
    let t1 = c - t;
    this.time = c;
    return t1;
  }
  prakriyA(args) {
    let code = '',
      mode = 0,
      lang = '',
      elm = null,
      html = false,
      l = this.k;
    if (this.k.in([undefined, null, ''], args.text)) return '';
    else code = args.text;
    lang = args.lang;
    if (args.typing != undefined) mode = 1;
    if (args.html == true) html = true;
    if (args.element != undefined) elm = args.element;
    this.akSharANi = l.akSharAH[lang];
    this.halant = !l.in(['Normal', 'Romanized', 'Urdu'], lang) ? this.akSharANi['.']['.x'][0] : '';
    let sa = args.mode == 0 && mode == 1 ? 0 : 1,
      ignr = [];
    this.dev_text = [];
    if (html)
      for (let x of l.reg_index(code, new RegExp('(?<=<).+?(?=>)', 'g')))
        ignr.push([x[0] - 1, x[1].length + 2]);
    var add_dev = (v) => {
      if (mode == 0) for (let x of v) this.dev_text.push(x);
    };
    for (let k = 0; k < code.length; k++) {
      if (html)
        if (ignr.length > 0)
          if (k == ignr[0][0]) {
            let ln = ignr[0][1];
            ignr.splice(0, 1);
            add_dev(code.substring(k, k + ln));
            k += ln - 1;
            continue;
          }
      let key = code[k];
      if (this.next_chars == '' && key in this.akSharANi) {
        this.varna[2] = '';
        this.vitaraNa(key, mode, sa, elm, lang);
      } else if (this.next_chars == '' && l.is_upper(key) && l.to_lower(key) in this.akSharANi) {
        this.varna[2] = '';
        this.vitaraNa(l.to_lower(key), mode, sa, elm, lang);
      } else if (this.next_chars != '') {
        if (l.in(this.next_chars, key)) {
          if (this.d) {
            this.halant_add_status = true;
            this.d = false;
          }
          this.varna[2] = this.varna[1];
          key = this.varna[0] + key;
          this.vitaraNa(key, mode, sa, elm, lang);
        } else if (key == ';' || key == 'q') {
          this.clear_all_val(true);
          if (mode == 1) this.back_space++;
          else if (mode == 0 && lang == 'Romanized') this.dev_text.push(';');
        } else if (key in this.akSharANi) {
          this.clear_all_val();
          this.varna[2] = '';
          if (
            this.store_last_of_3 != '' &&
            this.pUrva_lekhit[4][1] != 0 &&
            lang == 'Tamil-Extended' &&
            key == '#'
          )
            this.clear_all_val(true);
          this.vitaraNa(key, mode, sa, elm, lang);
        } else if (l.is_upper(key) && l.to_lower(key) in this.akSharANi) {
          this.clear_all_val();
          this.vitaraNa(l.to_lower(key), mode, sa, elm, lang);
        } else {
          add_dev(key);
          this.clear_all_val(true);
        }
      } else {
        add_dev(key);
        this.clear_all_val(true);
      }
    }
    if (mode == 0) {
      let vl = this.dev_text.join('');
      this.dev_text = [];
      this.clear_all_val(true);
      return vl;
    }
  }
  vitaraNa(key, mode, sa, elm, lang) {
    let l = this.k;
    if (lang == 'Urdu' && l.in(['a', 'i', 'u'], key) && this.pUrva_lekhit[4][1] == -1) key += '1';
    let cap_0_from_1 = [false, ['', -1]];
    let data = this.akSharANi[key[0]];
    let current = data[key];
    let prev_temp = this.pUrva_lekhit[3][1];
    let temp = this.pUrva_lekhit[4][1];
    let varna_sthiti = l.last(current);
    if (this.mAtrA_sthiti && l.in([1, 2], varna_sthiti)) {
      this.clear_all_val(true);
      this.vitaraNa(l.last(key), mode, sa, elm, lang);
      return;
    }
    this.varna[0] = key;
    this.varna[1] = current[0];
    if (temp == 1 || temp == 3) {
      if (varna_sthiti == 1 && !l.in(this.next_chars, l.last(key)) && sa == 0) {
        this.halant_add_status = true;
        if (temp == 3) {
          this.back_space++;
          this.varna[1] = this.store_last_of_3 + this.varna[1];
        }
      } else if (varna_sthiti == 0) this.mAtrA_sthiti = true;
    }
    if (this.capital[0] == 1 && mode == 1) {
      if (key == this.capital[1]) {
        this.capital[0] = 2;
        this.second_cap_time = l.time();
      } else if (
        l.last(key) == this.capital[1] &&
        this.akSharANi[l.to_upper(this.capital[1])][l.to_upper(this.capital[1])][0] != this.varna[1]
      ) {
        this.capital[6] = true;
        this.capital[0] = 2;
        this.capital[2] = varna_sthiti;
        this.capital[5] = this.varna[1].length;
        this.second_cap_time = l.time();
      } else this.capital = [0, '', -1, -1, 0, 0];
    }
    if ((key == 'LR' || key == 'r3') && varna_sthiti == 0) {
      if (prev_temp != 1) this.mAtrA_sthiti = false;
      else if (sa == 0) this.back_space++;
      if (l.in(['Modi', 'Sharada'], lang)) {
        this.back_space++;
      }
    }
    if (this.mAtrA_sthiti) {
      this.varna[1] = current[1];
      if (temp == 1 && sa == 1) this.back_space += this.halant.length;
      if (temp == 3) {
        this.back_space++;
        if (sa == 1) this.back_space++;
        this.varna[1] += this.store_last_of_3;
        this.last_of_3_status_for_mAtrA = true;
      } else if (temp == 0 && this.last_of_3_status_for_mAtrA) {
        this.varna[1] += this.store_last_of_3;
        this.last_of_3_status_for_mAtrA = true;
      }
    }
    if (
      lang == 'Tamil-Extended' &&
      key == 'M' &&
      (((prev_temp == 3 || (prev_temp == 0 && this.pUrva_lekhit[2][1] == 3)) && temp == 0) ||
        (this.capital[0] == 3 &&
          (this.pUrva_lekhit[1][1] == 3 ||
            (this.pUrva_lekhit[1][1] == 0 && this.pUrva_lekhit[0][1] == 3)) &&
          this.pUrva_lekhit[2][1] == 0))
    ) {
      this.varna[1] += this.store_last_of_3;
      this.back_space++;
    }
    if (lang == 'Tamil-Extended' && l.in(['#an', '#s'], key)) {
      if (
        key == '#an' &&
        (this.pUrva_lekhit[1][1] == 3 ||
          (this.pUrva_lekhit[1][1] == 0 && this.pUrva_lekhit[0][1] == 3)) &&
        this.pUrva_lekhit[2][1] == 0
      ) {
        this.varna[1] += this.store_last_of_3;
        this.back_space++;
      } else if (
        key == '#s' &&
        (this.pUrva_lekhit[2][1] == 3 ||
          this.pUrva_lekhit[2][1] == 0 ||
          this.pUrva_lekhit[1][1] == 3) &&
        this.pUrva_lekhit[3][1] == 0
      ) {
        this.varna[1] += this.store_last_of_3;
        this.back_space++;
        this.special_ved_s = true;
      }
    }
    if (lang == 'Tamil' && key == 'R' && temp == 1 && varna_sthiti == 2) this.back_space++;
    if (lang == 'Tamil-Extended' && l.in(['#ss', '#sss'], key) && this.special_ved_s)
      this.varna[1] += this.store_last_of_3;
    if (
      temp == 1 &&
      varna_sthiti == 2 &&
      key.length == 1 &&
      Object.keys(data).length > 1 &&
      sa == 0
    ) {
      for (let v of l.last(current, -2)) {
        if (key + v in data) {
          if (l.last(data[key + v]) == 1) this.d = true;
          break;
        }
      }
    }
    if (
      (l.in(lang, 'Tamil') || lang == 'Punjabi') &&
      l.in(['R', 'LR', 'LRR', 'RR'], key) &&
      varna_sthiti == 1
    )
      varna_sthiti = 2;
    if (sa == 1) {
      if (varna_sthiti == 1) this.varna[1] += this.halant;
      else if (varna_sthiti == 3)
        this.varna[1] = l.substring(this.varna[1], 0, -1) + this.halant + l.last(this.varna[1]);
    }
    let val = this.likha(this.varna[1], this.varna[2], this.back_space, this.halant_add_status);
    if (mode == 0) {
      for (let p = 0; p < val[1]; p++) this.dev_text.pop();
      for (let x of val[0]) this.dev_text.push(x);
    } else if (mode == 1) {
      let is_input = false;
      // if (l.in(['input', 'textarea'], elm[0].tagName.toLowerCase())) is_input = true;
      // in this we assume it to be true
      is_input = true;
      if (is_input) {
        let dyn = elm.value;
        let current_cursor_pos = elm.selectionStart + 1;
        let ex = 0;
        if (this.from_click) {
          current_cursor_pos++;
          ex = 1;
        }
        let pre_part = dyn.substring(0, current_cursor_pos - val[1] - 2);
        let changing_part = val[0];
        let post_part = '';
        if (dyn.length + 1 + (this.from_click ? 1 : 0) == current_cursor_pos)
          post_part = dyn.substring(current_cursor_pos + 1);
        else if (dyn.length + 1 != current_cursor_pos)
          post_part = dyn.substring(current_cursor_pos - 1 - ex);
        let length = pre_part.length + changing_part.length;
        const new_value = pre_part + changing_part + post_part;
        elm.value = new_value;
        elm.focus();
        elm.selectionStart = length;
        elm.selectionEnd = length;
        if (this.callback_func_for_state_update) {
          this.callback_func_for_state_update(new_value);
          this.callback_func_for_state_update = null;
        }
        if (this.from_click) this.from_click = false;
      }
    }
    if (this.capital[0] == 3) this.capital = [0, '', -1, -1, 0, 0, false];
    if (
      key.length == 1 &&
      l.is_lower(key) &&
      l.to_upper(key) in this.akSharANi &&
      this.capital[0] == 0 &&
      mode == 1
    ) {
      let a = [0, '', -1, -1, 0, 0, false];
      let b = [1, key, varna_sthiti, temp, l.time(), this.varna[1].length, false];
      if (key + key in data) {
        if (this.akSharANi[l.to_upper(key)][l.to_upper(key)][0] != data[key + key][0])
          this.capital = b;
        else this.capital = a;
      } else this.capital = b;
    }
    this.next_chars = current[current.length - 2];
    if (varna_sthiti == 3) this.store_last_of_3 = l.last(this.varna[1]);
    if (this.next_chars == '') this.clear_all_val();
    this.pUrva_lekhit[0] = this.pUrva_lekhit[1];
    this.pUrva_lekhit[1] = this.pUrva_lekhit[2];
    this.pUrva_lekhit[2] = this.pUrva_lekhit[3];
    this.pUrva_lekhit[3] = this.pUrva_lekhit[4];
    this.pUrva_lekhit[4] = [key, varna_sthiti];
  }
  likha(b, a, bk, hal) {
    // a = what is currently on screen
    // b = it is that to which a has to be replaced
    let back = 0;
    let lekha = '';
    if (a == '' || b == '') {
      lekha = b;
      back = a.length;
    } else if (b[0] != a[0]) {
      lekha = b;
      back = a.length;
    } else {
      let x = 0;
      for (let n in a) {
        let v = a[n];
        if (b.length == x) break;
        if (b[x] != a[x]) break;
        x++;
      }
      lekha = b.substring(x);
      back = a.length - x;
    }
    back += bk;
    if (hal) lekha = this.halant + lekha;
    this.back_space = 0;
    this.halant_add_status = false;
    return [lekha, back];
  }
  clear_all_val(spl) {
    this.next_chars = '';
    this.varna = ['', '', ''];
    this.mAtrA_sthiti = false;
    this.last_of_3_status_for_mAtrA = false;
    this.special_ved_s = false;
    this.back_space = 0;
    if (spl) {
      this.pUrva_lekhit = [
        ['', -1],
        ['', -1],
        ['', -1],
        ['', -1],
        ['', -1]
      ];
      this.store_last_of_3 = '';
    }
  }
  _parivartak(val, from, to, html = false, norm = true) {
    if (norm) {
      from = this.k.normalize(from);
      to = this.k.normalize(to);
    }
    if (from == to) return val;
    var l = lipi_hlp;
    var convert = (ln, t) =>
        this.prakriyA({
          lang: ln,
          text: t,
          html: html
        }),
      ignr = [];
    if (html)
      for (let x of l.reg_index(val, new RegExp('(?<=<).+?(?=>)', 'g')))
        ignr.push([x[0] - 1, x[1].length + 2]);
    if (from == 'Normal') return convert(to, val);
    var get_antar_kram = (ln, type = 0) => {
      let or = ['antar', 'kram'];
      if (!(or[type] in l.akSharAH[ln])) return [{}, []][type];
      return l.akSharAH[ln][or[type]];
    };
    var pUrva = [
        ['', '', -1],
        ['', '', -1],
        ['', '', -1],
        ['', '', -1],
        ['', '', -1]
      ], //5 purva varna references
      db = get_antar_kram(from),
      db2 = get_antar_kram(to),
      ord1 = get_antar_kram(from, 1),
      ord2 = get_antar_kram(to, 1),
      res = '',
      next = '',
      chr = '';
    var get_hal = (d) => {
      if (!l.in(['Normal', 'Romanized', 'Urdu'], d)) return l.akSharAH[d]['.']['.x'][0];
      return '';
    };
    var get_nukta = (d) => {
      if ('.' in l.akSharAH[d]) if ('.z' in l.akSharAH[d]['.']) return l.akSharAH[d]['.']['.z'][0];
      return '';
    };
    var hal = {
        from: get_hal(from),
        to: get_hal(to)
      },
      nukta = {
        from: get_nukta(from),
        to: get_nukta(to)
      };
    var gt = (v) => {
      // get value for scannded text
      if (l.in(['Romanized', 'Urdu'], from) || l.in(['Normal', 'Romanized', 'Urdu'], to)) {
        let vl = db[v][0],
          rom = [
            ['o', 'e'],
            ['O', 'E']
          ];
        if (to != 'Urdu' && l.in(rom[0], vl))
          if (
            !l.in(['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Sinhala', 'Purna-Devanagari'], from)
          )
            // ^ scripts in which there is differnce of dirgha and hrasva 'e' and 'o'
            vl = rom[1][rom[0].indexOf(vl)];
        if (v == hal.from) vl = '';
        return vl;
      }
      if (l.in(ord1, v)) {
        let vl = ord2[ord1.indexOf(v)];
        return vl == 1 ? '' : vl;
      } else if (db[v].length == 4) {
        let vl = ord2[db[v][3]];
        return vl == 1 ? '' : vl;
      }
      if (l.in([0.1, 2.1, 1.1], db[v][1])) {
        let r = '';
        for (let x of v) {
          let vl = ord2[ord1.indexOf(x)];
          r += vl == 1 ? '' : vl;
        }
        return r;
      }
      if (pUrva[0][0].length == 1 && l.in([1, 3], pUrva[1][2]) && pUrva[0][2] == 0)
        this.pUrva_lekhit[4] = [pUrva[1][1], pUrva[1][2]];
      let vl = convert(to, db[v][0]);
      if (l.in([1, 3], pUrva[0][2]))
        if (vl[0] in db2) if (l.in([1, 3], Math.floor(db2[v][1]))) vl = hal.to + vl;
      return vl == 1 ? '' : vl;
    };
    var loop = (x, i, last = false, no_more = false) => {
      if (
        !no_more &&
        l.in(['\ud805', '\ud804'], x) &&
        l.in(['Modi', 'Sharada', 'Brahmi', 'Siddham', 'Granth'], from)
      )
        // ^ also adding support for the above languages through a simple fix
        return -2;
      let done = false,
        sthiti = -1,
        continued = false;
      if (html)
        if (ignr.length > 0)
          if (i == ignr[0][0]) {
            let ln = ignr[0][1];
            ignr.splice(0, 1);
            res += val.substring(i, i + ln);
            return ln;
          }
      if (next != '') {
        if (!last && l.in(next, x)) {
          chr += x;
          let dt = db[chr];
          next = dt.length == 2 ? '' : dt[2];
          sthiti = Math.floor(dt[1]);
          done = true;
          continued = true;
        } else {
          let vl = gt(chr);
          pUrva[0][1] = vl;
          res += vl;
        }
      }
      if (!last && !done && x in db) {
        let dt = db[x];
        next = dt.length == 2 ? '' : dt[2];
        sthiti = Math.floor(dt[1]);
        chr = x;
        done = true;
      }
      if (
        !continued &&
        l.in(['Normal', 'Romanized', 'Urdu'], to) &&
        l.in([1, 3], pUrva[0][2]) &&
        sthiti != 0 &&
        !l.in([hal.from, nukta.from], x)
      )
        // condition if vyanjana is not follwed by svar matra
        res += 'a';
      if (!last && !done) {
        res += x;
        chr = '';
        next = '';
        sthiti = -1;
      }
      if (!last) {
        if (!continued) for (let j = 4; j >= 1; j--) pUrva[j] = pUrva[j - 1];
        pUrva[0] = ['', '', -1];
        pUrva[0][0] = chr;
        pUrva[0][2] = sthiti;
      }
      if (done && next == '') {
        let vl = gt(chr);
        pUrva[0][1] = vl;
        res += vl;
      }
    };
    let tamil_ex = (v1, type) => {
      // Preparing text for conversions in Tamil Extended
      let mtr = 'ாிீுூெேைொோௌ்', // all matras and halant
        num = ['²³⁴', '₂₃₄'],
        sva_anu = '॒॑᳚᳛', // anudAttA followed by three svarits
        tml = 'கசஜடதப',
        reg = type == 'to' ? `[${tml}][${num[0]}][${mtr}]` : `[${tml}][${mtr}][${num[0] + num[1]}]`,
        x2 = type == 'to' ? 1 : 2,
        d1 = type == 'to' ? db2 : db;
      let r1 = v1.split('');
      for (let x1 of l.reg_index(v1, new RegExp(reg, 'gm'))) {
        let x = x1[0],
          k = d1[r1[x]];
        if (k.length > 2) {
          let k1 = r1[x + x2];
          if (l.in(num[1], k1))
            // if subscript nums then make it superscript
            k1 = r1[x + x2] = num[0][num[1].indexOf(k1)];
          if (l.in(k[2], k1)) {
            let tmp = r1[x + 1];
            r1[x + 1] = r1[x + 2];
            r1[x + 2] = tmp;
          }
        }
      }
      return r1.join('');
    };
    if (from == 'Tamil-Extended') val = tamil_ex(val, 'from');
    for (let i = 0; i < val.length; i++) {
      let t = loop(val[i], i);
      if (t == -2) loop(val[i] + val[i + 1], ++i);
      else if (t >= 2) i += t - 1; // ignoring html elements
    }
    loop(' ', val.length, true);
    if (to == 'Tamil-Extended') return tamil_ex(res, 'to');
    else if (l.in([from, to], 'Urdu') || l.in([from, to], 'Romanized')) return convert(to, res);
    return res;
  }
}
class lekhan_sahayika {
  constructor() {
    this.c = 0;
    this.d = 0;
    this.k = lipi_helper;
    this.idAnIma = 0;
    this.reset_capital_status = false;
    this.pUrvavarNa = [['', '', -1], ''];
    this.ins_msg = '';
    this.display = {};
    // this.set_lang("English");
    this.abhisthAnam = 0;
    let id = 'లిಪಿலேഖിକା';
    this.elm = $l('body').appendHTML(`<div id="${id}" style="display:none;"></div>`);
    if (true) {
      // making and adding html
      let row1 = '',
        row2 = '',
        r = [
          `<svg style="enable-background:new 0 0 26 26;" height="18px" width="18px" viewBox="96 160 320 192"><polygon points="396.6,`,
          `160 416,180.7 256,352 96,180.7 115.3,160 256,310.5`,
          `352 416,331.3 256,160 96,331.3 115.3,352 256,201.5`,
          `"/></svg>`
        ],
        img = ['', ''];
      img[0] = `${r[0] + r[1] + r[3]}`;
      img[1] = `${r[0] + r[2] + r[3]}`;
      row1 += `<td><span>${img[0]}</span><span>${img[1]}</span></td>`;
      row2 += `<td><a rel="noopener" href="https://rebrand.ly/lekhika" target="_blank"></a></td>`;
      row1 += `<td></td>`;
      row2 += `<td></td>`;
      for (let x = 0; x <= 60; x++) {
        row1 += `<td></td>`;
        row2 += `<td></td>`;
      }
      let table = `<table><tbody><tr>${row2}</tr><tr>${row1}</tr></tbody></table><div></div>`;
      this.elm.append(table);
    }
    setTimeout(() => {
      if (true) {
        // adding css
        let css = [];

        function add_css(pre, dct) {
          let v = pre + ' {\n';
          for (let x in dct) v += `${x}:${dct[x]};\n`;
          css.push(v + '}');
          return pre;
        }
        add_css(`#${id}`, {
          position: 'absolute',
          'background-color': 'white',
          padding: '2.5px',
          border: '2px solid black',
          'border-radius': '4.5px',
          'font-weight': 'bold',
          'z-index': '1000000',
          'user-select': 'none',
          cursor: 'default',
          'background-color': 'white',
          'min-width': '58px',
          'max-width': 'fit-content',
          'box-shadow': '0 4px 8.25px 0 #00000033, 0 6px 20px 0 #00000030',
          'font-family': `"Nirmala UI","Calibri"`,
          'transition-duration': '500ms'
        });
        add_css(`#${id} table`, {
          display: 'block',
          'max-width': '210px',
          'overflow-x': 'scroll'
        });
        if (!this.k.is_mobile) {
          add_css(`#${id} table::-webkit-scrollbar`, {
            height: '4.5px'
          });
          add_css(`#${id} table::-webkit-scrollbar-track`, {
            'background-color': '#e9e9e9',
            'border-radius': '10px'
          });
          add_css(`#${id} table::-webkit-scrollbar-thumb`, {
            'background-color': '#5353ff',
            'border-radius': '10px'
          });
          add_css(`#${id} table::-webkit-scrollbar-thumb:hover`, {
            'background-color': 'blue'
          });
        }
        let e = `#${id} table tbody tr`; // defined for reusing
        add_css(`${e}:nth-child(2) td:nth-child(1) span`, {
          cursor: 'pointer',
          display: 'none',
          position: 'absolute',
          top: '37px',
          left: '5px'
        }); // adding css for up down pointers
        add_css(`${e} td`, {
          'font-size': '18px',
          'text-align': 'center',
          cursor: 'grab'
        });
        add_css(`${e}:nth-child(1) td`, {
          color: 'black'
        });
        add_css(`${e}:nth-child(2) td`, {
          color: 'green'
        });
        let t = add_css(`${e} td:not(:nth-child(1)):not(:nth-child(2))`, {
          display: 'none'
        });
        add_css(`${t}:hover`, {
          color: 'blue'
        }); // adding hover effect
        add_css(`${e} td:nth-child(2)`, {
          'text-align': 'center',
          'padding-left': '22.5px',
          'padding-right': '5.6px',
          cursor: 'default'
        });
        add_css(`${e}:nth-child(1) td:nth-child(2)`, {
          color: 'brown',
          'font-size': '19.5px'
        });
        add_css(`${e}:nth-child(2) td:nth-child(2)`, {
          color: 'red',
          'font-size': '15px'
        });
        add_css(`${e}:nth-child(1) td:nth-child(1) a`, {
          display: 'inline-block',
          height: '20px',
          width: '20px',
          position: 'absolute',
          left: '4px',
          top: '10px',
          'background-image': `url(${this.k.sanchit}/icon.png)`,
          'background-size': '20px 20px'
        });
        add_css(`#${id} table+div`, {
          'font-size': '10.5px',
          color: 'purple',
          'max-width': 'fit-content',
          'min-width': '200px',
          display: 'none'
        });
        this.elm.append(`<style>${css.join('\n')}</style>`);
      }
      if (true) {
        // storing elements and adding handlers
        this.bhaNDAra_index = ['sahayika', 'pashchAta', 'akShara', 'key1', 'key2'];
        let e = `#${id} table tbody tr`; // defined for reusing
        this.bhaNDAra = {
          sahayika: $l(`#${id} table+div`)[0],
          key1: $l(`${e}:nth-child(1) td:nth-child(2)`)[0],
          key2: $l(`${e}:nth-child(2) td:nth-child(2)`)[0],
          pashchAta: $l(`${e}:nth-child(1) td`),
          akShara: $l(`${e}:nth-child(2) td`),
          table: $l(`#${id} table`),
          tbody: [$l(`${e}:nth-child(1)`)[0], $l(`${e}:nth-child(2)`)[0]]
        };
        this.adhar = 0;
        let img = $l(`${e}:nth-child(2) td:nth-child(1)`).children();
        this.ins_button = [$l(img[1]), $l(img[0])];
        this.ins_sthiti = 1;
        this.ins_button[this.ins_sthiti].show();
        this.ins_button[0].on('click', () => this.change_ins(0));
        this.ins_button[1].on('click', () => this.change_ins(1));
        if (this.ins_sthiti == 1) this.bhaNDAra.sahayika.style.display = 'none';
        this.objs = {
          down: $l(img[0]),
          up: $l(img[1]),
          icon: $l(`${e}:nth-child(1) td:nth-child(1) a`)
        };
      }
      $l('body').on('click', (event) => {
        let obj = LipiLekhikA;
        let o = obj.sahayika;
        let bh = o.bhaNDAra;
        if (o.elm.css('display') == 'none') return;
        let trgt = event.target;
        let p = $l(trgt).parents();
        let sah = p.indexOf(o.elm[0]) != -1; // seeing if the click is inside lekhan sahayika
        p = $l(trgt).parent()[0];
        if (this.k.in(bh.tbody, p) && !this.k.in([bh.key1, bh.key2], trgt)) {
          // above -> checking if a varna has been clicked
          sah = true;
          let el = o.adhar;
          for (let x of trgt.value) {
            if (this.k.in(['input', 'textarea'], el[0].tagName.toLowerCase())) {
              obj.from_click = true;
              let lng = el.attr('lipi-lang') == undefined ? this.k.k.script : el.attr('lipi-lang');
              lng = this.k.normalize(lng);
              if (!this.k.in(this.k.langs, lng)) return 'error';
              obj.prakriyA({
                text: x,
                typing: 1,
                lang: lng,
                mode:
                  el.attr('lipi-mode') == undefined
                    ? this.k.akSharAH[lng].sa
                    : el.attr('lipi-mode'),
                element: el
              });
            }
          }
        }
        if (!sah) obj.clear_all_val(true);
      });
    }, 1);
  }
  hide_other() {
    let elm = LipiLekhikA.sahayika;
    if (elm.c == 1) elm.elm.hide();
    elm.c--;
  }
  change_ins(i) {
    let elm = LipiLekhikA.sahayika;
    elm.ins_button[i].hide();
    let t = Math.abs(i - 1);
    elm.ins_sthiti = t;
    elm.ins_button[Math.abs(i - 1)].show();
    let el = elm.bhaNDAra.sahayika;
    elm.set_labels(1, t == 0 ? elm.ins_msg : '');
    el.style.display = t == 1 ? '' : 'block';
  }
  show(v) {
    if (v['elm'].attr('lekhan-sahayika') != 'on') return;
    this.reset_capital_status = false;
    let l = this.k;

    function reset_capital(k) {
      let elm = LipiLekhikA.sahayika;
      elm.d--;
      if (!elm.reset_capital_status) return;
      if (elm.d == 0) {
        for (let x = k[0]; x < k[1]; x++) {
          elm.set_labels(2, '', x);
          elm.set_labels(3, '', x);
          elm.hide_elm(1, x);
          elm.hide_elm(2, x);
          elm.idAnIma--;
        }
      }
      LipiLekhikA.capital = [0, '', -1, -1, 0, 0, false];
    }
    let next = v['key'][1],
      key = v['key'][0];
    let matra = v['mAtrA'],
      extra_cap = v['special_cap'],
      lang = v['lang'],
      sa = v['sa'];
    if (extra_cap[0])
      this.pUrvavarNa = [
        [l.akSharAH[lang][extra_cap[1][0]][extra_cap[1][0]][0], '', extra_cap[1][1]],
        extra_cap[1][0]
      ];
    this.adhar = v.elm;
    let cordinate = v.elm.caret('offset');
    let top = cordinate.top,
      hieght = cordinate.height,
      left = cordinate.left;
    // abhisthanam is to store the current position in contenteditable as it is lost on click
    if (!l.in(['input', 'textarea'], v.elm[0].tagName.toLowerCase())) {
      let caret = new $lf.CaretPos(v.elm[0]);
      this.abhisthAnam = caret.getPos() + 2;
    }
    this.elm[0].style.top = `${top + hieght}px`;
    this.elm[0].style.left = `${left + 8}px`;
    let halant = ['', false];
    if (!l.in(['Urdu', 'Romanized', 'Normal'], lang))
      halant = [l.akSharAH[lang]['.']['.x'][0], sa == 1];
    let a = new Map(),
      b = l.akSharAH[lang][key[0]],
      count = 0;
    for (let x of next) {
      if (key + x in b) {
        a.set(x, b[key + x]);
        for (let y of l.last(b[key + x], -2))
          if (key + x + y in b) {
            a.set(x + y, b[key + x + y]);
            count++;
          }
        count++;
      }
    }
    let c = 0,
      cap_count = [0, 0];
    if ('cap' in v) {
      cap_count[0] = count;
      let tmp = l.to_upper(key);
      let b1 = l.akSharAH[lang][tmp];
      a.set(key + key, b1[tmp]);
      let next = l.last(a.get(key + key), -2);
      for (let x of next)
        if (tmp + x in b1) {
          a.set(key + key + x, b1[tmp + x]);
          for (let y of l.last(b1[tmp + x], -2))
            if (tmp + x + y in b1) {
              a.set(key + key + x + y, b1[tmp + x + y]);
              count++;
            }
          count++;
        }
      cap_count[1] = count + 1;
    }
    if ((l.in([1, 3], l.last(this.pUrvavarNa[0])) || matra) && l.last(b[key]) == 0) {
      let k12 = this.pUrvavarNa[0][0] + b[key][1];
      if (l.last(this.pUrvavarNa[0]) == 3 && key != 'a')
        k12 = l.substring(k12, 0, -2) + l.last(k12) + l.last(k12, -2);
      this.set_labels(4, this.pUrvavarNa[1] + key);
      this.set_labels(5, k12);
    } else {
      this.set_labels(4, key);
      let l12 = b[key][0] + (l.in([1, 3], l.last(b[key])) ? halant[0] : '');
      if (l.last(b[key]) == 3) l12 = l.substring(l12, 0, -2) + l.last(l12) + l.last(l12, -2);
      this.set_labels(5, l12);
    }
    let extra = 0;
    for (let x of a.keys()) {
      if (matra && l.in([1, 2], l.last(a.get(x)))) {
        extra++;
        continue;
      }
      this.set_labels(2, x, c);
      let k = a.get(x)[0];
      if (l.last(a.get(x)) == 0 && l.in([1, 3], l.last(this.pUrvavarNa[0]))) k = a.get(x)[1];
      if (l.in([1, 3], l.last(a.get(x))) && halant[1]) {
        k += halant[0];
        if (l.last(a.get(x)) == 3) k = l.substring(k, 0, -2) + l.last(k) + l.last(k, -2);
      }
      if ((l.in([1, 3], l.last(this.pUrvavarNa[0])) || matra) && l.last(a.get(x)) == 0) {
        k = this.pUrvavarNa[0][0] + k;
        if (l.last(this.pUrvavarNa[0]) == 3) k = l.substring(k, 0, -2) + l.last(k) + l.last(k, -2);
      }
      this.set_labels(3, k, c);
      c++;
    }
    let len = 0;
    for (let x of a.keys()) len++;
    len -= extra;
    if (len >= this.idAnIma) {
      for (let x = this.idAnIma; x < len; x++) {
        this.show_elm(1, x);
        this.show_elm(2, x);
      }
    } else {
      for (let x = len; x < this.idAnIma; x++) {
        this.hide_elm(1, x);
        this.hide_elm(2, x);
      }
    }
    this.idAnIma = len;
    this.c++;
    if (!matra) this.pUrvavarNa = [b[key], key];
    this.elm.show();
    if ('cap' in v) {
      this.d++;
      this.reset_capital_status = true;
      setTimeout(function () {
        reset_capital(cap_count);
      }, 4000);
    }
    let klj = this.hide_other;
    setTimeout(function () {
      klj();
    }, 15000);
  }
  hide_elm(type, x) {
    this.bhaNDAra[['pashchAta', 'akShara'][type - 1]][x + 2].style.removeProperty('display');
  }
  show_elm(type, x) {
    this.bhaNDAra[['pashchAta', 'akShara'][type - 1]][x + 2].style.display = 'table-cell';
  }
  set_labels(type, txt, index = -1) {
    if (index != -1 && (type == 3 || type == 2)) {
      index += 2;
      type--;
      this.bhaNDAra[this.bhaNDAra_index[type]][index].innerHTML = txt;
      if (type == 2) this.bhaNDAra.pashchAta[index].title = txt;
      else if (type == 1) {
        this.bhaNDAra.akShara[index].title = txt;
        this.bhaNDAra.akShara[index].value = txt;
        this.bhaNDAra.pashchAta[index].value = txt;
      }
    } else this.bhaNDAra[this.bhaNDAra_index[type - 1]].innerHTML = txt;
  }
  set_lang(l) {
    let gh = () => {
      let data = this.display[l];
      this.ins_msg = this.k.text_to_html(data['ins'], 'li');
      this.elm.attr('title', data['title']);
      for (let x in this.objs) this.objs[x].attr('title', data[x]);
      if (this.ins_sthiti == 0) this.set_labels(1, this.ins_msg);
    };
    if (!(l in this.display)) {
      $lf.get(`${this.k.sanchit}/sahayika/${l}.json`, {
        dataType: 'json',
        success: (result) => {
          this.display[l] = result;
          gh();
        }
      });
    } else gh();
  }
}

const lipi_hlp = new lipi_helper();
const LipiLekhikA = new LipiParivartak();
lipi_hlp.k = LipiLekhikA;

export default LipiLekhikA;

/**
 * @param {string} lang
 * @returns {string}
 */
export const normalize_lang_code = (lang) => {
  return lipi_hlp.normalize(lang);
};

export const load_parivartak_lang_data = async (lang) => {
  await LipiLekhikA.k.load_lang(lang);
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
export const lipi_parivartak = (val, from, to) => {
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
export const lipi_parivartak_async = async (val, from, to) => {
  await load_parivartak_lang_data(from);
  await load_parivartak_lang_data(to);
  return lipi_parivartak(val, from, to);
};
