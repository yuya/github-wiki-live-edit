(function (window, document) {

var _$;
var qsaRe = /^(.+[\#\.\s\[\*>:,]|[\[:])/;

_$ = function (selector, context) {
  context = context || document;

  var nodes;

  switch (selector[0]) {
    case "#":
      nodes = [context.getElementById(selector.substring(1, selector.length))];
      break;
    case ".":
      nodes = context.getElementsByClassName(selector.substring(1, selector.length));
      break;
    default:
      nodes = qsaRe.test(selector) ?
          context.querySelectorAll(selector) :
          context.getElementsByName(selector)
      ;
      break;
  }

  return new _$.fn.init(nodes || [], selector);
}

_$.fn = _$.prototype = {
  constructor: _$,
  init: function (nodes, selector) {
    var i = 0;
    var l = this.length = nodes.length;

    this.selector = selector;

    for (; l; ++i, --l) {
      this[i] = nodes[i];
    }

    return this;
  },

  each: function (obj) {
    var i = 0;
    var l = this.length;

    for (; l; ++i, --l) {
      obj.call(this[i], l);
    }

    return this;
  },

  addClass: function (klass) {
    return this.each(function () {
      this.classList.add(klass);
    });
  },

  removeClass: function (klass) {
    return this.each(function () {
      this.classList.remove(klass);
    });
  },

  attr: function (name, value) {
    if (name && value) {
      return this.each(function () {
        this.setAttribute(name, value);
      });
    }

    return this;
  }
};

_$.fn.init.prototype = _$.fn;
window._$ = _$;

})(this, this.document);

(function (window, document) {

var style = document.createElement("style");
var inlineCSS = [
  ".edit-mode { padding: 30px; }",
  ".edit-mode .container { width: auto; }",
  ".edit-mode .header,",
  ".edit-mode .pagehead,",
  ".edit-mode .comment-form-head tabnav,",
  ".edit-mode .site-footer-container { display: none; }",
  ".edit-mode #gollum-editor-help { position: relative; margin-bottom: 30px; }",
  // ".edit-mode #gollum-editor-help { position: relative; margin-bottom: 10px; padding-bottom: 10px; }",
  // ".edit-mode #gollum-editor-help:after { display: block; position: absolute; bottom: -10px; left: 0; width: 100%; height: 0; border-bottom: 1px solid #ddd; content: ''; }",
  ".edit-mode .write-content,",
  ".edit-mode .preview-content { display: block; position: relative; width: 50%; margin: 0; }",
  ".edit-mode .write-content   { float: left; }",
  ".edit-mode .preview-content { float: right; }",
  ".edit-mode .preview-content:before { display: block; position: absolute; top: 0; left: 0; width: 0; height: 100%; border-left: 1px solid red; content: '' }",
  ".edit-mode .previewable-comment-form { overflow: hidden; }",
  ".edit-mode .gollum-editor .gollum-editor-body { margin: 0; padding: 0; border: none; box-shadow: none; }",
  ".edit-mode #gollum-editor-body { min-height: initial; }",
  ".edit-mode .new-discussion-timeline .previewable-comment-form .comment-body { padding: 0; border-bottom: none; }",
].join("\n");

style.innerText = inlineCSS;
document.body.appendChild(style);
document.body.classList.add("edit-mode");

// -----------------------------------------------------------

function Throttle(interval) {
  interval = interval || 100;

  var _timeStamp = 0;
  var _timerId;

  function exec(func) {
    var now   = Date.now();
    var delta = now - _timeStamp;

    clearTimeout(_timerId);

    if (delta >= interval) {
      _timeStamp = now;
      func();
    }
    else {
      _timerId = setTimeout(function () {
        exec(func);
      }, interval - delta);
    }
  }

  return {
    "exec" : exec
  };
}

var throttle = new Throttle(500);
var form     = document.getElementById("gollum-editor-body");
var editor   = document.querySelector(".js-previewable-comment-form");

function updatePreview() {
  throttle.exec(function () {
    editor.dispatchEvent(new CustomEvent("preview:render", {
      bubbles: true,
      cancelable: false,
      detail: {
            requestedAt: Date.now()
        }
      })
    )
  });
}

document.addEventListener("DOMContentLoaded", updatePreview);
form.addEventListener("keyup", updatePreview);

})(this, this.document);
