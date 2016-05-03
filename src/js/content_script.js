;(function (window, document) {
chrome.runtime.sendMessage({}, function (response) {});

var CLASS_NAME     = "__github-wiki-live-edit__"
var body           = document.body;
var headerActions  = document.querySelector(".gh-header-actions");
var toggleBtn      = document.createElement("div");
var toggleBtnInner = document.createElement("span");
var editor         = document.getElementById("gollum-editor-body");
var formBody       = document.querySelector(".previewable-comment-form");
var functionHelp   = document.getElementById("function-help");
var writeContent   = document.querySelector(".write-content");
var previewContent = document.querySelector(".preview-content");
var previewBody    = document.querySelector(".js-preview-body");
var editorSummary  = document.getElementById("gollum-editor-edit-summary");
var editorSubmit   = document.getElementById("gollum-editor-submit");

var style       = document.createElement("style");
var watchScroll = false;
var writeHeight, previewHeight;

var updatePreviewFunc = debounce(updatePreview, 500);

function debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function () {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    }
    else {
      timeout = null;
      result  = func.apply(context, args);

      if (!timeout) {
        context = args = null;
      }
    }
  };

  return function () {
    context   = this;
    args      = arguments;
    timestamp = Date.now();

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    return result;
  };
}

function applyStyle() {
  var inlineCSS = "\
    ." + CLASS_NAME + " .new-discussion-timeline .previewable-comment-form .comment-body > p {\
      background: url(" + chrome.extension.getURL('img/loader.gif') + ");\
    }\
  ";

  style.innerText = inlineCSS;
  body.appendChild(style);
  body.classList.add(CLASS_NAME);

  editorSummary.style.paddingRight = (40 + editorSubmit.offsetWidth) + "px";
}

function removeStyle() {
  body.removeChild(style);
  body.classList.remove(CLASS_NAME);
  editorSummary.style.paddingRight = "";
  editor.style.height = writeContent.style.height = previewContent.style.height = "";
}

function appendToggleButton() {
  var headerForm = headerActions ? headerActions.querySelector("form") : document.querySelector(".gh-header-title");
  var targetElement = headerForm ? headerForm : headerActions.getElementsByClassName("btn")[0];

  toggleBtn.className = "btn btn-sm __github-wiki-live-edit--btn-toggle-live-edit__";
  toggleBtn.title = "Quit LiveEdit";
  toggleBtnInner.innerText = "Quit";
  toggleBtnInner.style.backgroundImage = "url(" + chrome.extension.getURL('img/icon-16@2x.png') + ")";

  toggleBtn.appendChild(toggleBtnInner);

  if (headerActions) {
    headerActions.insertBefore(toggleBtn, targetElement);
  }
  else {
    var _ghHeader = document.querySelector(".gh-header");
    var _headerActions = document.createElement("div");

    _headerActions.className = "gh-header-actions";
    _headerActions.appendChild(toggleBtn);
    _ghHeader.insertBefore(_headerActions, targetElement);
  }
}

function toggleLiveEdit() {
  if (body.classList.contains(CLASS_NAME)) {
    removeStyle();
    toggleBtn.title = "Start LiveEdit";
    toggleBtnInner.innerText = "Start";

    editor.removeEventListener("keyup", updatePreviewFunc);
    functionHelp.removeEventListener("click", setContentHeight);
  }
  else {
    applyStyle();
    setContentHeight(true);
    toggleBtn.title = "Quit LiveEdit";
    toggleBtnInner.innerText = "Quit";

    editor.addEventListener("keyup", updatePreviewFunc);
    functionHelp.addEventListener("click", setContentHeight);
  }
}

function observePreview() {
  var regexp = /^Loading\spreview/;
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      var removedNode = mutation.removedNodes.length ? mutation.removedNodes[0] : false;

      if (removedNode && regexp.test(removedNode.innerText)) {
        setTimeout(function () {
          writeHeight   = editor.scrollHeight - editor.offsetHeight;
          previewHeight = previewContent.scrollHeight - previewContent.offsetHeight;

          if (!watchScroll) {
            watchScroll = true;
            editor.addEventListener("scroll", syncScroll);
          }
        }, 500);
      }
    });
  });

  observer.observe(previewBody, { childList: true });
}

function setContentHeight(immediate) {
  function _func() {
    var y = writeContent.getBoundingClientRect().top;
    var h = (window.innerHeight - y) + "px";

    editor.style.height = writeContent.style.height = previewContent.style.height = h;
  }

  if (immediate) {
    _func();
  }
  else {
    setTimeout(function () {
      _func();
    }, 500);
  }
}

function syncScroll() {
  previewContent.scrollTop = editor.scrollTop / (writeHeight / previewHeight);
}

function refresh() {
  setContentHeight();
  syncScroll();
}

function updatePreview() {
  formBody.dispatchEvent(new CustomEvent("preview:render", {
    bubbles: true,
    cancelable: false,
    detail: {
        requestedAt: Date.now()
      }
    })
  );
}

function addListener() {
  window.addEventListener("load", updatePreview);
  window.addEventListener("resize", debounce(refresh, 500));

  editor.addEventListener("keyup", updatePreviewFunc);
  toggleBtn.addEventListener("click", toggleLiveEdit);
  functionHelp.addEventListener("click", setContentHeight);
}

function initialize() {
  applyStyle();
  appendToggleButton();
  addListener();
  observePreview();
  setContentHeight();
}

initialize();

})(this, this.document);
