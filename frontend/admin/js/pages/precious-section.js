window.bannerList = [];
window.countingDown = [];
const BANNER_SOURCE_TBODY_ID = "index-banner-list-tbody";
const BANNER_TARGET_TBODY_ID = "index-banner-list-target-tbody";
let draggedBannerRow = null;
let dragArmedBannerRow = null;
let isBannerHandleArmed = false;
let bannerDragBindingsInitialized = false;


window.addEventListener("DOMContentLoaded", function () {
  fetch("/api/banners", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Banner ", data.data);
        bannerList = data.data;
        renderBannerTable(bannerList);
        toggleAddBannerButton(bannerList);
      } else {
        console.log(" Banner :", data.message);
      }
    })
    .catch((error) => {
      console.error(":", error);
    });

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

function getBannerDropZones() {
  const sourceZone = document.getElementById(BANNER_SOURCE_TBODY_ID);
  const targetZone = document.getElementById(BANNER_TARGET_TBODY_ID);
  return [sourceZone, targetZone].filter((zone) => !!zone);
}

function createBannerEmptyRow() {
  const row = document.createElement("tr");
  row.className = "banner-empty-row";
  row.innerHTML = '<td colspan="8" class="text-center text-muted py-3">Drop banners here</td>';
  return row;
}

function syncBannerContainerEmptyRows() {
  getBannerDropZones().forEach((zone) => {
    const dataRows = zone.querySelectorAll("tr.banner-row");
    const emptyRow = zone.querySelector("tr.banner-empty-row");

    if (dataRows.length === 0) {
      if (!emptyRow) {
        zone.appendChild(createBannerEmptyRow());
      }
      return;
    }

    if (emptyRow) {
      emptyRow.remove();
    }
  });
}

function getBannerDropAfterElement(container, mouseY) {
  const draggableRows = Array.from(
    container.querySelectorAll("tr.banner-row:not(.banner-row-dragging)")
  );

  return draggableRows.reduce(
    (closest, row) => {
      const box = row.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: row };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function cleanupBannerDragState() {
  if (draggedBannerRow) {
    draggedBannerRow.classList.remove("banner-row-dragging");
    draggedBannerRow = null;
  }

  if (dragArmedBannerRow) {
    dragArmedBannerRow.removeAttribute("draggable");
  }

  document
    .querySelectorAll("tr.banner-row[draggable='true']")
    .forEach((row) => row.removeAttribute("draggable"));

  getBannerDropZones().forEach((zone) => {
    zone.classList.remove("is-drag-over");
  });

  dragArmedBannerRow = null;
  isBannerHandleArmed = false;
}

function initBannerDragAndDrop() {
  if (bannerDragBindingsInitialized) {
    return;
  }

  const zones = getBannerDropZones();
  if (zones.length === 0) {
    return;
  }

  document.addEventListener("mousedown", function (event) {
    const handle = event.target.closest(".banner-drag-handle");
    if (!handle) {
      isBannerHandleArmed = false;
      dragArmedBannerRow = null;
      return;
    }

    const row = handle.closest("tr.banner-row");
    if (!row) {
      return;
    }

    isBannerHandleArmed = true;
    dragArmedBannerRow = row;
    row.setAttribute("draggable", "true");
  });

  document.addEventListener("mouseup", function () {
    if (draggedBannerRow) {
      return;
    }
    cleanupBannerDragState();
  });

  zones.forEach((zone) => {
    zone.addEventListener("dragstart", function (event) {
      const row = event.target.closest("tr.banner-row");
      if (!row || !isBannerHandleArmed || row !== dragArmedBannerRow) {
        event.preventDefault();
        return;
      }

      draggedBannerRow = row;
      row.classList.add("banner-row-dragging");

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", row.dataset.bannerId || "");
      }
    });

    zone.addEventListener("dragover", function (event) {
      if (!draggedBannerRow) {
        return;
      }

      event.preventDefault();
      zone.classList.add("is-drag-over");

      const afterElement = getBannerDropAfterElement(zone, event.clientY);
      if (!afterElement) {
        zone.appendChild(draggedBannerRow);
      } else {
        zone.insertBefore(draggedBannerRow, afterElement);
      }
    });

    zone.addEventListener("dragleave", function (event) {
      const relatedTarget = event.relatedTarget;
      if (relatedTarget && zone.contains(relatedTarget)) {
        return;
      }
      zone.classList.remove("is-drag-over");
    });

    zone.addEventListener("drop", function (event) {
      if (!draggedBannerRow) {
        return;
      }

      event.preventDefault();
      const afterElement = getBannerDropAfterElement(zone, event.clientY);
      if (!afterElement) {
        zone.appendChild(draggedBannerRow);
      } else {
        zone.insertBefore(draggedBannerRow, afterElement);
      }

      zone.classList.remove("is-drag-over");
      syncBannerContainerEmptyRows();
    });
  });

  document.addEventListener("dragend", function () {
    syncBannerContainerEmptyRows();
    cleanupBannerDragState();
  });

  bannerDragBindingsInitialized = true;
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
    rating: parseInt(
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
  document.getElementById("edit-countingdown-rating-select").value =
    data.rating || "1";
  document.getElementById("edit-countingdown-ddl").value = data.ddl || "";
  document.getElementById("edit-countingdown-precious-url").value =
    data.url || "";
  document.getElementById("edit-countingdown-precious-picture-url").value =
    data.picurl || "";
}

function renderBannerTable(data) {
  const sourceTableBody = document.getElementById(BANNER_SOURCE_TBODY_ID);
  const targetTableBody = document.getElementById(BANNER_TARGET_TBODY_ID);

  if (!sourceTableBody) {
    return;
  }

  sourceTableBody.innerHTML = "";
  if (targetTableBody) {
    targetTableBody.innerHTML = "";
  }

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
          class="banner-drag-handle d-inline-flex align-items-center justify-content-center fs-18 p-1"
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

    sourceTableBody.appendChild(row);
  });


  syncBannerContainerEmptyRows();
  initTooltipsIn(sourceTableBody);
  if (targetTableBody) {
    initTooltipsIn(targetTableBody);
  }
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

