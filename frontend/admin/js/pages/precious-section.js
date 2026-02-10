window.bannerList = [];
window.countingDown = [];
const BANNER_TBODY_ID = "index-banner-list-tbody";
let bannerSortDrake = null;
let isPersistingBannerOrder = false;


window.addEventListener("DOMContentLoaded", function () {
  fetchAndRenderBanners();

  fetch("/api/countingdown", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("CountingDown ", data.data);
        countingDown = data.data[0];
        renderCountingDownTable(countingDown);
      } else {
        console.log(" CountingDown :", data.message);
      }
    })
    .catch((error) => {
      console.error(":", error);
    });


  document.addEventListener("click", function (e) {

    if (e.target.closest(".banner-delete-trash")) {
      const target = e.target.closest(".banner-delete-trash");
      const bannerId = target.getAttribute("data-banner-id");


      const idContainer = document.getElementById("delete-banner-id");
      if (idContainer) {
        idContainer.innerHTML = bannerId;
      }
    }
  });

  document
    .getElementById("confirm-delete-banner-btn")
    .addEventListener("click", function () {
      const id = parseInt(
        document.getElementById("delete-banner-id").innerHTML.trim()
      );

      deleteBanner(id);
    });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target && target.id === "add-banner-btn") {
      fetch("/api/banner/create", {
    method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getAddBannerForm()),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log(" Banner ");
            renderBannerTable(data.data);
            toggleAddBannerButton(data.data);


            const modal = bootstrap.Modal.getInstance(
              document.getElementById("AddBannerModal")
            );
            if (modal) modal.hide();
            clearAddBannerForm();
          } else {
            console.error(" : ", data.message);
          }
        })
        .catch((err) => {
          console.error(" : ", err);
        });
    }
  });
});

function fetchAndRenderBanners() {
  return fetch("/api/banners", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        bannerList = Array.isArray(data.data) ? data.data : [];
        renderBannerTable(bannerList);
        toggleAddBannerButton(bannerList);
      } else {
        console.log(" Banner :", data.message);
      }
    })
    .catch((error) => {
      console.error(":", error);
    });
}

function getAddBannerForm() {
  const newBanner = {
    title1: document.getElementById("add-banner-title-1").value.trim(),
    title2: document.getElementById("add-banner-title-2").value.trim(),
    subtitle: document.getElementById("add-banner-subtitle").value.trim(),
    url: document.getElementById("add-banner-url").value.trim(),
    picurl: document.getElementById("add-banner-picture-url").value.trim(),
  };
  return newBanner;
}

function clearAddBannerForm() {
  const fieldIds = [
    "add-banner-title-1",
    "add-banner-title-2",
    "add-banner-subtitle",
    "add-banner-url",
    "add-banner-picture-url",
  ];

  fieldIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = "";
    }
  });
}

function toDisplayText(value, fallback = "-") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function initTooltipsIn(scopeEl) {
  if (!scopeEl || !window.bootstrap || !window.bootstrap.Tooltip) {
    return;
  }

  scopeEl.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    const rawTitle = el.getAttribute("data-bs-title") || el.getAttribute("title");
    const safeTitle = toDisplayText(rawTitle);
    el.setAttribute("data-bs-title", safeTitle);
    el.setAttribute("title", safeTitle);
    bootstrap.Tooltip.getOrCreateInstance(el);
  });
}

function createBannerEmptyRow() {
  const row = document.createElement("tr");
  row.className = "banner-empty-row";
  row.innerHTML = '<td colspan="8" class="text-center text-muted py-3">No banners</td>';
  return row;
}

function syncBannerEmptyRow() {
  const zone = document.getElementById(BANNER_TBODY_ID);
  if (!zone) {
    return;
  }

  const dataRows = zone.querySelectorAll("tr.banner-row");
  const emptyRow = zone.querySelector("tr.banner-empty-row");

  if (dataRows.length === 0) {
    if (!emptyRow) {
      zone.appendChild(createBannerEmptyRow());
    }
  } else if (emptyRow) {
    emptyRow.remove();
  }
}

function collectBannerOrderIds() {
  const tbody = document.getElementById(BANNER_TBODY_ID);
  if (!tbody) {
    return [];
  }

  return Array.from(tbody.querySelectorAll("tr.banner-row"))
    .map((row) => Number.parseInt(row.dataset.bannerId || "", 10))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function saveBannerOrder() {
  if (isPersistingBannerOrder) {
    return;
  }

  const ids = collectBannerOrderIds();
  if (!ids.length) {
    return;
  }

  isPersistingBannerOrder = true;
  fetch("/api/banner/reorder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ids: ids }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.success) {
        console.error("Save banner order failed", data && data.message);
        fetchAndRenderBanners();
        return;
      }

      bannerList = Array.isArray(data.data) ? data.data : bannerList;
    })
    .catch((error) => {
      console.error("Save banner order failed", error);
      fetchAndRenderBanners();
    })
    .finally(() => {
      isPersistingBannerOrder = false;
    });
}

function initBannerDragAndDrop() {
  const tbody = document.getElementById(BANNER_TBODY_ID);
  if (!tbody || typeof dragula !== "function") {
    return;
  }

  if (bannerSortDrake) {
    bannerSortDrake.destroy();
    bannerSortDrake = null;
  }

  bannerSortDrake = dragula([tbody], {
    moves: function (_el, _container, handle) {
      return !!(handle && handle.closest(".dragula-handle"));
    },
  });

  bannerSortDrake.on("drag", function (el) {
    el.classList.add("banner-row-dragging");
  });

  bannerSortDrake.on("dragend", function (el) {
    el.classList.remove("banner-row-dragging");
  });

  bannerSortDrake.on("drop", function () {
    syncBannerEmptyRow();
    saveBannerOrder();
  });

  bannerSortDrake.on("cancel", function () {
    syncBannerEmptyRow();
  });
}

function getCountingDownPreciousForm() {
  const priceValue = parseFloat(
    document.getElementById("edit-countingdown-price").value.trim()
  );
  const discountValue = parseFloat(
    document.getElementById("edit-countingdown-discount").value.trim()
  );

  let percentageValue = 0;
  if (priceValue && discountValue) {
    percentageValue = -Math.round(
      ((priceValue - discountValue) / priceValue) * 100
    );
  }
  const editCountingDownPreciousData = {
    title: document.getElementById("edit-countingdown-title").value.trim(),
    price: parseInt(
      document.getElementById("edit-countingdown-price").value.trim()
    ),
    discount: parseInt(
      document.getElementById("edit-countingdown-discount").value.trim()
    ),
    percentage: `${percentageValue}%`,
    rating: parseFloat(
      document.getElementById("edit-countingdown-rating-select").value
    ),
    ddl: document.getElementById("edit-countingdown-ddl").value.trim(),
    url: document.getElementById("edit-countingdown-precious-url").value.trim(),
    picurl: document
      .getElementById("edit-countingdown-precious-picture-url")
      .value.trim(),
  };

  console.log("", editCountingDownPreciousData);
  return editCountingDownPreciousData;
}




























function renderCountingDownTable(data) {
  const tbody = document.getElementById("index-counting-down-tbody");
  const item = data || {};


  tbody.innerHTML = "";

  const pictureUrl = toDisplayText(item.picurl, "");
  const linkUrl = toDisplayText(item.url);
  const imageCellHtml = pictureUrl
    ? `<img
        src="${escapeHtmlAttr(pictureUrl)}"
        alt="table-user"
        class="me-2 avatar-xl"
      />`
    : "-";
  const linkCellHtml = `<a
      href="javascript:void(0);"
      class="link-reset fs-20 p-1 text-infjew"
      data-bs-toggle="tooltip"
      data-bs-trigger="hover"
      data-bs-title="${escapeHtmlAttr(linkUrl)}"
      title="${escapeHtmlAttr(linkUrl)}"
    >
      <i class="ti ti-link"></i>
    </a>`;

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>
      ${imageCellHtml}
    </td>
    <td>${toDisplayText(item.title)}</td>
    <td>$${toDisplayText(item.price)}</td>
    <td>$${toDisplayText(item.discount)}</td>
    <td>
      <span class="badge bg-infjew fs-12 p-1">${toDisplayText(item.percentage)}</span>
    </td>
    <td>${toDisplayText(item.rating)}</td>
    <td>${toDisplayText(item.ddl)}</td>
    <td class="text-muted">
      ${linkCellHtml}
    </td>
    <td class="text-muted">
      <a
        href="javascript:void(0);"
        class="link-reset fs-20 p-1"
        data-bs-toggle="modal"
        data-bs-target="#EditCountingDownModal"
        id="countingdown-precious-edit-btn"
      >
        <i class="ti ti-pencil"></i>
      </a>
    </td>
  `;

  tbody.appendChild(row);


  initTooltipsIn(tbody);

  document
    .getElementById("countingdown-precious-edit-btn")
    .addEventListener("click", function () {
      fillCountingDownModal(countingDown);
    });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target && target.id === "save-countingdown-precious-btn") {
      const updatedData = getCountingDownPreciousForm();

      fetch("/api/countingdown/update", {
    method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.success) {
            console.log(" ");


            fetch("/api/countingdown", {
    method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  countingDown = data.data[0];
                  renderCountingDownTable(countingDown);


                  const modal = bootstrap.Modal.getInstance(
                    document.getElementById("EditCountingDownModal")
                  );
                  if (modal) modal.hide();
                } else {
                  console.error(" :", data.message);
                }
              });
          } else {
            console.error(" :", res.message);
          }
        })
        .catch((err) => {
          console.error(" :", err);
        });
    }
  });
}

function fillCountingDownModal(data) {

  document.getElementById("edit-countingdown-title").value = data.title || "";
  document.getElementById("edit-countingdown-price").value = data.price || "";
  document.getElementById("edit-countingdown-discount").value =
    data.discount || "";
  const parsedRating = Number(data.rating);
  document.getElementById("edit-countingdown-rating-select").value =
    Number.isFinite(parsedRating) ? parsedRating.toFixed(1) : "1.0";
  document.getElementById("edit-countingdown-ddl").value = data.ddl || "";
  document.getElementById("edit-countingdown-precious-url").value =
    data.url || "";
  document.getElementById("edit-countingdown-precious-picture-url").value =
    data.picurl || "";
}

function renderBannerTable(data) {
  const tableBody = document.getElementById(BANNER_TBODY_ID);
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  data.forEach((item) => {
    const pictureUrl = toDisplayText(item.picurl, "");
    const linkUrl = toDisplayText(item.url);
    const imageCellHtml = pictureUrl
      ? `<img
          src="${escapeHtmlAttr(pictureUrl)}"
          alt="table-user"
          class="me-2 avatar-xl"
        />`
      : "-";
    const linkCellHtml = `<a
        href="javascript:void(0);"
        class="link-reset fs-20 p-1 text-infjew"
        data-bs-toggle="tooltip"
        data-bs-trigger="hover"
        data-bs-title="${escapeHtmlAttr(linkUrl)}"
        title="${escapeHtmlAttr(linkUrl)}"
        >
          <i class="ti ti-link"></i>
        </a>`;

    const row = document.createElement("tr");
    row.classList.add("banner-row");
    row.dataset.bannerId = toDisplayText(item.id, "");

    row.innerHTML = `
      <td class="text-muted align-middle">
        <span
          class="dragula-handle d-inline-flex align-items-center justify-content-center fs-18 p-1"
          data-bs-toggle="tooltip"
          data-bs-trigger="hover"
          data-bs-title="Drag by handle"
          title="Drag by handle"
        >
          <i class="ti ti-grip-vertical"></i>
        </span>
      </td>
      <td>
        ${imageCellHtml}
      </td>
      <td>${toDisplayText(item.id)}</td>
      <td>${toDisplayText(item.title1)}</td>
      <td>${toDisplayText(item.title2)}</td>
      <td>${toDisplayText(item.subtitle)}</td>
      <td class="text-muted">
        ${linkCellHtml}
      </td>
      <td class="text-muted">
        <a
          href="javascript:void(0);"
          class="link-reset fs-20 p-1 banner-delete-trash" data-banner-id="${item.id}"
          data-bs-toggle="modal"
        data-bs-target="#banner-delete-warning-modal"
          
        >
          <i class="ti ti-trash"></i>
        </a>
      </td>
    `;

    tableBody.appendChild(row);
  });


  syncBannerEmptyRow();
  initTooltipsIn(tableBody);
  initBannerDragAndDrop();
}

function toggleAddBannerButton(data) {
  const addButton = document.getElementById("add-banner-modal-btn");
  const maxBannerCount = 3;

  if (data.length >= maxBannerCount) {
    addButton.classList.add("disabled");
    addButton.setAttribute("disabled", "disabled");
  } else {
    addButton.classList.remove("disabled");
    addButton.removeAttribute("disabled");
  }
}

function deleteBanner(bannerId) {
  fetch("/api/banner/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bannerId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Banner ");

        renderBannerTable(data.data);
        toggleAddBannerButton(data.data);
      } else {
        console.log("Banner :", data.message);
      }
    })
    .catch((error) => {
      console.error(":", error);
    });
}

