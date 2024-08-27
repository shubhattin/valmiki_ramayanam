class lipi_query {
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
  let el = new lipi_query(sel);
  el.init();
  return el;
};
export const $lf = new lipi_util();

import { browser } from '$app/environment';

browser &&
  (() => {
    if (true) {
      // https://github.com/abhas9/vanilla-caret-js
      (function (factory) {
        var mod = {
          exports: {}
        };
        factory(mod);
        $lf.CaretPos = mod.exports;
      })(function (module) {
        'use strict';

        function _classCallCheck(instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
          }
        }
        var _createClass = (function () {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ('value' in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }
          return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();
        var CaretPos = (function () {
          function CaretPos(target) {
            _classCallCheck(this, CaretPos);

            this.target = target;
            this.isContentEditable = target && target.contentEditable;
          }
          _createClass(CaretPos, [
            {
              key: 'getPos',
              value: function getPos() {
                if (document.activeElement !== this.target) {
                  return -1;
                }
                if (this.isContentEditable) {
                  this.target.focus();
                  var _range = document.getSelection().getRangeAt(0);
                  var range = _range.cloneRange();
                  range.selectNodeContents(this.target);
                  range.setEnd(_range.endContainer, _range.endOffset);
                  return range.toString().length;
                }

                return this.target.selectionStart;
              }
            },
            {
              key: 'setPos',
              value: function setPos(position) {
                if (this.isContentEditable) {
                  if (position >= 0) {
                    var selection = window.getSelection();
                    var range = this.createRange(this.target, {
                      count: position
                    });
                    if (range) {
                      range.collapse(false);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    }
                  }
                } else {
                  this.target.setSelectionRange(position, position);
                }
              }
            },
            {
              key: 'createRange',
              value: function createRange(node, chars, range) {
                if (!range) {
                  range = document.createRange();
                  range.selectNode(node);
                  range.setStart(node, 0);
                }
                if (chars.count === 0) {
                  range.setEnd(node, chars.count);
                } else if (node && chars.count > 0) {
                  if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent.length < chars.count) {
                      chars.count -= node.textContent.length;
                    } else {
                      range.setEnd(node, chars.count);
                      chars.count = 0;
                    }
                  } else {
                    for (var lp = 0; lp < node.childNodes.length; lp++) {
                      range = this.createRange(node.childNodes[lp], chars, range);
                      if (chars.count === 0) {
                        break;
                      }
                    }
                  }
                }
                return range;
              }
            }
          ]);

          return CaretPos;
        })();
        module.exports = CaretPos;
      });
    }
    if (true) {
      // https://github.com/ichord/Caret.js/
      // मया पुनर्सृष्टः
      (function (factory) {
        factory();
      })(function () {
        'use strict';
        var EditableCaret,
          InputCaret,
          Mirror,
          Utils,
          discoveryIframeOf,
          methods,
          oDocument,
          oFrame,
          oWindow,
          pluginName,
          setContextBy;
        pluginName = 'caret';
        EditableCaret = (function () {
          function EditableCaret($inputor) {
            this.$inputor = $inputor;
            this.domInputor = this.$inputor[0];
          }
          EditableCaret.prototype.setPos = function (pos) {
            var fn, found, offset, sel;
            if ((sel = oWindow.getSelection())) {
              offset = 0;
              found = false;
              (fn = function (pos, parent) {
                var node, range, _i, _len, _ref, _results;
                _ref = parent.childNodes;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  node = _ref[_i];
                  if (found) {
                    break;
                  }
                  if (node.nodeType === 3) {
                    if (offset + node.length >= pos) {
                      found = true;
                      range = oDocument.createRange();
                      range.setStart(node, pos - offset);
                      sel.removeAllRanges();
                      sel.addRange(range);
                      break;
                    } else {
                      _results.push((offset += node.length));
                    }
                  } else {
                    _results.push(fn(pos, node));
                  }
                }
                return _results;
              })(pos, this.domInputor);
            }
            return this.domInputor;
          };
          EditableCaret.prototype.getIEPosition = function () {
            return this.getPosition();
          };
          EditableCaret.prototype.getPosition = function () {
            var inputor_offset, offset;
            offset = this.getOffset();
            inputor_offset = this.$inputor.offset();
            offset.left -= inputor_offset.left;
            offset.top -= inputor_offset.top;
            return offset;
          };
          EditableCaret.prototype.getPos = function () {
            var clonedRange, pos, range;
            if ((range = this.range())) {
              clonedRange = range.cloneRange();
              clonedRange.selectNodeContents(this.domInputor);
              clonedRange.setEnd(range.endContainer, range.endOffset);
              pos = clonedRange.toString().length;
              clonedRange.detach();
              return pos;
            }
          };
          EditableCaret.prototype.getOffset = function (pos) {
            var clonedRange, offset, range, rect, shadowCaret;
            if (oWindow.getSelection && (range = this.range())) {
              if (range.endOffset - 1 > 0 && range.endContainer !== this.domInputor) {
                clonedRange = range.cloneRange();
                clonedRange.setStart(range.endContainer, range.endOffset - 1);
                clonedRange.setEnd(range.endContainer, range.endOffset);
                rect = clonedRange.getBoundingClientRect();
                offset = {
                  height: rect.height,
                  left: rect.left + rect.width,
                  top: rect.top
                };
                clonedRange.detach();
              }
              if (!offset || (offset != null ? offset.height : void 0) === 0) {
                clonedRange = range.cloneRange();
                shadowCaret = oDocument.createTextNode('|');
                clonedRange.insertNode(shadowCaret);
                clonedRange.selectNode(shadowCaret);
                rect = clonedRange.getBoundingClientRect();
                offset = {
                  height: rect.height,
                  left: rect.left,
                  top: rect.top
                };
                shadowCaret.remove();
                clonedRange.detach();
              }
            }
            if (offset) {
              offset.top += oWindow.scrollY;
              offset.left += oWindow.scrollX;
            }
            return offset;
          };
          EditableCaret.prototype.range = function () {
            var sel;
            if (!oWindow.getSelection) {
              return;
            }
            sel = oWindow.getSelection();
            if (sel.rangeCount > 0) {
              return sel.getRangeAt(0);
            } else {
              return null;
            }
          };
          return EditableCaret;
        })();
        InputCaret = (function () {
          function InputCaret($inputor) {
            this.$inputor = $inputor;
            this.domInputor = this.$inputor[0];
          }
          InputCaret.prototype.getPos = function () {
            return this.domInputor.selectionStart;
          };
          InputCaret.prototype.setPos = function (pos) {
            var inputor, range;
            inputor = this.domInputor;
            if (oDocument.selection) {
              range = inputor.createTextRange();
              range.move('character', pos);
              range.select();
            } else if (inputor.setSelectionRange) {
              inputor.setSelectionRange(pos, pos);
            }
            return inputor;
          };
          InputCaret.prototype.getIEOffset = function (pos) {
            var h, textRange, x, y;
            textRange = this.domInputor.createTextRange();
            pos || (pos = this.getPos());
            textRange.move('character', pos);
            x = textRange.boundingLeft;
            y = textRange.boundingTop;
            h = textRange.boundingHeight;
            return {
              left: x,
              top: y,
              height: h
            };
          };
          InputCaret.prototype.getOffset = function (pos) {
            var $inputor, offset, position;
            $inputor = this.$inputor;
            if (oDocument.selection) {
              offset = this.getIEOffset(pos);
              offset.top += oWindow.scrollY + $inputor.scrollTop();
              offset.left += oWindow.scrollX + $inputor.scrollLeft();
              return offset;
            } else {
              offset = $inputor.offset();
              position = this.getPosition(pos);
              return (offset = {
                left: offset.left + position.left - $inputor.scrollLeft(),
                top: offset.top + position.top - $inputor.scrollTop(),
                height: position.height
              });
            }
          };
          InputCaret.prototype.getPosition = function (pos) {
            var $inputor, at_rect, end_range, format, html, mirror, start_range;
            $inputor = this.$inputor;
            format = function (value) {
              value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, '<br/>');
              if (/firefox/i.test(navigator.userAgent)) {
                value = value.replace(/\s/g, '&nbsp;');
              }
              return value;
            };
            if (pos === void 0) {
              pos = this.getPos();
            }
            start_range = $inputor.val().slice(0, pos);
            end_range = $inputor.val().slice(pos);
            html = format(start_range);
            html += "<span id='caret' style='position: relative; display: inline;'></span>";
            html += "<span id='caret_h' style='position: relative; display: inline;'>|</span>";
            html += format(end_range);
            mirror = new Mirror($inputor);
            return (at_rect = mirror.create(html).rect());
          };
          InputCaret.prototype.getIEPosition = function (pos) {
            var h, inputorOffset, offset, x, y;
            offset = this.getIEOffset(pos);
            inputorOffset = this.$inputor.offset();
            x = offset.left - inputorOffset.left;
            y = offset.top - inputorOffset.top;
            h = offset.height;
            return {
              left: x,
              top: y,
              height: h
            };
          };
          return InputCaret;
        })();
        Mirror = (function () {
          Mirror.prototype.css_attr = [
            'borderBottomWidth',
            'borderLeftWidth',
            'borderRightWidth',
            'borderTopStyle',
            'borderRightStyle',
            'borderBottomStyle',
            'borderLeftStyle',
            'borderTopWidth',
            'boxSizing',
            'fontFamily',
            'fontSize',
            'fontWeight',
            'height',
            'letterSpacing',
            'lineHeight',
            'marginBottom',
            'marginLeft',
            'marginRight',
            'marginTop',
            'outlineWidth',
            'overflow',
            'overflowX',
            'overflowY',
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
            'paddingTop',
            'textAlign',
            'textOverflow',
            'textTransform',
            'whiteSpace',
            'wordBreak',
            'wordWrap'
          ];

          function Mirror($inputor) {
            this.$inputor = $inputor;
          }
          Mirror.prototype.mirrorCss = function () {
            var css,
              _this = this;
            css = {
              position: 'absolute',
              left: -9999,
              top: 0,
              zIndex: -20000
            };
            if (this.$inputor[0].tagName == 'TEXTAREA') {
              this.css_attr.push('width');
            }
            for (let p of this.css_attr) css[p] = _this.$inputor.css(p);
            css['position'] = 'relative';
            css['display'] = 'block';
            return css;
          };
          Mirror.prototype.create = function (html) {
            this.$mirror = this.$inputor.afterHTML('<div></div>');
            this.$mirror.css(this.mirrorCss());
            this.$mirror.html(html);
            return this;
          };
          Mirror.prototype.rect = function () {
            var $flag, pos, rect;
            $flag = this.$mirror.find('#caret');
            pos = $flag.position();
            rect = {
              left: pos.left,
              top: pos.top,
              height: this.$mirror.find('#caret_h').height()
            };
            this.$mirror.remove();
            return rect;
          };
          return Mirror;
        })();
        Utils = {
          contentEditable: function ($inputor) {
            return !!($inputor[0].contentEditable && $inputor[0].contentEditable === 'true');
          }
        };
        methods = {
          pos: function (pos) {
            if (pos || pos === 0) {
              return this.setPos(pos);
            } else {
              return this.getPos();
            }
          },
          position: function (pos) {
            if (oDocument.selection) {
              return this.getIEPosition(pos);
            } else {
              return this.getPosition(pos);
            }
          },
          offset: function (pos) {
            var offset;
            offset = this.getOffset(pos);
            return offset;
          }
        };
        oDocument = null;
        oWindow = null;
        oFrame = null;
        setContextBy = function (settings) {
          var iframe;
          if ((iframe = settings != null ? settings.iframe : void 0)) {
            oFrame = iframe;
            oWindow = iframe.contentWindow;
            return (oDocument = iframe.contentDocument || oWindow.document);
          } else {
            oFrame = void 0;
            oWindow = window;
            return (oDocument = document);
          }
        };
        discoveryIframeOf = function ($dom) {
          var error;
          oDocument = $dom[0].ownerDocument;
          oWindow = oDocument.defaultView || oDocument.parentWindow;
          try {
            return (oFrame = oWindow.frameElement);
          } catch (_error) {
            error = _error;
          }
        };
        let lf = lipi_query.prototype;
        lf.caret = function (method, value, settings) {
          var caret;
          if (methods[method]) {
            if ($lf.isPlainObject(value)) {
              setContextBy(value);
              value = void 0;
            } else {
              setContextBy(settings);
            }
            caret = Utils.contentEditable(this) ? new EditableCaret(this) : new InputCaret(this);
            return methods[method].apply(caret, [value]);
          }
        };
        lf.caret.EditableCaret = EditableCaret;
        lf.caret.InputCaret = InputCaret;
        lf.caret.Utils = Utils;
        lf.caret.apis = methods;
      });
    }
  })();
