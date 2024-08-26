class lquery {
  constructor(sel) {
    this.sel = sel;
    this.elm = [];
    this.init();
  }
  init() {
    let sel = this.sel,
      elm = [];
    if (typeof sel == 'object') {
      if ('innerHTML' in sel) elm = [sel];
      else elm = sel;
    } else elm = document.querySelectorAll(sel);
    this.length = elm.length;
    for (let x = 0; x < this.length; x++) this[x] = elm[x];
    this.elm = elm;
    return this;
  }
  html() {
    let arg = arguments;
    if (this.length == 0) return this;
    if (arg.length == 0) return this[0].innerHTML;
    else if (arg.length == 1) {
      for (let x of this.elm) x.innerHTML = arg[0];
      return this;
    }
  }
  text() {
    let arg = arguments;
    if (this.length == 0) return this;
    if (arg.length == 0) return this[0].innerText;
    else if (arg.length == 1) {
      for (let x of this.elm) x.innerText = arg[0];
      return this;
    }
  }
  val() {
    let arg = arguments;
    if (this.length == 0) return this;
    if (arg.length == 0) return this[0].value;
    else if (arg.length == 1) {
      for (let x of this.elm) x.value = arg[0];
      return this;
    }
  }
  attr() {
    let arg = arguments;
    if (this.length == 0) return this;
    if (arg.length == 1)
      if (typeof arg[0] == 'object') {
        for (let x of this.elm) for (let ar in arg[0]) x.setAttribute(ar, arg[0][ar]);
        return this;
      } else return this[0].getAttribute(arg[0]);
    else if (arg.length == 2) {
      for (let x of this.elm) x.setAttribute(arg[0], arg[1]);
      return this;
    }
  }
  removeAttr() {
    let arg = arguments;
    for (let x of this.elm) x.removeAttribute(arg[0]);
    return this;
  }
  trigger() {
    let arg = arguments;
    for (let x of this.elm) x.dispatchEvent(new Event(arg[0]));
    return this;
  }
  on() {
    let arg = arguments;
    for (let x of this.elm) x.addEventListener(arg[0], arg[1]);
    return this;
  }
  append() {
    let arg = arguments;
    for (let x of this.elm) x.insertAdjacentHTML('beforeend', arg[0]);
    return this;
  }
  appendHTML() {
    let arg = arguments;
    let el = $lf.make(arg[0]);
    for (let x of this.elm) x.insertAdjacentElement('beforeend', el);
    return $l(el);
  }
  afterHTML() {
    let arg = arguments;
    let el = $lf.make(arg[0]);
    for (let x of this.elm) x.insertAdjacentElement('afterend', el);
    return $l(el);
  }
  after() {
    let arg = arguments;
    for (let x of this.elm) x.insertAdjacentHTML('afterend', arg[0]);
    return this;
  }
  before() {
    let arg = arguments;
    for (let x of this.elm) x.insertAdjacentHTML('beforebegin', arg[0]);
    return this;
  }
  addClass() {
    let arg = arguments;
    for (let x of this.elm) x.classList.add(arg[0]);
    return this;
  }
  removeClass() {
    let arg = arguments;
    for (let x of this.elm) x.classList.remove(arg[0]);
    return this;
  }
  toggleClass() {
    let arg = arguments;
    for (let x of this.elm) x.classList.toggle(arg[0]);
    return this;
  }
  focus() {
    let arg = arguments;
    if (this.length == 0) return this;
    this[0].focus();
    return this;
  }
  css() {
    let arg = arguments;
    if (this.length == 0) return this;
    if (arg.length == 1)
      if (typeof arg[0] == 'object') {
        for (let x of this.elm) Object.assign(x.style, arg[0]);
        return this;
      } else {
        let vl = getComputedStyle(this[0]);
        if (vl != undefined && vl != null) return vl[arg[0]];
        else return '';
      }
    else if (arg.length == 2) {
      for (let x of this.elm) x.style[arg[0]] = arg[1];
      return this;
    }
  }
  removeCss() {
    let arg = arguments;
    for (let x of this.elm) x.style.removeProperty(arg[0]);
    return this;
  }
  check() {
    let arg = arguments;
    if (this.length == 0) return this;
    if (arg.length == 0) this[0].checked;
    else if (arg.length == 1) {
      for (let x of this.elm) x.checked = arg[0];
      return this;
    }
  }
  show() {
    let lst = {
      div: 'block',
      span: 'inline'
    };
    for (let x of this.elm) {
      let e = $l(x);
      if (e.css('display') == 'none') {
        e.removeCss('display');
        if (e.css('display') == 'none') {
          let nm = x.tagName.toLowerCase();
          if (nm in lst) {
            e.css('display', lst[nm]);
          } else {
            let el = $l('body').appendHTML(`<${nm}></${nm}>`);
            e.css('display', el.css('display'));
            el.remove();
          }
        }
      }
    }
    return this;
  }
  hide() {
    for (let x of this.elm) if ($l(x).css('display') != 'none') x.style.display = 'none';
    return this;
  }
  children() {
    let ch = [];
    for (let x of this.elm) {
      for (let y of x.children) ch.push(y);
    }
    return ch;
  }
  remove() {
    for (let x of this.elm) x.remove();
    return this;
  }
  find() {
    let arg = arguments;
    if (this.length == 0) return this;
    let o = $l($lf.make('<div></div>'));
    let elm = this[0].querySelectorAll(arg[0]);
    o.length = elm.length;
    for (let x = 0; x < o.length; x++) o[x] = elm[x];
    o.elm = elm;
    return o;
  }
  width() {
    if (this.length == 0) return this;
    return this[0].offsetWidth;
  }
  height() {
    if (this.length == 0) return this;
    return this[0].offsetHeight;
  }
  parent() {
    if (this.length == 0) return this;
    return $l(this[0].parentElement);
  }
  parents() {
    if (this.length == 0) return $l([]);
    var a = this[0];
    var els = [];
    while (a) {
      els.push(a);
      a = a.parentNode;
    }
    return els;
  }
  index(v) {
    return this.elm.indexOf(v);
  }
  offset(options) {
    if (this.length == 0)
      return {
        top: 0,
        left: 0
      };
    var rect,
      win,
      elem = this[0];
    if (!elem) {
      return;
    }
    if (!elem.getClientRects().length) {
      return {
        top: 0,
        left: 0
      };
    }
    rect = elem.getBoundingClientRect();
    win = elem.ownerDocument.defaultView;
    return {
      top: rect.top + win.pageYOffset,
      left: rect.left + win.pageXOffset
    };
  }
  scrollLeft() {
    if (this.length == 0) return 0;
    return this[0].scrollLeft;
  }
  scrollTop() {
    if (this.length == 0) return 0;
    return this[0].scrollTop;
  }
  prop() {
    let arg = arguments;
    return this.attr(arg);
  }
  position(parent = null) {
    if (this.length == 0)
      return {
        top: 0,
        left: 0
      };
    let child = this[0].getBoundingClientRect();
    var parent = this[0].parentElement.getBoundingClientRect();
    return {
      top: child.top - parent.top,
      left: child.left - parent.left
    };
  }
  resize() {
    if (this.length == 0) return this;
    for (let e of this.elm) {
      let e1 = $l(e);
      e.style.width = '';
      let i = e.innerHTML,
        o = e.outerHTML;
      o = $lf.replace_all(o, i, '');
      o = $lf.replace_all(o, 'id=', 'idk=');
      o = $l('body').appendHTML(o).show();
      o.html(`<option>${e1.find('option:checked').html()}</option>`);
      let f = o.width();
      o.remove();
      e.style.width = `${f + 7}px`;
    }
    return this;
  }
}
class lipi_util {
  make(html) {
    var template = document.createElement('div');
    template.innerHTML = html.trim();
    return template.firstChild;
  }
  ajax(url, op = {}) {
    let xhr = new XMLHttpRequest();
    if ('xhr' in op) xhr = op.xhr();
    let _async = 'async' in op ? op.async : true;
    let typ = 'type' in op ? op.type : 'GET';
    xhr.open(typ, url, _async);
    let data = 'data' in op ? op.data : null;

    function hdr(k, sl = false) {
      let vl = xhr.getResponseHeader(k);
      if (vl != null && vl != undefined)
        if (sl) return vl.split(';')[0];
        else return vl;
      else return undefined;
    }
    if ('dataType' in op) xhr.responseType = op['dataType'];
    if ('json' in op) {
      data = JSON.stringify(op.json);
      xhr.setRequestHeader('content-type', 'application/json;charset=utf-8');
    }
    if ('contentType' in op) xhr.setRequestHeader('content-type', op.contentType);
    if ('headers' in op) for (let x in op.headers) xhr.setRequestHeader(x, op.headers[x]);
    xhr.send(data);
    let scs = function () {
      let type = hdr('content-type', true);
      let v = xhr.response;
      if (parseInt(xhr.status / 100) == 2) {
        if (type == 'application/json' && xhr.responseType != 'json') v = JSON.parse(v);
        if ('success' in op) op.success(v, xhr, xhr.status, type);
      } else if ('error' in op) op.error(v, xhr, xhr.status, type);
      return v;
    };
    if (_async) {
      let pr = new Promise((rs) => {
        xhr.onerror = () => rs('Network Error');
        xhr.onload = () => rs(scs());
      });
      pr.xhr = xhr;
      return pr;
    } else return scs();
  }
  get(url, op = {}) {
    op.type = 'GET';
    return this.ajax(url, op);
  }
  post(url, op = {}) {
    op.type = 'POST';
    return this.ajax(url, op);
  }
  getScript(url, call = null) {
    let e = document.createElement('script');
    e.src = url;
    $l('body')[0].appendChild(e);
    e.onload = () => {
      e.remove();
      if (call != null) call();
    };
  }
  isPlainObject(o) {
    return typeof o == 'object' && o.constructor == Object;
  }
  in(val, in_what) {
    return val.indexOf(in_what) != -1;
  }
  replace_all(str, replaceWhat, replaceTo) {
    replaceWhat = replaceWhat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var re = new RegExp(replaceWhat, 'g');
    return str.replace(re, replaceTo);
  }
  last(s, l = -1) {
    if (s == null || s == undefined) return '';
    let r = s[s.length + l];
    return r;
  }
  time() {
    let a = new Date();
    return a.getTime() / 1000;
  }
  dict_rev(d) {
    let res = {};
    for (let x in d) {
      res[d[x]] = x;
    }
    return res;
  }
  substring(val, from, to = null) {
    if (to == null) to = val.length;
    if (to > 0) return val.substring(from, to);
    else if (to < 0) return val.substring(from, val.length + to);
  }
  format(val, l) {
    for (let x = 0; x < l.length; x++) val = this.replace_all(val, `{${x}}`, l[x]);
    return val;
  }
  json_to_address(v) {
    if ((v == null) | (v == undefined)) return [];
    let r = [];

    function prcs(x, n, pr) {
      let tp = typeof n[x];
      let v1 = `${pr}/${x}`;
      if (Array.isArray(x)) lst(n[x], v1);
      else if (tp == 'object') jsn(n[x], v1);
      else r.push(`${pr}/${x}`);
    }

    function jsn(n, pr = '') {
      for (let x in n) prcs(x, n, pr);
    }

    function lst(n, pr = '') {
      for (let x = 0; x < n.length; x++) prcs(x, n, pr);
    }
    if (typeof v == 'object') v = jsn(v);
    else if (Array.isArray(v)) v = lst(v);
    return r;
  }
  val_from_adress(lc, vl) {
    let n = vl;
    if (lc == '/') return n;
    lc = lc.substring(1).split('/');
    for (let x of lc) {
      let t = x;
      if (Array.isArray(n)) t = parseInt(t);
      n = n[t];
    }
    return n;
  }
  set_val_from_adress(lc, vl, val = null, make = false) {
    let n = vl;
    lc = lc.substring(1).split('/');
    let ln = lc.length;
    for (let i = 0; i < ln; i++) {
      let x = lc[i];
      let t = x;
      if (Array.isArray(n)) t = parseInt(t);
      if (i == ln - 1) n[t] = val;
      else {
        if (!(t in n) && make) n[t] = {};
        n = n[t];
      }
    }
    return vl;
  }
}
export const $l = function (sel) {
  let el = new lquery(sel);
  el.init();
  return el;
};
export const $lf = new lipi_util();
