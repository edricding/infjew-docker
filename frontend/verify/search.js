;(function (window) {
  "use strict";

  var stage = document.getElementById("verify-card-stack");
  var panel = document.getElementById("verify-search-panel");
  var form = panel ? panel.querySelector(".verify-search-panel__form") : null;
  var inputTag = document.getElementById("verify-search-input-tag");
  var inputOrder = document.getElementById("verify-search-input-order");
  var infoTag = document.getElementById("verify-search-info-tag");
  var infoOrder = document.getElementById("verify-search-info-order");
  var infoTagGroup = panel ? panel.querySelectorAll(".verify-info-tag") : [];
  var infoOrderGroup = panel ? panel.querySelectorAll(".verify-info-order") : [];
  var openTagBtn = document.getElementById("go-verify-tag-btn");
  var openOrderBtn = document.getElementById("go-verify-order-btn");
  var closeBtn = document.getElementById("verify-search-close-btn");
  var backToSearchBtn = document.getElementById("verify-tag-back-to-search-btn");
  var orderBackToSearchBtn = document.getElementById("verify-order-back-to-search-btn");
  var fakeCardsArea = document.getElementById("verify-cards-fake");
  var tagCardsArea = document.getElementById("verify-cardsarea-tag");
  var orderCardsArea = document.getElementById("verify-cardsarea-order");
  var tagResultRow = document.getElementById("verify-tag-result-row");
  var tagNotFoundArea = document.getElementById("verify-tag-not-found");
  var orderNotFoundArea = document.getElementById("verify-order-not-found");
  var orderResultContent = document.getElementById("verify-order-result-content");
  var tagCodeTop = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-code-1 span")
    : null;
  var tagCodeBadge = document.getElementById("verify-card-tag-precious-code-badge");
  var tagName = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-name")
    : null;
  var tagCodeLine = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-code-2")
    : null;
  var tagTypeLine = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-type")
    : null;
  var tagTagLine = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-tag")
    : null;
  var tagMaterialsLine = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-materials")
    : null;
  var tagPrice = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-price")
    : null;
  var tagRatingStars = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-rating-stars")
    : null;
  var tagDesc = tagCardsArea
    ? tagCardsArea.querySelector("#verify-card-tag-precious-desc")
    : null;
  var tagNotFoundCode = tagNotFoundArea
    ? tagNotFoundArea.querySelector("h4")
    : null;
  var tagCarousel = tagCardsArea
    ? tagCardsArea.querySelector("#carouselExampleFade")
    : null;
  var tagCarouselInner = tagCarousel
    ? tagCarousel.querySelector(".carousel-inner")
    : null;
  var tagCarouselIndicators = tagCarousel
    ? tagCarousel.querySelector(".carousel-indicators")
    : null;
  var orderCodeBadge = document.getElementById("verify-order-code-badge");
  var orderCodeTitle = document.getElementById("verify-order-code-title");
  var orderDate = document.getElementById("verify-order-date");
  var orderEstimatedDelivery = document.getElementById("verify-order-estimated-delivery");
  var orderNotFoundCode = document.getElementById("verify-order-not-found-code");
  var defaultOrderCodeBadgeText = orderCodeBadge ? orderCodeBadge.textContent : "# -";
  var defaultOrderCodeTitleText = orderCodeTitle ? orderCodeTitle.textContent : "# -";
  var defaultOrderDateText = orderDate ? orderDate.textContent : "-";
  var defaultOrderEstimatedDeliveryText = orderEstimatedDelivery
    ? orderEstimatedDelivery.textContent
    : "-";
  var defaultOrderNotFoundCodeText = orderNotFoundCode
    ? orderNotFoundCode.textContent
    : "# -";
  var root = document.documentElement;
  var body = document.body;
  var currentMode = "tag";
  var isTagSearching = false;
  var isOrderSearching = false;

  var TAG_CODE_PATTERN = /^INF-[A-Z]\d{2}-[A-Z]\d{2}$/;
  var ORDER_CODE_PATTERN = /^INFO-[A-Z]\d{6}$/;
  var TAG_CODE_FORMAT = "INF-A00-A00";
  var ORDER_CODE_FORMAT = "INFO-A000000";
  var ORDER_VERIFY_API_PATH = "/api/public/verify/order";

  var TAG_INPUT_CONFIG = {
    prefix: "INF-",
    prefixSeed: "INF",
    slots: "A99A99",
    splitIndex: 3,
    displayLength: 11,
  };

  var ORDER_INPUT_CONFIG = {
    prefix: "INFO-",
    prefixSeed: "INFO",
    slots: "A999999",
    splitIndex: 0,
    displayLength: 12,
  };

  function sanitizeAlphaNumericUpper(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function matchesSlot(character, slotType) {
    if (slotType === "A") {
      return /^[A-Z]$/.test(character);
    }
    if (slotType === "9") {
      return /^\d$/.test(character);
    }
    return false;
  }

  function extractRawCode(value, config) {
    var cleanedValue = sanitizeAlphaNumericUpper(value);

    if (
      config.prefixSeed &&
      cleanedValue.indexOf(config.prefixSeed) === 0
    ) {
      cleanedValue = cleanedValue.slice(config.prefixSeed.length);
    }

    var raw = "";
    for (var i = 0; i < cleanedValue.length; i += 1) {
      if (raw.length >= config.slots.length) {
        break;
      }

      var character = cleanedValue.charAt(i);
      var expectedSlot = config.slots.charAt(raw.length);

      if (matchesSlot(character, expectedSlot)) {
        raw += character;
      } else {
        break;
      }
    }

    return raw;
  }

  function formatCode(raw, config) {
    if (!raw) {
      return "";
    }

    if (!config.splitIndex || raw.length <= config.splitIndex) {
      return config.prefix + raw;
    }

    return (
      config.prefix +
      raw.slice(0, config.splitIndex) +
      "-" +
      raw.slice(config.splitIndex)
    );
  }

  function formatTemplateCode(raw, config) {
    var safeRaw = String(raw || "").slice(0, config.slots.length);

    if (!config.splitIndex) {
      return config.prefix + safeRaw.padEnd(config.slots.length, "_");
    }

    var firstLength = config.splitIndex;
    var secondLength = config.slots.length - firstLength;
    var firstPart = safeRaw.slice(0, firstLength).padEnd(firstLength, "_");
    var secondPart = safeRaw.slice(firstLength).padEnd(secondLength, "_");

    return config.prefix + firstPart + "-" + secondPart;
  }

  function getCursorFromRawLength(rawLength, config) {
    var safeRawLength = Math.max(
      0,
      Math.min(rawLength, config.slots.length)
    );

    if (!config.splitIndex) {
      return config.prefix.length + safeRawLength;
    }

    if (safeRawLength <= config.splitIndex) {
      return config.prefix.length + safeRawLength;
    }

    return config.prefix.length + config.splitIndex + 1 + (safeRawLength - config.splitIndex);
  }

  function moveCursorTo(inputElement, position) {
    if (
      !inputElement ||
      typeof inputElement.setSelectionRange !== "function"
    ) {
      return;
    }

    try {
      inputElement.setSelectionRange(position, position);
    } catch (error) {
      // Ignore unsupported selection APIs.
    }
  }

  function getCodeController(inputElement) {
    if (!inputElement) {
      return null;
    }
    return inputElement.__verifyCodeController || null;
  }

  function getInputRawLength(inputElement, config) {
    var controller = getCodeController(inputElement);
    if (controller && typeof controller.getRaw === "function") {
      return controller.getRaw().length;
    }
    return extractRawCode(inputElement ? inputElement.value : "", config).length;
  }

  function getInputCode(inputElement, config) {
    var controller = getCodeController(inputElement);
    if (controller && typeof controller.getCode === "function") {
      return controller.getCode();
    }

    var raw = extractRawCode(inputElement ? inputElement.value : "", config);
    if (raw.length !== config.slots.length) {
      return "";
    }

    return formatCode(raw, config);
  }

  function resetCodeInput(inputElement) {
    var controller = getCodeController(inputElement);
    if (controller && typeof controller.reset === "function") {
      controller.reset();
      return;
    }

    if (inputElement) {
      inputElement.value = "";
    }
  }

  function setCodeInput(inputElement, code, config) {
    var controller = getCodeController(inputElement);
    if (controller && typeof controller.setCode === "function") {
      controller.setCode(code);
      return;
    }

    if (!inputElement) {
      return;
    }

    var normalizedCode = formatCode(extractRawCode(code, config), config);
    inputElement.value = normalizedCode;
  }

  function bindStrictCodeInput(inputElement, config) {
    if (!inputElement) {
      return null;
    }

    var isComposing = false;
    var raw = extractRawCode(inputElement.value, config);

    function render() {
      inputElement.value = formatTemplateCode(raw, config);
      inputElement.classList.toggle("text-muted-2", raw.length === 0);
      moveCursorTo(inputElement, getCursorFromRawLength(raw.length, config));
    }

    function appendFromText(text) {
      var cleanedText = sanitizeAlphaNumericUpper(text);

      if (
        config.prefixSeed &&
        cleanedText.indexOf(config.prefixSeed) === 0
      ) {
        cleanedText = cleanedText.slice(config.prefixSeed.length);
      }

      for (var i = 0; i < cleanedText.length; i += 1) {
        if (raw.length >= config.slots.length) {
          break;
        }

        var character = cleanedText.charAt(i);
        var expectedSlot = config.slots.charAt(raw.length);
        if (!matchesSlot(character, expectedSlot)) {
          break;
        }

        raw += character;
      }
    }

    function removeLastCharacter() {
      if (raw.length > 0) {
        raw = raw.slice(0, -1);
      }
    }

    function syncRawFromInputValue() {
      var nextRaw = extractRawCode(inputElement.value, config);
      if (nextRaw !== raw) {
        raw = nextRaw;
      }
    }

    inputElement.setAttribute("maxlength", String(config.displayLength));

    inputElement.addEventListener("focus", function () {
      window.setTimeout(function () {
        moveCursorTo(inputElement, getCursorFromRawLength(raw.length, config));
      }, 0);
    });

    inputElement.addEventListener("click", function () {
      moveCursorTo(inputElement, getCursorFromRawLength(raw.length, config));
    });

    inputElement.addEventListener("keydown", function (event) {
      if (!event) {
        return;
      }

      if (
        event.key === "Backspace" ||
        event.key === "Delete"
      ) {
        event.preventDefault();
        removeLastCharacter();
        render();
        return;
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
        moveCursorTo(inputElement, getCursorFromRawLength(raw.length, config));
      }
    });

    inputElement.addEventListener("beforeinput", function (event) {
      if (!event) {
        return;
      }

      var inputType = event.inputType || "";
      if (inputType.indexOf("delete") === 0) {
        event.preventDefault();
        removeLastCharacter();
        render();
        return;
      }

      if (event.isComposing || isComposing) {
        return;
      }

      if (inputType === "insertFromPaste") {
        event.preventDefault();
        return;
      }

      if (typeof event.data === "string" && event.data.length > 0) {
        event.preventDefault();
        appendFromText(event.data);
        render();
        return;
      }

      if (inputType) {
        event.preventDefault();
        render();
      }
    });

    inputElement.addEventListener("paste", function (event) {
      if (!event) {
        return;
      }

      event.preventDefault();
      var clipboardText = "";
      if (event.clipboardData && typeof event.clipboardData.getData === "function") {
        clipboardText = event.clipboardData.getData("text");
      } else if (
        window.clipboardData &&
        typeof window.clipboardData.getData === "function"
      ) {
        clipboardText = window.clipboardData.getData("Text");
      }
      appendFromText(clipboardText);
      render();
    });

    inputElement.addEventListener("compositionstart", function () {
      isComposing = true;
    });

    inputElement.addEventListener("compositionend", function (event) {
      isComposing = false;
      appendFromText(event && event.data ? event.data : "");
      render();
    });

    inputElement.addEventListener("input", function () {
      if (isComposing) {
        return;
      }

      syncRawFromInputValue();
      render();
    });

    var controller = {
      reset: function () {
        raw = "";
        render();
      },
      setCode: function (code) {
        raw = extractRawCode(code, config);
        render();
      },
      getRaw: function () {
        return raw;
      },
      getCode: function () {
        if (raw.length !== config.slots.length) {
          return "";
        }
        return formatCode(raw, config);
      },
    };

    inputElement.__verifyCodeController = controller;
    render();
    return controller;
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeDisplayText(value, fallback) {
    var text = String(value == null ? "" : value).trim();
    if (text === "") {
      return fallback || "-";
    }
    return text;
  }

  function getByPath(data, path) {
    if (!data || typeof data !== "object") {
      return null;
    }

    var parts = String(path || "").split(".");
    var current = data;
    for (var i = 0; i < parts.length; i += 1) {
      var key = parts[i];
      if (
        !current ||
        typeof current !== "object" ||
        !(key in current)
      ) {
        return null;
      }
      current = current[key];
    }

    return current;
  }

  function pickValue(data, paths, fallback) {
    for (var i = 0; i < paths.length; i += 1) {
      var value = getByPath(data, paths[i]);
      if (value != null && String(value).trim() !== "") {
        return value;
      }
    }
    return fallback;
  }

  function sanitizeURL(url) {
    var value = String(url == null ? "" : url).trim();
    if (!value) {
      return "";
    }

    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value)) {
      return value;
    }

    return "";
  }

  function formatPrice(value) {
    if (typeof value === "number" && isFinite(value)) {
      return value.toFixed(2);
    }

    var parsed = Number(value);
    if (isFinite(parsed)) {
      return parsed.toFixed(2);
    }

    return "--";
  }

  function normalizeRating(value) {
    if (value == null || value === "") {
      return null;
    }

    var parsed = Number(value);
    if (!isFinite(parsed)) {
      return null;
    }

    if (parsed < 0) {
      parsed = 0;
    } else if (parsed > 5) {
      parsed = 5;
    }

    return Math.round(parsed * 2) / 2;
  }

  function renderTagRating(value) {
    if (!tagRatingStars) {
      return;
    }

    var rating = normalizeRating(value);
    tagRatingStars.innerHTML = "";

    if (rating == null) {
      tagRatingStars.innerHTML = '<span class="text-muted fs-14">-</span>';
      tagRatingStars.removeAttribute("aria-label");
      return;
    }

    for (var i = 1; i <= 5; i += 1) {
      var star = document.createElement("span");

      if (rating >= i) {
        star.className = "ti ti-star-filled text-warning";
      } else if (rating >= i - 0.5) {
        star.className = "ti ti-star-half-filled text-warning";
      } else {
        star.className = "ti ti-star text-warning";
      }

      tagRatingStars.appendChild(star);
    }

    tagRatingStars.setAttribute("aria-label", "Rating: " + rating.toFixed(1) + " out of 5");
  }

  function getPreciousCodeBadge(code) {
    var value = String(code == null ? "" : code).trim();
    if (!value) {
      return "-";
    }

    var parts = value.split("-");
    if (parts.length >= 2 && parts[1]) {
      return parts[1];
    }

    return value;
  }

  function toggleSection(element, isVisible) {
    if (!element) {
      return;
    }

    element.classList.toggle("d-none", !isVisible);
  }

  function showTagResultArea() {
    toggleSection(fakeCardsArea, false);
    toggleSection(tagCardsArea, true);
    toggleSection(orderCardsArea, false);
    toggleSection(tagResultRow, true);
    toggleSection(tagNotFoundArea, false);
  }

  function showTagNotFoundArea(code) {
    toggleSection(fakeCardsArea, false);
    toggleSection(tagCardsArea, true);
    toggleSection(orderCardsArea, false);
    toggleSection(tagResultRow, false);
    toggleSection(tagNotFoundArea, true);

    if (tagNotFoundCode) {
      tagNotFoundCode.textContent = "# " + normalizeDisplayText(code, "-");
    }
  }

  function showOrderResultArea() {
    toggleSection(fakeCardsArea, false);
    toggleSection(tagCardsArea, false);
    toggleSection(orderCardsArea, true);
    toggleSection(orderResultContent, true);
    toggleSection(orderNotFoundArea, false);
  }

  function showOrderNotFoundArea(code) {
    toggleSection(fakeCardsArea, false);
    toggleSection(tagCardsArea, false);
    toggleSection(orderCardsArea, true);
    toggleSection(orderResultContent, false);
    toggleSection(orderNotFoundArea, true);

    if (orderNotFoundCode) {
      orderNotFoundCode.textContent = "# " + normalizeDisplayText(code, "-");
    }
  }

  function showFakeArea() {
    toggleSection(fakeCardsArea, true);
    toggleSection(tagCardsArea, false);
    toggleSection(orderCardsArea, false);
    toggleSection(tagResultRow, true);
    toggleSection(tagNotFoundArea, false);
    toggleSection(orderResultContent, true);
    toggleSection(orderNotFoundArea, false);
  }

  function resetTagResultContent() {
    if (tagCodeTop) {
      tagCodeTop.textContent = "-";
    }
    if (tagCodeBadge) {
      tagCodeBadge.textContent = "-";
    }
    if (tagName) {
      tagName.textContent = "-";
    }
    if (tagCodeLine) {
      tagCodeLine.innerHTML = '<span class="text-dark">Precious Code : </span> -';
    }
    if (tagTypeLine) {
      tagTypeLine.innerHTML = '<span class="text-dark">Type : </span> -';
    }
    if (tagTagLine) {
      tagTagLine.innerHTML = '<span class="text-dark">Tag : </span> -';
    }
    if (tagMaterialsLine) {
      tagMaterialsLine.innerHTML = '<span class="text-dark">Materials : </span> -';
    }
    if (tagPrice) {
      tagPrice.innerHTML = "$ <span>--</span>";
    }
    renderTagRating(null);
    if (tagDesc) {
      tagDesc.innerHTML = '<p class="text-muted mb-0">No description available.</p>';
    }
    if (tagNotFoundCode) {
      tagNotFoundCode.textContent = "# -";
    }
    if (tagCarouselInner) {
      tagCarouselInner.innerHTML = "";
    }
    if (tagCarouselIndicators) {
      tagCarouselIndicators.innerHTML = "";
    }
  }

  function resetOrderResultContent() {
    if (orderCodeBadge) {
      orderCodeBadge.textContent = defaultOrderCodeBadgeText;
    }
    if (orderCodeTitle) {
      orderCodeTitle.textContent = defaultOrderCodeTitleText;
    }
    if (orderDate) {
      orderDate.textContent = defaultOrderDateText;
    }
    if (orderEstimatedDelivery) {
      orderEstimatedDelivery.textContent = defaultOrderEstimatedDeliveryText;
    }
    if (orderNotFoundCode) {
      orderNotFoundCode.textContent = defaultOrderNotFoundCodeText;
    }
  }

  function resetToSearchView() {
    if (inputTag) {
      resetCodeInput(inputTag);
    }
    if (inputOrder) {
      resetCodeInput(inputOrder);
    }
    setSearchMode("tag");
    resetTagResultContent();
    resetOrderResultContent();
    showFakeArea();
  }

  function startSearchFromTopbar(mode) {
    resetToSearchView();
    openSearch(mode);
  }

  function collectPictureURLs(pictures) {
    if (!Array.isArray(pictures)) {
      return [];
    }

    var urls = [];
    for (var i = 0; i < pictures.length; i += 1) {
      var url = String(pictures[i] == null ? "" : pictures[i]).trim();
      if (url) {
        urls.push(url);
      }
    }

    return urls;
  }

  function renderTagPictures(pictures) {
    if (!tagCarousel || !tagCarouselInner || !tagCarouselIndicators) {
      return;
    }

    tagCarouselInner.innerHTML = "";
    tagCarouselIndicators.innerHTML = "";

    var urls = collectPictureURLs(pictures);
    if (urls.length === 0) {
      return;
    }

    var carouselID = tagCarousel.getAttribute("id") || "carouselExampleFade";

    for (var i = 0; i < urls.length; i += 1) {
      var pictureURL = urls[i];

      var slide = document.createElement("div");
      slide.className = "carousel-item text-center" + (i === 0 ? " active" : "");

      var image = document.createElement("img");
      image.src = pictureURL;
      image.alt = "Precious image " + (i + 1);
      image.className = "img-fluid bg-body shadow-none rounded";
      slide.appendChild(image);
      tagCarouselInner.appendChild(slide);

      var indicator = document.createElement("button");
      indicator.type = "button";
      indicator.setAttribute("data-bs-target", "#" + carouselID);
      indicator.setAttribute("data-bs-slide-to", String(i));
      indicator.setAttribute("aria-label", "Slide " + (i + 1));
      if (i === 0) {
        indicator.className = "h-auto rounded bg-light-subtle border active";
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.className = "h-auto rounded bg-light-subtle border";
      }
      indicator.style.width = "auto";

      var thumb = document.createElement("img");
      thumb.src = pictureURL;
      thumb.alt = "Precious thumbnail " + (i + 1);
      thumb.className = "d-block avatar-xl";
      indicator.appendChild(thumb);
      tagCarouselIndicators.appendChild(indicator);
    }

    if (
      window.bootstrap &&
      window.bootstrap.Carousel &&
      typeof window.bootstrap.Carousel.getOrCreateInstance === "function"
    ) {
      var carouselInstance = window.bootstrap.Carousel.getOrCreateInstance(tagCarousel);
      carouselInstance.to(0);
    }
  }

  function plainTextToHTML(text) {
    var value = String(text == null ? "" : text).trim();
    if (!value) {
      return "";
    }

    var paragraphs = value.split(/\n{2,}/);
    var html = "";
    for (var i = 0; i < paragraphs.length; i += 1) {
      var paragraph = paragraphs[i];
      var safeText = escapeHTML(paragraph).replace(/\n/g, "<br>");
      html += "<p>" + safeText + "</p>";
    }
    return html;
  }

  function sanitizeRichHTML(html) {
    var raw = String(html == null ? "" : html);
    if (!raw) {
      return "";
    }

    if (typeof window.DOMParser !== "function") {
      return plainTextToHTML(raw);
    }

    var parser = new window.DOMParser();
    var doc = parser.parseFromString("<div>" + raw + "</div>", "text/html");
    var root = doc.body ? doc.body.firstElementChild : null;
    if (!root) {
      return plainTextToHTML(raw);
    }

    var allowedTags = {
      a: true,
      b: true,
      strong: true,
      i: true,
      em: true,
      u: true,
      s: true,
      p: true,
      br: true,
      ul: true,
      ol: true,
      li: true,
      blockquote: true,
      pre: true,
      code: true,
      h1: true,
      h2: true,
      h3: true,
      h4: true,
      h5: true,
      h6: true,
      span: true,
    };

    function cleanNode(node) {
      if (!node) {
        return null;
      }

      if (node.nodeType === 3) {
        return document.createTextNode(node.nodeValue || "");
      }

      if (node.nodeType !== 1) {
        return null;
      }

      var tagName = String(node.tagName || "").toLowerCase();
      if (
        tagName === "script" ||
        tagName === "style" ||
        tagName === "iframe" ||
        tagName === "object" ||
        tagName === "embed"
      ) {
        return null;
      }

      var isAllowedTag = !!allowedTags[tagName];
      var container = isAllowedTag
        ? document.createElement(tagName)
        : document.createDocumentFragment();

      if (isAllowedTag && tagName === "a") {
        var href = sanitizeURL(node.getAttribute("href"));
        if (href) {
          container.setAttribute("href", href);
          container.setAttribute("target", "_blank");
          container.setAttribute("rel", "noopener noreferrer");
        }
      }

      var child = node.firstChild;
      while (child) {
        var cleanedChild = cleanNode(child);
        if (cleanedChild) {
          container.appendChild(cleanedChild);
        }
        child = child.nextSibling;
      }

      return container;
    }

    var safeRoot = document.createElement("div");
    var current = root.firstChild;
    while (current) {
      var cleaned = cleanNode(current);
      if (cleaned) {
        safeRoot.appendChild(cleaned);
      }
      current = current.nextSibling;
    }

    return safeRoot.innerHTML;
  }

  function applyInlineAttributes(text, attributes) {
    var html = escapeHTML(text);
    var attrs = attributes || {};

    if (attrs.link) {
      var href = sanitizeURL(attrs.link);
      if (href) {
        html =
          '<a href="' +
          escapeHTML(href) +
          '" target="_blank" rel="noopener noreferrer">' +
          html +
          "</a>";
      }
    }

    if (attrs.bold) {
      html = "<strong>" + html + "</strong>";
    }
    if (attrs.italic) {
      html = "<em>" + html + "</em>";
    }
    if (attrs.underline) {
      html = "<u>" + html + "</u>";
    }
    if (attrs.strike) {
      html = "<s>" + html + "</s>";
    }
    if (attrs.code) {
      html = "<code>" + html + "</code>";
    }
    if (attrs.script === "sub") {
      html = "<sub>" + html + "</sub>";
    }
    if (attrs.script === "super") {
      html = "<sup>" + html + "</sup>";
    }

    return html;
  }

  function quillDeltaToHTML(desc) {
    var ops = [];
    if (desc && Array.isArray(desc.ops)) {
      ops = desc.ops;
    } else if (Array.isArray(desc)) {
      ops = desc;
    }

    if (!ops.length) {
      return "";
    }

    var lines = [];
    var lineHTML = "";

    function pushLine(attrs) {
      lines.push({
        html: lineHTML,
        attrs: attrs || {},
      });
      lineHTML = "";
    }

    for (var i = 0; i < ops.length; i += 1) {
      var op = ops[i] || {};
      var attrs = op.attributes || {};
      var insert = op.insert;

      if (typeof insert === "string") {
        var chunks = insert.split("\n");
        for (var c = 0; c < chunks.length; c += 1) {
          var chunk = chunks[c];
          if (chunk) {
            lineHTML += applyInlineAttributes(chunk, attrs);
          }

          if (c < chunks.length - 1) {
            pushLine(attrs);
          }
        }
        continue;
      }

      if (insert && typeof insert === "object" && typeof insert.image === "string") {
        var imageURL = sanitizeURL(insert.image);
        if (imageURL) {
          lineHTML +=
            '<img src="' +
            escapeHTML(imageURL) +
            '" alt="Description image" class="img-fluid rounded my-2">';
        }
      }
    }

    if (lineHTML) {
      pushLine({});
    }

    var html = "";
    var activeListType = "";

    function closeActiveList() {
      if (activeListType) {
        html += "</" + activeListType + ">";
        activeListType = "";
      }
    }

    for (var j = 0; j < lines.length; j += 1) {
      var line = lines[j];
      var lineAttrs = line.attrs || {};
      var lineContent = line.html || "<br>";
      var listType = "";

      if (lineAttrs.list === "ordered") {
        listType = "ol";
      } else if (lineAttrs.list === "bullet") {
        listType = "ul";
      }

      if (listType) {
        if (activeListType !== listType) {
          closeActiveList();
          activeListType = listType;
          html += "<" + listType + ">";
        }
        html += "<li>" + lineContent + "</li>";
        continue;
      }

      closeActiveList();

      if (lineAttrs.header) {
        var level = Number(lineAttrs.header);
        if (!(level >= 1 && level <= 6)) {
          level = 4;
        }
        html += "<h" + level + ">" + lineContent + "</h" + level + ">";
        continue;
      }

      if (lineAttrs.blockquote) {
        html += "<blockquote>" + lineContent + "</blockquote>";
        continue;
      }

      if (lineAttrs["code-block"]) {
        html += "<pre><code>" + lineContent + "</code></pre>";
        continue;
      }

      html += "<p>" + lineContent + "</p>";
    }

    closeActiveList();
    return html;
  }

  function descToRichHTML(desc) {
    if (desc == null) {
      return "";
    }

    if (typeof desc === "string") {
      var trimmed = desc.trim();
      if (!trimmed) {
        return "";
      }

      if (/<[a-z][\s\S]*>/i.test(trimmed)) {
        return sanitizeRichHTML(trimmed);
      }

      return plainTextToHTML(trimmed);
    }

    if (typeof desc === "object") {
      var deltaHTML = quillDeltaToHTML(desc);
      if (deltaHTML) {
        return sanitizeRichHTML(deltaHTML);
      }

      return plainTextToHTML(JSON.stringify(desc, null, 2));
    }

    return plainTextToHTML(String(desc));
  }

  function renderTagSearchResult(data) {
    if (!data || typeof data !== "object") {
      return;
    }

    var preciousCode = normalizeDisplayText(data.precious_code, "-");
    var preciousName = normalizeDisplayText(data.precious_name, "-");
    var preciousType = normalizeDisplayText(data.precious_type, "-");
    var preciousTag = normalizeDisplayText(data.precious_tag, "-");
    var preciousMaterials = normalizeDisplayText(data.precious_materials, "-");
    var preciousPrice = formatPrice(data.precious_official_price);
    var preciousRating = pickValue(data, ["precious_rating", "rating"], null);
    var descHTML = descToRichHTML(data.precious_desc);

    if (tagCodeTop) {
      tagCodeTop.textContent = preciousCode;
    }
    if (tagCodeBadge) {
      tagCodeBadge.textContent = getPreciousCodeBadge(preciousCode);
    }
    if (tagName) {
      tagName.textContent = preciousName;
    }
    if (tagCodeLine) {
      tagCodeLine.innerHTML =
        '<span class="text-dark">Precious Code : </span> ' + escapeHTML(preciousCode);
    }
    if (tagTypeLine) {
      tagTypeLine.innerHTML =
        '<span class="text-dark">Type : </span> ' + escapeHTML(preciousType);
    }
    if (tagTagLine) {
      tagTagLine.innerHTML =
        '<span class="text-dark">Tag : </span> ' + escapeHTML(preciousTag);
    }
    if (tagMaterialsLine) {
      tagMaterialsLine.innerHTML =
        '<span class="text-dark">Materials : </span> ' + escapeHTML(preciousMaterials);
    }
    if (tagPrice) {
      tagPrice.innerHTML = "$ <span>" + escapeHTML(preciousPrice) + "</span>";
    }
    renderTagRating(preciousRating);
    if (tagDesc) {
      tagDesc.innerHTML =
        descHTML || '<p class="text-muted mb-0">No description available.</p>';
    }

    renderTagPictures(data.precious_pictures);
    showTagResultArea();
  }

  function renderOrderSearchResult(data, fallbackCode) {
    var source = data && typeof data === "object" ? data : {};
    var orderCodeValue = pickValue(
      source,
      [
        "order_code",
        "order_number",
        "order_id",
        "code",
        "number",
        "order.code",
        "order.number",
      ],
      fallbackCode || "-"
    );
    var orderDateValue = pickValue(
      source,
      [
        "order_date",
        "created_at",
        "createdAt",
        "date",
        "order.date",
        "order.created_at",
      ],
      defaultOrderDateText
    );
    var estimatedDeliveryValue = pickValue(
      source,
      [
        "estimated_delivery",
        "estimated_delivery_date",
        "estimatedDelivery",
        "eta",
        "delivery_date",
        "order.estimated_delivery",
      ],
      defaultOrderEstimatedDeliveryText
    );

    var orderCodeText = normalizeDisplayText(orderCodeValue, fallbackCode || "-");
    var orderDateText = normalizeDisplayText(orderDateValue, defaultOrderDateText);
    var estimatedDeliveryText = normalizeDisplayText(
      estimatedDeliveryValue,
      defaultOrderEstimatedDeliveryText
    );

    if (orderCodeBadge) {
      orderCodeBadge.textContent = orderCodeText.indexOf("#") === 0
        ? orderCodeText
        : "# " + orderCodeText;
    }
    if (orderCodeTitle) {
      orderCodeTitle.textContent = orderCodeText.indexOf("#") === 0
        ? orderCodeText
        : "# " + orderCodeText;
    }
    if (orderDate) {
      orderDate.textContent = orderDateText;
    }
    if (orderEstimatedDelivery) {
      orderEstimatedDelivery.textContent = estimatedDeliveryText;
    }

    showOrderResultArea();
  }

  function parseResponseJSON(response) {
    return response.text().then(function (text) {
      var parsed = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch (error) {
        parsed = null;
      }
      return parsed;
    });
  }

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

  function toggleVisibleGroup(elements, isVisible) {
    if (!elements || !elements.length) {
      return;
    }

    for (var i = 0; i < elements.length; i += 1) {
      toggleVisible(elements[i], isVisible);
    }
  }

  function getDefaultInfo(mode) {
    if (mode === "tag") {
      return "Hit enter to search tag code or ESC to close";
    }
    return "Hit enter to search order code or ESC to close";
  }

  function getActiveInfo() {
    return currentMode === "tag" ? infoTag : infoOrder;
  }

  function setInfoMessage(message, isError) {
    var infoElement = getActiveInfo();
    if (!infoElement) {
      return;
    }

    infoElement.textContent = message;
    infoElement.classList.toggle("text-danger", !!isError);
  }

  function setSearchMode(mode) {
    currentMode = mode === "order" ? "order" : "tag";
    var isTagMode = currentMode === "tag";

    toggleVisible(inputTag, isTagMode);
    toggleVisibleGroup(infoTagGroup, isTagMode);
    toggleVisible(inputOrder, !isTagMode);
    toggleVisibleGroup(infoOrderGroup, !isTagMode);

    if (infoTag) {
      infoTag.classList.remove("text-danger");
      infoTag.textContent = getDefaultInfo("tag");
    }
    if (infoOrder) {
      infoOrder.classList.remove("text-danger");
      infoOrder.textContent = getDefaultInfo("order");
    }
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
      resetCodeInput(inputTag);
    }
    if (inputOrder) {
      inputOrder.blur();
      resetCodeInput(inputOrder);
    }
  }

  function searchByTagCode(forcedTagCode) {
    if (!inputTag) {
      return;
    }

    if (isTagSearching) {
      return;
    }

    var tagCode = "";
    if (typeof forcedTagCode === "string" && forcedTagCode.trim() !== "") {
      tagCode = forcedTagCode.trim().toUpperCase();
    } else {
      tagCode = getInputCode(inputTag, TAG_INPUT_CONFIG);
      var tagRawLength = getInputRawLength(inputTag, TAG_INPUT_CONFIG);

      if (!tagCode) {
        if (tagRawLength === 0) {
          setInfoMessage("Please enter a tag code.", true);
        } else {
          setInfoMessage("Invalid format. Use " + TAG_CODE_FORMAT + ".", true);
        }
        return;
      }
    }

    if (!TAG_CODE_PATTERN.test(tagCode)) {
      setInfoMessage("Invalid format. Use " + TAG_CODE_FORMAT + ".", true);
      return;
    }

    setInfoMessage("Searching...", false);
    isTagSearching = true;

    fetch("/api/public/verify/tag?precious_code=" + encodeURIComponent(tagCode), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(function (response) {
        return response.json().then(function (result) {
          if (!response.ok || !result || !result.success) {
            var message = (result && result.message) || "Search failed";
            var searchError = new Error(message);
            searchError.status = response.status;
            searchError.notFound =
              response.status === 404 || /not found/i.test(message);
            throw searchError;
          }
          return result.data;
        });
      })
      .then(function (data) {
        renderTagSearchResult(data);
        closeSearch();
      })
      .catch(function (error) {
        if (error && error.notFound) {
          showTagNotFoundArea(tagCode);
          closeSearch();
          return;
        }

        console.error("verify tag search failed:", error);
        setInfoMessage(error.message || "Search failed", true);
      })
      .finally(function () {
        isTagSearching = false;
      });
  }

  function searchByOrderCode(forcedOrderCode) {
    if (!inputOrder) {
      return;
    }

    if (isOrderSearching) {
      return;
    }

    var orderCode = "";
    if (typeof forcedOrderCode === "string" && forcedOrderCode.trim() !== "") {
      orderCode = forcedOrderCode.trim().toUpperCase();
    } else {
      orderCode = getInputCode(inputOrder, ORDER_INPUT_CONFIG);
      var orderRawLength = getInputRawLength(inputOrder, ORDER_INPUT_CONFIG);

      if (!orderCode) {
        if (orderRawLength === 0) {
          setInfoMessage("Please enter an order code.", true);
        } else {
          setInfoMessage("Invalid format. Use " + ORDER_CODE_FORMAT + ".", true);
        }
        return;
      }
    }

    if (!ORDER_CODE_PATTERN.test(orderCode)) {
      setInfoMessage("Invalid format. Use " + ORDER_CODE_FORMAT + ".", true);
      return;
    }

    setInfoMessage("Searching...", false);
    isOrderSearching = true;

    fetch(ORDER_VERIFY_API_PATH + "?order_code=" + encodeURIComponent(orderCode), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(function (response) {
        return parseResponseJSON(response).then(function (result) {
          if (!response.ok || !result || !result.success) {
            var message = (result && result.message) || "Search failed";
            var searchError = new Error(message);
            searchError.status = response.status;
            searchError.notFound =
              response.status === 404 || /not found/i.test(message);
            throw searchError;
          }
          return result.data;
        });
      })
      .then(function (data) {
        renderOrderSearchResult(data, orderCode);
        closeSearch();
      })
      .catch(function (error) {
        if (error && error.notFound) {
          showOrderNotFoundArea(orderCode);
          closeSearch();
          return;
        }

        console.error("verify order search failed:", error);
        setInfoMessage(error.message || "Search failed", true);
      })
      .finally(function () {
        isOrderSearching = false;
      });
  }

  function handleSearchSubmit() {
    if (currentMode === "tag") {
      searchByTagCode();
      return;
    }

    searchByOrderCode();
  }

  function getSearchContextFromURL() {
    if (
      !window ||
      !window.location ||
      typeof window.URLSearchParams !== "function"
    ) {
      return null;
    }

    var query = String(window.location.search || "");
    if (!query) {
      return null;
    }

    var params = new window.URLSearchParams(query);
    var searchType = String(params.get("search") || "").trim().toLowerCase();
    var searchValue = String(params.get("value") || "").trim().toUpperCase();

    if (!searchType || !searchValue) {
      return null;
    }

    return {
      searchType: searchType,
      searchValue: searchValue,
    };
  }

  function runInitialURLSearch() {
    var context = getSearchContextFromURL();
    if (!context) {
      return;
    }

    if (context.searchType === "tag") {
      setCodeInput(inputTag, context.searchValue, TAG_INPUT_CONFIG);
      setSearchMode("tag");

      if (!TAG_CODE_PATTERN.test(context.searchValue)) {
        showTagNotFoundArea(context.searchValue);
        return;
      }

      searchByTagCode(context.searchValue);
      return;
    }

    if (context.searchType === "order") {
      setCodeInput(inputOrder, context.searchValue, ORDER_INPUT_CONFIG);
      setSearchMode("order");

      if (!ORDER_CODE_PATTERN.test(context.searchValue)) {
        showOrderNotFoundArea(context.searchValue);
        return;
      }

      searchByOrderCode(context.searchValue);
    }
  }

  function bindEnterSearch(inputElement) {
    if (!inputElement) {
      return;
    }

    inputElement.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.keyCode === 13) {
        event.preventDefault();
        handleSearchSubmit();
      }
    });
  }

  function bindEvents() {
    resetToSearchView();
    bindStrictCodeInput(inputTag, TAG_INPUT_CONFIG);
    bindStrictCodeInput(inputOrder, ORDER_INPUT_CONFIG);

    if (openTagBtn) {
      openTagBtn.addEventListener("click", function () {
        startSearchFromTopbar("tag");
      });
    }

    if (openOrderBtn) {
      openOrderBtn.addEventListener("click", function () {
        startSearchFromTopbar("order");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeSearch);
    }

    if (backToSearchBtn) {
      backToSearchBtn.addEventListener("click", function (event) {
        event.preventDefault();
        startSearchFromTopbar("tag");
      });
    }

    if (orderBackToSearchBtn) {
      orderBackToSearchBtn.addEventListener("click", function (event) {
        event.preventDefault();
        startSearchFromTopbar("order");
      });
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
        handleSearchSubmit();
      });
    }

    bindEnterSearch(inputTag);
    bindEnterSearch(inputOrder);

    document.addEventListener("keyup", function (event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        closeSearch();
      }
    });

    runInitialURLSearch();
  }

  bindEvents();
})(window);
