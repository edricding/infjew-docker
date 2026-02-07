;(function (window) {
  "use strict";

  var mainContainer = document.getElementById("verify-main-section");
  var tagOpenCtrl = document.getElementById("go-verify-tag-btn");
  var orderOpenCtrl = document.getElementById("go-verify-order-btn");
  var closeCtrl = document.getElementById("btn-search-close");
  var searchContainer = document.getElementById("verify-search-section");
  var searchForm = document.querySelector("#verify-search-section .search__form");
  var inputSearch = document.getElementById("verify-search-input");
  var searchInfo = document.querySelector("#verify-search-section .search__info");

  function openSearch(mode) {
    if (!mainContainer || !searchContainer || !inputSearch) {
      return;
    }

    var isTagMode = mode === "tag";
    if (searchInfo) {
      searchInfo.textContent = isTagMode
        ? "Hit enter to search tag or ESC to close"
        : "Hit enter to search order or ESC to close";
    }
    inputSearch.placeholder = isTagMode ? "Search tag code" : "Search order code";

    mainContainer.classList.add("main-wrap--move");
    searchContainer.classList.add("search--open");
    inputSearch.focus();
  }

  function closeSearch() {
    if (!mainContainer || !searchContainer || !inputSearch) {
      return;
    }

    mainContainer.classList.remove("main-wrap--move");
    searchContainer.classList.remove("search--open");
    inputSearch.blur();
    inputSearch.value = "";
  }

  function initEvents() {
    if (tagOpenCtrl) {
      tagOpenCtrl.addEventListener("click", function () {
        openSearch("tag");
      });
    }

    if (orderOpenCtrl) {
      orderOpenCtrl.addEventListener("click", function () {
        openSearch("order");
      });
    }

    if (closeCtrl) {
      closeCtrl.addEventListener("click", closeSearch);
    }

    document.addEventListener("keyup", function (event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        closeSearch();
      }
    });

    if (searchContainer && searchForm) {
      searchContainer.addEventListener("click", function (event) {
        if (!searchForm.contains(event.target) && event.target !== tagOpenCtrl && event.target !== orderOpenCtrl) {
          closeSearch();
        }
      });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    }
  }

  initEvents();
})(window);
