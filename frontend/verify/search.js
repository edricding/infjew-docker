;(function (window) {
  "use strict";

  var stage = document.getElementById("verify-card-stack");
  var panel = document.getElementById("verify-search-panel");
  var form = panel ? panel.querySelector(".verify-search-panel__form") : null;
  var inputTag = document.getElementById("verify-search-input-tag");
  var inputOrder = document.getElementById("verify-search-input-order");
  var infoTag = document.getElementById("verify-search-info-tag");
  var infoOrder = document.getElementById("verify-search-info-order");
  var openTagBtn = document.getElementById("go-verify-tag-btn");
  var openOrderBtn = document.getElementById("go-verify-order-btn");
  var closeBtn = document.getElementById("verify-search-close-btn");
  var root = document.documentElement;
  var body = document.body;
  var currentMode = "tag";

  function setScrollLock(isLocked) {
    if (!root || !body) {
      return;
    }

    root.classList.toggle("verify-scroll-locked", isLocked);
    body.classList.toggle("verify-scroll-locked", isLocked);
  }

  function toggleVisible(element, isVisible) {
    if (!element) {
      return;
    }

    element.classList.toggle("d-none", !isVisible);
  }

  function setSearchMode(mode) {
    currentMode = mode === "order" ? "order" : "tag";
    var isTagMode = currentMode === "tag";

    toggleVisible(inputTag, isTagMode);
    toggleVisible(infoTag, isTagMode);
    toggleVisible(inputOrder, !isTagMode);
    toggleVisible(infoOrder, !isTagMode);
  }

  function getActiveInput() {
    return currentMode === "tag" ? inputTag : inputOrder;
  }

  function openSearch(mode) {
    if (!stage || !panel) {
      return;
    }

    setSearchMode(mode);
    stage.classList.add("is-shifted");
    panel.classList.add("is-open");
    setScrollLock(true);

    var activeInput = getActiveInput();
    if (activeInput) {
      activeInput.focus();
    }
  }

  function closeSearch() {
    if (!stage || !panel) {
      return;
    }

    stage.classList.remove("is-shifted");
    panel.classList.remove("is-open");
    setScrollLock(false);

    if (inputTag) {
      inputTag.blur();
      inputTag.value = "";
    }
    if (inputOrder) {
      inputOrder.blur();
      inputOrder.value = "";
    }
  }

  function bindEvents() {
    setSearchMode("tag");

    if (openTagBtn) {
      openTagBtn.addEventListener("click", function () {
        openSearch("tag");
      });
    }

    if (openOrderBtn) {
      openOrderBtn.addEventListener("click", function () {
        openSearch("order");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeSearch);
    }

    if (panel && form) {
      panel.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          closeSearch();
        }
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    }

    document.addEventListener("keyup", function (event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        closeSearch();
      }
    });
  }

  bindEvents();
})(window);
