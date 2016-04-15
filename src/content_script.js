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

var textarea       = document.getElementById("gollum-editor-body");
var editor         = document.querySelector(".previewable-comment-form");
var writeContent   = document.querySelector(".write-content");
var previewContent = document.querySelector(".preview-content");
var functionHelp   = document.getElementById("function-help");
var editorSummary  = document.getElementById("gollum-editor-edit-summary");
var editorSubmit   = document.getElementById("gollum-editor-submit");

var style     = document.createElement("style");
var inlineCSS = "\
  .edit-mode { padding: 30px; }\
  .edit-mode .container { width: auto; }\
  .edit-mode .header,\
  .edit-mode .gh-header-actions a[href$='_new'],\
  .edit-mode .pagehead,\
  .edit-mode .comment-form-head,\
  .edit-mode #gollum-editor-edit-summary .jaws,\
  .edit-mode .site-footer-container { display: none; }\
  .gollum-editor-title-field { box-sizing: border-box; width: 50%; padding-right: 24px; }\
  .edit-mode #gollum-editor-help { position: relative; margin-top: 10px; }\
  .edit-mode .gollum-editor,\
  .edit-mode .gollum-editor-function-bar,\
  .edit-mode .gollum-editor-body { margin: 0; padding: 0; }\
  .edit-mode .gh-header,\
  .edit-mode .wiki-wrapper .wiki-content .gollum-editor-title-field { margin-bottom: 10px; }\
  .edit-mode .gollum-editor-function-bar { border-bottom: none; }\
  .edit-mode .write-content,\
  .edit-mode .preview-content { display: block; box-sizing: border-box; width: 50%; margin: 30px 0 0 !important; }\
  .edit-mode .write-content   { float: left; padding-right: 1px !important; background: #ddd; }\
  .edit-mode .preview-content { float: right; position: relative; overflow: scroll; padding-left: 24px !important; }\
  .edit-mode .previewable-comment-form { overflow: hidden; }\
  .edit-mode #gollum-editor-body { max-height: initial; padding-right: 15px; border: none; border-radius: 0; box-shadow: none; resize: none; }\
  .edit-mode #gollum-editor-edit-summary { position: absolute; top: 73px; left: 50%; box-sizing: border-box; width: 50%; margin: 0; padding-left: 24px; }\
  .edit-mode #gollum-editor-edit-summary .input-block { width: 100%; }\
  .edit-mode .form-actions { position: absolute; top: 73px; right: 30px; }\
  .edit-mode .new-discussion-timeline .previewable-comment-form .comment-body { padding: 0; border-bottom: none; }\
  .edit-mode .new-discussion-timeline .previewable-comment-form .comment-body > p {\
    display: block; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; width: 16px; height: 16px; color: rgba(0, 0, 0, 0);\
    background: url('data:image/gif;base64,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');\
  }\
";

style.innerText = inlineCSS;
document.body.appendChild(style);
document.body.classList.add("edit-mode");

editorSummary.style.paddingRight = (40 + editorSubmit.offsetWidth) + "px";

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

var throttle      = new Throttle(500);
var writeHeight   = textarea.scrollHeight;
var previewHeight = previewContent.scrollHeight;

function setContentHeight() {
  setTimeout(function () {
    var y = writeContent.getBoundingClientRect().top + 30;
    var h = (window.innerHeight - y) + "px";

    textarea.style.height = writeContent.style.height = previewContent.style.height = h;
  }, 500);
}

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

    setTimeout(function () {
      writeHeight   = textarea.scrollHeight - textarea.offsetHeight;
      previewHeight = previewContent.scrollHeight - previewContent.offsetHeight;
    }, 500);
  });
}

function syncScroll() {
  previewContent.scrollTop = textarea.scrollTop / (writeHeight / previewHeight);
}

setContentHeight();
functionHelp.addEventListener("click", setContentHeight);

textarea.addEventListener("keyup", function (event) {
  switch (event.code.toLowerCase()) {
    case "enter":
      updatePreview();
      break;
    default:
      break;
  }
});

window.addEventListener("resize", function () {
  setContentHeight();
  syncScroll();
});
textarea.addEventListener("scroll", syncScroll);

})(this, this.document);
